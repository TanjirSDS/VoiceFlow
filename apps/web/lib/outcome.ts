// The single model+prompt module for call outcome extraction (Phase 3 item 3).
// One cheap LLM call per finished call, best-effort: any failure → null, the
// call row just keeps outcome/summary null.

import type { Env } from '@voiceflow/db'
import type { CallAnalysis } from '@voiceflow/engine'

export const OUTCOMES = [
  'booked',
  'lead_captured',
  'question_answered',
  'escalated',
  'voicemail',
  'spam',
  'failed',
  'opt_out',
] as const
export type Outcome = (typeof OUTCOMES)[number]

// S1: Jev's per-call judgement, stored whole in calls.judgement. Every field
// past outcome/summary is nullable: anything not evident in the transcript (or
// invalid in the reply) is null, never a guess.
export const STAGES = ['new', 'interested', 'considering', 'ready', 'customer', 'lost'] as const
export const OBJECTIONS = ['price', 'timing', 'trust', 'need', 'competitor', 'other', 'none'] as const
export const URGENCIES = ['low', 'medium', 'high'] as const
export const SENTIMENTS = ['positive', 'neutral', 'negative'] as const
export const NEXT_ACTIONS = ['none', 'callback', 'send_info', 'book', 'escalate'] as const

export interface Judgement {
  outcome: Outcome
  summary: string
  intent: string | null
  lead_score: number | null
  stage: (typeof STAGES)[number] | null
  objection: (typeof OBJECTIONS)[number] | null
  urgency: (typeof URGENCIES)[number] | null
  sentiment: (typeof SENTIMENTS)[number] | null
  next_action: (typeof NEXT_ACTIONS)[number] | null
  callback_hint: string | null
  reason: string | null
  /** The judging model (e.g. typesafe/jev-router). Absent on judgements written before 2026-10-09. */
  model?: string
}

export interface CallOutcome {
  outcome: Outcome
  summary: string
  judgement?: Judgement
}

/** Fixed outcome → categorical color map for charts/badges (validated with the dataviz palette checker). */
export const OUTCOME_COLORS: Record<Outcome, string> = {
  booked: '#2a78d6',
  lead_captured: '#1baf7a',
  question_answered: '#eda100',
  escalated: '#4a3aa7',
  voicemail: '#e87ba4',
  spam: '#eb6834',
  failed: '#e34948',
  opt_out: '#77777c',
}

/** Display name of the judge: "Jev" for typesafe/jev-router, otherwise the generic "AI". */
export const judgeName = (model?: string | null) => (model?.toLowerCase().includes('jev') ? 'Jev' : 'AI')

/** Where the classifier sends transcripts. null = classification off. */
export interface ClassifierConfig {
  baseUrl: string
  model: string
  apiKey: string
}

export function classifierConfig(
  env: Pick<Env, 'CLASSIFIER_BASE_URL' | 'CLASSIFIER_MODEL' | 'CLASSIFIER_API_KEY' | 'OPENAI_API_KEY'>
): ClassifierConfig | null {
  const apiKey = env.CLASSIFIER_API_KEY ?? env.OPENAI_API_KEY
  if (!apiKey) return null
  return { baseUrl: env.CLASSIFIER_BASE_URL.replace(/\/+$/, ''), model: env.CLASSIFIER_MODEL, apiKey }
}

const SYSTEM_PROMPT = `You judge transcripts of phone calls handled by an AI voice agent for a small business.
Judge ONLY from what is said in the transcript. If a field is not evident from the transcript, use null. Never invent names, dates, prices or intentions.
Reply with JSON only, exactly these keys:
{"outcome": "<one of: ${OUTCOMES.join(', ')}>",
 "summary": "<one line, max 20 words>",
 "intent": "<what the caller wanted, max 8 words>" or null,
 "lead_score": <integer 0-100>,
 "stage": "<one of: ${STAGES.join(', ')}>" or null,
 "objection": "<one of: ${OBJECTIONS.join(', ')}>" or null,
 "urgency": "<one of: ${URGENCIES.join(', ')}>" or null,
 "sentiment": "<one of: ${SENTIMENTS.join(', ')}>" or null,
 "next_action": "<one of: ${NEXT_ACTIONS.join(', ')}>" or null,
 "callback_hint": "<when/how the caller asked to be called back, in their words>" or null,
 "reason": "<max 25 words, citing what the caller said>"}
Outcome definitions:
- booked: an appointment/reservation/job was scheduled or confirmed.
- lead_captured: caller's contact details were collected for follow-up, but nothing was booked.
- question_answered: the caller's question was answered; no booking or follow-up needed.
- escalated: the call was handed off to a human or the caller was told a human will call back for something the agent could not handle.
- voicemail: the call reached a voicemail/answering machine.
- spam: robocall, telemarketer, or clearly unwanted caller.
- failed: the call failed or ended before any meaningful exchange.
- opt_out: the person asked not to be called again, to be removed from a list, or to stop receiving calls. This overrides every other outcome — if they asked to be removed at any point, the outcome is opt_out, next_action is none and callback_hint is null.
lead_score bands: 0-20 spam or no interest; 21-50 curious, just asking; 51-79 interested but has an objection or is not ready yet; 80-100 ready to buy or booked.
stage: new = first contact, interest unclear; interested = wants the service; considering = weighing it up or has an objection; ready = wants to go ahead or booked; customer = already an existing customer; lost = not interested, spam or opted out.
objection: what held the caller back; none if they raised no objection.
next_action: callback = caller explicitly asked to be called back; send_info = caller asked for information to be sent; book = caller wants to book but nothing is booked yet; escalate = needs a human; none = nothing further needed, or the caller only left contact details without asking to be called.
Tie-breaks: decide quickly. When two values fit, pick the more conservative one (lower lead_score band, none, or null). callback_hint is null unless the caller asked to be called back.`

