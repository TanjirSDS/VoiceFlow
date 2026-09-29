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

export interface CallOutcome {
  outcome: Outcome
  summary: string
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

const SYSTEM_PROMPT = `You classify transcripts of phone calls handled by an AI voice agent for a small business.
Reply with JSON only: {"outcome": "<one of: ${OUTCOMES.join(', ')}>", "summary": "<one line, max 20 words>"}.
Definitions:
- booked: an appointment/reservation/job was scheduled or confirmed.
- lead_captured: caller's contact details were collected for follow-up, but nothing was booked.
- question_answered: the caller's question was answered; no booking or follow-up needed.
- escalated: the call was handed off to a human or the caller was told a human will call back for something the agent could not handle.
- voicemail: the call reached a voicemail/answering machine.
- spam: robocall, telemarketer, or clearly unwanted caller.
- failed: the call failed or ended before any meaningful exchange.
- opt_out: the person asked not to be called again, to be removed from a list, or to stop receiving calls. This overrides every other outcome — if they asked to be removed at any point, the outcome is opt_out.`

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

export function parseOutcome(content: string): CallOutcome | null {
  try {
    // Non-OpenAI models often wrap the object in ```json fences or prose.
    const parsed = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1))
    if ((OUTCOMES as readonly string[]).includes(parsed.outcome) && typeof parsed.summary === 'string') {
      return { outcome: parsed.outcome, summary: parsed.summary.slice(0, 300) }
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

/** fetchFn is injectable so the fixture test never talks to a model. */
export async function classifyCall(
  transcript: unknown,
  cfg: ClassifierConfig | null,
  fetchFn: typeof fetch = fetch
): Promise<CallOutcome | null> {
  if (!cfg || !Array.isArray(transcript)) return null
  const messages = buildMessages(transcript as Turn[])
  if (!messages[1].content) return null // nothing said → nothing to classify

  const res = await fetchFn(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages,
    }),
  })
  if (!res.ok) {
    // Still best-effort, but a misconfigured custom endpoint shouldn't be silent.
    console.warn(`classifier ${cfg.model} → HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return null
  }
  const data = await res.json()
  return parseOutcome(data.choices?.[0]?.message?.content ?? '')
}
