// Phase 8, reworked 2026-10-09: the agent learns from the JUDGE's verdicts. One
// structured pass per agent over its recent calls — each transcript plus the judge's
// (Jev's) judgement of it — compared against the agent's CURRENT instructions →
// improvement suggestions with verbatim evidence. Runs on the same OpenAI-compatible
// endpoint + model as the judge (classifierConfig). No config or any failure → no
// suggestions; never throws past extractSuggestions' caller.

import type { BusinessProfile, SuggestionPayload, SuggestionType } from '@voiceflow/engine/templates'
import { SUGGESTION_TYPES } from '@voiceflow/engine/templates'
import { extractJsonObject, type ClassifierConfig, type Judgement } from './outcome'

// Token caps (item 2): per-call and whole-prompt character budgets, plus a hard
// output cap. ~4 chars/token → the prompt stays under ~20k tokens. The output cap
// leaves room for a reasoning model (Jev) to think before the JSON.
export const MAX_CALL_CHARS = 2_000
export const MAX_BATCH_CHARS = 60_000
export const MAX_INSTRUCTION_CHARS = 16_000
export const MAX_OUTPUT_TOKENS = 8_000
export const MAX_SUGGESTIONS = 8

export interface CallForLearning {
  id: string
  outcome: string | null
  transcript: { role?: string; message?: string | null }[]
  judgement?: Judgement | null
}

/** What the agent already knows: its live instructions, plus the seed profile when it has one. */
export interface LearningContext {
  instructions: string
  profile?: BusinessProfile | null
}

const judgeLine = (j: Judgement) =>
  `Judge: outcome=${j.outcome}; lead score=${j.lead_score ?? 'n/a'}; intent=${j.intent ?? 'n/a'}; ` +
  `objection=${j.objection ?? 'n/a'}; sentiment=${j.sentiment ?? 'n/a'}; next action=${j.next_action ?? 'n/a'}; ` +
  `reason="${j.reason ?? ''}"`

export interface ExtractedSuggestion {
  type: SuggestionType
  suggestion: SuggestionPayload
  evidence: { callId: string; quote: string }[]
}

export function renderCall(call: CallForLearning): string {
  const lines = (call.transcript ?? [])
    .filter((t) => t.message)
    .map((t) => `${t.role === 'agent' ? 'Agent' : 'Caller'}: ${t.message}`)
    .join('\n')
  const judge = call.judgement ? `${judgeLine(call.judgement)}\n` : ''
  return `### Call ${call.id} (outcome: ${call.outcome ?? 'unknown'})\n${judge}${lines.slice(0, MAX_CALL_CHARS)}`
}

/** Newest-first until the batch budget is spent; returns how many were dropped. */
export function batchCalls(calls: CallForLearning[]): { rendered: string[]; skipped: number } {
  const rendered: string[] = []
  let used = 0
  for (const call of calls) {
    const r = renderCall(call)
    if (used + r.length > MAX_BATCH_CHARS) break
    rendered.push(r)
    used += r.length
  }
  return { rendered, skipped: calls.length - rendered.length }
}

const SYSTEM_PROMPT = `You review recent phone calls handled by an AI voice agent for a business, and extract concrete improvements to the agent's instructions.
Each call comes with the transcript and a "Judge:" line — an independent judge's verdict on that call (outcome, lead score, intent, objection, sentiment, next action, reason). Use the verdicts to find what to fix: repeated objections the agent handled badly, negative sentiment, low lead scores on callers who sounded interested, escalations or failures the agent could have avoided, questions it could not answer. Always confirm the problem in the transcript itself before suggesting a fix.

Emit suggestions of exactly these types:
- faq_addition: a question callers actually asked that the agent could not answer (or answered wrong). Only emit one when a correct answer is evident from the transcripts or the business facts; put the question in "q" and the answer in "a". If the same question was asked in several calls, set "frequency" to the number of calls and cite each as evidence.
- prompt_tweak: a short imperative instruction that would have made calls go better (e.g. wording to avoid, information to volunteer). Put it in "instruction".
- escalation_rule: a rule for when to hand off to a human, learned from calls that escalated or failed. Put it in "instruction".
- kb_gap: callers wanted information (or a service) the business facts do not cover and no transcript answers — only the owner can supply it. Put what is missing in "topic". Use this instead of faq_addition when you cannot know the answer.

Rules:
- Every suggestion MUST cite evidence: the call id from the "### Call <id>" header and a short verbatim quote from that transcript.
- Do not suggest what the agent's current instructions already cover. Do not invent facts, prices, or policies.
- Set "rationale" to one short line on why this helps, citing the judge's verdict when it drove the suggestion.
- At most ${MAX_SUGGESTIONS} suggestions, most impactful first. No suggestions is a fine answer.
Reply with JSON only: {"suggestions": [{"type": "...", "suggestion": {...}, "evidence": [{"callId": "...", "quote": "..."}]}]}`