interface Turn {
  role?: string
  message?: string | null
}

export function buildMessages(transcript: Turn[]) {
  const lines = transcript
    .filter((t) => t.message)
    .map((t) => `${t.role === 'agent' ? 'Agent' : 'Caller'}: ${t.message}`)
    .join('\n')
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: lines },
  ]
}

/**
 * The first JSON object in a reply that parses. Reasoning models (Jev) write their
 * thinking in prose BEFORE the object, and that prose can contain stray braces, so
 * try each '{' in turn (outermost first) up to the last '}'.
 */
export function extractJsonObject(content: string): any {
  const end = content.lastIndexOf('}')
  for (let start = content.indexOf('{'); start !== -1 && start < end; start = content.indexOf('{', start + 1)) {
    try {
      return JSON.parse(content.slice(start, end + 1))
    } catch {
      /* not this brace — try the next one */
    }
  }
  return null
}

const oneOf = <T extends readonly string[]>(list: T, v: unknown): T[number] | null =>
  (list as readonly unknown[]).includes(v) ? (v as T[number]) : null
const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)

export function parseOutcome(content: string): CallOutcome | null {
  try {
    // Non-OpenAI models wrap the object in ```json fences or reasoning prose.
    const p = extractJsonObject(content)
    if (p && (OUTCOMES as readonly string[]).includes(p.outcome) && typeof p.summary === 'string') {
      const summary = p.summary.slice(0, 300)
      const optOut = p.outcome === 'opt_out' // never suggest calling back someone who asked to be removed
      const judgement: Judgement = {
        outcome: p.outcome,
        summary,
        intent: text(p.intent, 120),
        lead_score:
          typeof p.lead_score === 'number' && p.lead_score >= 0 && p.lead_score <= 100 ? Math.round(p.lead_score) : null,
        stage: oneOf(STAGES, p.stage),
        objection: oneOf(OBJECTIONS, p.objection),
        urgency: oneOf(URGENCIES, p.urgency),
        sentiment: oneOf(SENTIMENTS, p.sentiment),
        next_action: optOut ? 'none' : oneOf(NEXT_ACTIONS, p.next_action),
        callback_hint: optOut ? null : text(p.callback_hint, 200),
        reason: text(p.reason, 300),
      }
      return { outcome: p.outcome, summary, judgement }
    }
  } catch {
    /* model returned non-JSON — treat as no classification */
  }
  return null
}

/**
 * Phase 12 outcome precedence — where ElevenLabs-native analysis meets our
 * gpt-4o-mini classifier. The classifier still owns the rich label, the summary,
 * and opt_out detection (none of which EL's analysis provides). EL's success
 * verdict is *preferred* only where it is decisive:
 *  - opt_out from the classifier is sacred (Phase 7 compliance) — it wins over EL.
 *  - Otherwise an EL 'failure' verdict overrides an optimistic classifier label
 *    → 'failed'. ('success'/'unknown' has no 1:1 map to our enum — booked vs
 *    question vs lead — so we keep the classifier's finer label.)
 *  - With analysis but no classifier (no OPENAI_API_KEY): an EL 'failure' still
 *    sets 'failed'; a 'success'/'unknown' yields nothing (stays unclassified).
 *  - No analysis at all → the classifier is the sole source (unchanged Phase 3).
 */
export function deriveOutcome(
  classified: CallOutcome | null,
  analysis: CallAnalysis | null | undefined
): CallOutcome | null {
  if (classified) {
    if (classified.outcome === 'opt_out') return classified
    if (analysis?.success === false) return { outcome: 'failed', summary: classified.summary }
    return classified
  }
  if (analysis?.success === false) return { outcome: 'failed', summary: '' }
  return null
}

// Jev (typesafe/jev-router) reasons in the reply BEFORE the JSON. At 400 tokens it ran out
// mid-thought on 4 of 12 calls; at 4000 it finished 24/24 (bench 2026-10-09: p50 4.1 s,
// p90 5.6 s, ~$0.0007/call). The judgement itself is ~150 tokens.
const MAX_TOKENS = 4000
const TIMEOUT_MS = 60_000
const ATTEMPTS = 2

/** fetchFn is injectable so the fixture test never talks to a model. */
export async function classifyCall(
  transcript: unknown,
  cfg: ClassifierConfig | null,
  fetchFn: typeof fetch = fetch
): Promise<CallOutcome | null> {
  if (!cfg || !Array.isArray(transcript)) return null
  const messages = buildMessages(transcript as Turn[])
  if (!messages[1].content) return null // nothing said → nothing to classify

  // A router picks the path per request, so a second attempt can succeed where the first
  // ran long. Every failure stays best-effort: the call row just stays unjudged.
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetchFn(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: cfg.model,
          temperature: 0,
          max_tokens: MAX_TOKENS,
          response_format: { type: 'json_object' },
          messages,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) {
        // A misconfigured custom endpoint shouldn't be silent; a 4xx won't fix itself.
        console.warn(`classifier ${cfg.model} → HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
        if (res.status < 500) return null
        continue
      }
      const data = await res.json()
      const parsed = parseOutcome(data.choices?.[0]?.message?.content ?? '')
      if (parsed) {
        if (parsed.judgement) parsed.judgement.model = cfg.model
        return parsed
      }
      console.warn(`classifier ${cfg.model} → unparseable reply (attempt ${attempt}/${ATTEMPTS})`)
    } catch (e) {
      console.warn(`classifier ${cfg.model} failed (attempt ${attempt}/${ATTEMPTS}): ${e instanceof Error ? e.message : e}`)
    }
  }
  return null
}
