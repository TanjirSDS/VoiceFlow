// Agent learning from the judge's verdicts (2026-10-09). Shared by the Monday cron and
// the "Learn now" button. Service-role only: agent_suggestions has no member INSERT
// policy, so callers authorize first (the action pins the agent to the active org).

import type { Db } from '@voiceflow/db'
import type { AgentConfig } from '@voiceflow/engine'
import { suggestionTitle, type SuggestionPayload, type SuggestionType } from '@voiceflow/engine/templates'
import { extractSuggestions, type CallForLearning } from './learning'
import { externalNumber, recordOptOut } from './opt-out'
import { classifyCall, deriveOutcome, type ClassifierConfig } from './outcome'
import { normalizeStoredConfigSafe } from './types'

export const LEARN_WINDOW_DAYS = 7
// ponytail: judging is sequential and capped per run; batch it if a busy agent outgrows this.
const MAX_JUDGE_PER_RUN = 30

/** Monday (UTC, YYYY-MM-DD) of the week `d` falls in — the agent_suggestions.week key. */
export function mondayUtc(d: Date): string {
  const day = (d.getUTCDay() + 6) % 7
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day)).toISOString().slice(0, 10)
}

/** What the agent is told today: the global prompt plus each flow step's own goal. */
export function agentInstructions(cfg: AgentConfig): string {
  const steps = (cfg.workflow?.nodes ?? [])
    .filter((n) => n.type === 'conversation' && (n.prompt || n.staticText))
    .map((n) => `### Step: ${n.label ?? n.id}\n${n.prompt ?? n.staticText}`)
  return [cfg.systemPrompt, ...steps].filter(Boolean).join('\n\n')
}

/** Identity of a suggestion, so a re-run never re-proposes what is pending or already applied. */
export function suggestionKey(type: SuggestionType, s: SuggestionPayload): string {
  const text = s.q ?? s.instruction ?? s.topic ?? ''
  return `${type}:${text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`
}

export interface LearnRun {
  calls: number
  judgedNow: number
  titles: string[]
  costCents: number
}

interface CallRow extends CallForLearning {
  org_id: string
  direction: string
  from_e164: string | null
  to_e164: string | null
  analysis: unknown
}

export async function learnForAgent(
  db: Db,
  agent: { id: string; org_id: string; config: unknown },
  cfg: ClassifierConfig,
  opts: { since: Date; week: string }
): Promise<LearnRun | null> {
  const stored = normalizeStoredConfigSafe(agent.config)
  if (!stored) return null

  const { data, error } = await db
    .from('calls')
    .select('id, org_id, direction, from_e164, to_e164, outcome, transcript, judgement, analysis')
    .eq('agent_id', agent.id)
    .eq('org_id', agent.org_id)
    .gte('started_at', opts.since.toISOString())
    .not('transcript', 'is', null)
    .order('started_at', { ascending: false })
    .limit(200)
  if (error) throw new Error(error.message)
  const calls = ((data ?? []) as CallRow[]).filter((c) => Array.isArray(c.transcript) && c.transcript.length > 0)
  if (!calls.length) return { calls: 0, judgedNow: 0, titles: [], costCents: 0 }

  // Learning reads the judge's verdicts, so judge anything the per-call job missed first.
  let judgedNow = 0
  for (const call of calls.filter((c) => !c.judgement).slice(0, MAX_JUDGE_PER_RUN)) {
    const result = await classifyCall(call.transcript, cfg)
    if (!result?.judgement) continue
    call.judgement = result.judgement
    judgedNow++
    const derived = call.outcome ? null : deriveOutcome(result, call.analysis as never)
    await db
      .from('calls')
      .update({ judgement: result.judgement, ...(derived && { outcome: derived.outcome, summary: derived.summary }) })
      .eq('id', call.id)
    if (derived) call.outcome = derived.outcome
    // Same compliance step as the classify-call job: "remove me" is permanent.
    if (derived?.outcome === 'opt_out') {
      const e164 = externalNumber(call)
      if (e164) await recordOptOut(db, call.org_id, e164)
    }
  }

  const result = await extractSuggestions(
    { instructions: agentInstructions(stored.agentConfig), profile: stored.seed },
    calls,
    cfg
  )
  if (!result) return null

  const { data: known } = await db
    .from('agent_suggestions')
    .select('type, suggestion')
    .eq('agent_id', agent.id)
    .in('status', ['pending', 'applied'])
  const seen = new Set((known ?? []).map((k) => suggestionKey(k.type as SuggestionType, k.suggestion as SuggestionPayload)))
  const fresh = result.suggestions.filter((s) => {
    const key = suggestionKey(s.type, s.suggestion)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  if (fresh.length) {
    const { error: insErr } = await db.from('agent_suggestions').insert(
      fresh.map((s) => ({
        org_id: agent.org_id,
        agent_id: agent.id,
        week: opts.week,
        type: s.type,
        suggestion: s.suggestion,
        evidence: s.evidence,
      }))
    )
    if (insErr) throw new Error(insErr.message)
  }
  console.log(
    `agent-learning ${agent.id}: ${calls.length} calls (${judgedNow} judged now, ${result.skippedCalls} over budget), ` +
      `${fresh.length} new suggestions (${result.suggestions.length - fresh.length} duplicates), ~${result.costCents.toFixed(3)}¢`
  )
  return {
    calls: calls.length,
    judgedNow,
    titles: fresh.map((s) => suggestionTitle(s.type, s.suggestion)),
    costCents: result.costCents,
  }
}