export function buildLearningMessages(ctx: LearningContext, calls: CallForLearning[]) {
  const { rendered, skipped } = batchCalls(calls)
  const p = ctx.profile
  const facts = p
    ? [
        `Business: ${p.businessName} (${p.industry})`,
        `Hours: ${p.hours}`,
        `Services: ${p.services.join(', ') || '(none listed)'}`,
        `Current FAQs:\n${p.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n') || '(none)'}`,
      ].join('\n')
    : ''
  const sections = [
    `## The agent's current instructions\n${ctx.instructions.slice(0, MAX_INSTRUCTION_CHARS) || '(none)'}`,
    facts && `## Business facts\n${facts}`,
    `## Recent calls with the judge's verdicts (${rendered.length} calls)\n${rendered.join('\n\n')}`,
  ]
  return {
    skipped,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: sections.filter(Boolean).join('\n\n') },
    ],
  }
}

/** Validate the model output; unknown types, empty evidence, and evidence
 *  pointing at call ids that were never in the batch are dropped. */
export function parseSuggestions(content: string, validCallIds: Set<string>): ExtractedSuggestion[] {
  const parsed = extractJsonObject(content) // tolerates reasoning prose before the object
  const raw = (parsed as { suggestions?: unknown } | null)?.suggestions
  if (!Array.isArray(raw)) return []
  const out: ExtractedSuggestion[] = []
  for (const item of raw) {
    if (out.length >= MAX_SUGGESTIONS) break
    const type = item?.type as SuggestionType
    if (!(SUGGESTION_TYPES as readonly string[]).includes(type)) continue
    const evidence = (Array.isArray(item?.evidence) ? item.evidence : [])
      .filter(
        (e: { callId?: unknown; quote?: unknown }) =>
          typeof e?.callId === 'string' && typeof e?.quote === 'string' && validCallIds.has(e.callId)
      )
      .map((e: { callId: string; quote: string }) => ({ callId: e.callId, quote: e.quote.slice(0, 500) }))
    if (!evidence.length) continue // no verifiable evidence → not a suggestion
    if (typeof item?.suggestion !== 'object' || item.suggestion === null) continue
    out.push({ type, suggestion: item.suggestion as SuggestionPayload, evidence })
  }
  return out
}

export interface LearningResult {
  suggestions: ExtractedSuggestion[]
  skippedCalls: number
  promptTokens: number
  completionTokens: number
  costCents: number
}

/** fetchFn is injectable so tests never talk to a model. */
export async function extractSuggestions(
  ctx: LearningContext,
  calls: CallForLearning[],
  cfg: ClassifierConfig,
  fetchFn: typeof fetch = fetch
): Promise<LearningResult | null> {
  if (!calls.length) return null
  const { messages, skipped } = buildLearningMessages(ctx, calls)
  const res = await fetchFn(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0,
      max_tokens: MAX_OUTPUT_TOKENS,
      response_format: { type: 'json_object' },
      messages,
    }),
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok) {
    console.warn(`learning ${cfg.model} → HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return null
  }
  const data = await res.json()
  const suggestions = parseSuggestions(
    data.choices?.[0]?.message?.content ?? '',
    new Set(calls.map((c) => c.id))
  )
  const promptTokens = data.usage?.prompt_tokens ?? 0
  const completionTokens = data.usage?.completion_tokens ?? 0
  return {
    suggestions,
    skippedCalls: skipped,
    promptTokens,
    completionTokens,
    // OpenRouter reports the billed cost in dollars; other servers may not.
    costCents: typeof data.usage?.cost === 'number' ? data.usage.cost * 100 : 0,
  }
}
