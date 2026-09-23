// Phase 24: the public API's data contract and its dial policy, kept pure so
// both are unit tested. The serializers are an ALLOW-LIST on purpose — the rows
// they take carry provider ids, prompts, share tokens and recording paths, and
// returning a row directly is how those leak. Adding a field here is a
// deliberate act of publishing it.

export const MAX_PAGE = 200
const DEFAULT_PAGE = 50

export interface PublicAgent {
  id: string
  name: string
  type: string
  status: string | null
  created_at: string | null
  updated_at: string | null
}

export function serializeAgent(row: Record<string, any>): PublicAgent {
  return {
    id: row.id,
    name: row.name,
    type: row.agent_type,
    status: row.status ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  }
}

export interface PublicCall {
  id: string
  agent_id: string | null
  direction: string | null
  from: string | null
  to: string | null
  started_at: string | null
  duration_secs: number | null
  status: string | null
  outcome: string | null
  /** Null until nightly reconciliation prices the call — never estimated (rule 5). */
  cost_cents: number | null
}

export function serializeCall(row: Record<string, any>): PublicCall {
  return {
    id: row.id,
    agent_id: row.agent_id ?? null,
    direction: row.direction ?? null,
    from: row.from_e164 ?? null,
    to: row.to_e164 ?? null,
    started_at: row.started_at ?? null,
    duration_secs: row.duration_secs ?? null,
    status: row.status ?? null,
    outcome: row.outcome ?? null,
    cost_cents: row.cost_cents ?? null,
  }
}

export interface PublicUsage {
  period_start: string | null
  minutes_used: number
  minutes_cap: number
  overage_minutes: number
}

/** `row` is null before the org's first call of the month; report zeros against
 *  the org's cap rather than 404, so a caller can chart a quiet period. */
export function serializeUsage(row: Record<string, any> | null, fallbackCap = 0): PublicUsage {
  if (!row) {
    return { period_start: null, minutes_used: 0, minutes_cap: fallbackCap, overage_minutes: 0 }
  }
  return {
    period_start: row.period_start ?? null,
    minutes_used: Number(row.minutes_used ?? 0),
    minutes_cap: Number(row.minutes_cap ?? fallbackCap),
    overage_minutes: Number(row.overage_minutes ?? 0),
  }
}

export interface ListParams {
  limit: number
  offset: number
}

/** Junk is ignored rather than rejected: a client paging with a stale cursor
 *  should get a first page, not a 400 it has no way to act on. */
export function parseListParams(sp: URLSearchParams): ListParams {
  // An absent param takes the default; a PRESENT one is clamped into range.
  // Number('') is 0, so the two cases have to be told apart before parsing —
  // otherwise ?limit=0 silently reads as "no limit given" and returns 50.
  const num = (name: string): number | null => {
    const raw = sp.get(name)
    if (raw === null || raw.trim() === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? Math.floor(n) : null
  }
  const limit = num('limit')
  const offset = num('offset')
  return {
    limit: limit === null ? DEFAULT_PAGE : Math.min(MAX_PAGE, Math.max(1, limit)),
    offset: offset === null ? 0 : Math.max(0, offset),
  }
}

export type CreateCallInput =
  | { ok: true; agentId: string; to: string; variables: Record<string, string> | undefined }
  | { ok: false; message: string }

// E.164: leading +, first digit 1-9, up to 15 digits total.
const E164 = /^\+[1-9]\d{1,14}$/

export function parseCreateCall(body: unknown): CreateCallInput {
  if (!body || typeof body !== 'object') return { ok: false, message: 'Body must be a JSON object.' }
  const b = body as Record<string, unknown>

  const agentId = b.agent_id
  if (typeof agentId !== 'string' || !agentId) return { ok: false, message: 'agent_id is required.' }

  const to = b.to
  if (typeof to !== 'string' || !E164.test(to)) {
    return { ok: false, message: 'to must be an E.164 number, e.g. +15551230000.' }
  }

  // Dynamic variables reach the agent prompt, so only strings pass; anything
  // else is dropped rather than coerced.
  let variables: Record<string, string> | undefined
  if (b.variables && typeof b.variables === 'object' && !Array.isArray(b.variables)) {
    const entries = Object.entries(b.variables as Record<string, unknown>).filter(
      ([, v]) => typeof v === 'string'
    ) as [string, string][]
    variables = entries.length ? Object.fromEntries(entries) : {}
  }

  return { ok: true, agentId, to, variables }
}

export interface OutboundInputs {
  agent: { id: string; status: string | null; provider_agent_id: string | null } | null
  /** The destination is on the org's opt-out list (Phase 7). */
  optedOut: boolean
  room: { blocked: boolean; slots: number; why: string | null }
  /** Phase 5 dunning: an unresolved payment failure. */
  paymentFailed: boolean
}

export type OutboundDecision =
  | { allowed: true }
  | { allowed: false; status: number; code: string; message: string }

/**
 * Everything that must be true before the API spends money on a call.
 *
 * Order matters and is asserted: compliance first. An opted-out number is
 * refused as `opted_out` even when the org is also at its concurrency ceiling,
 * because `concurrency_limit` reads as "retry shortly" and retrying a DNC number
 * is exactly the thing that must never happen.
 */
export function outboundCallDecision(i: OutboundInputs): OutboundDecision {
  if (i.optedOut) {
    return {
      allowed: false,
      status: 403,
      code: 'opted_out',
      message: 'That number is on this workspace’s opt-out list and cannot be called.',
    }
  }
  if (!i.agent) {
    return { allowed: false, status: 404, code: 'agent_not_found', message: 'No such agent in this workspace.' }
  }
  if (i.paymentFailed) {
    return {
      allowed: false,
      status: 402,
      code: 'payment_required',
      message: 'Outbound calling is paused while a payment failure is unresolved.',
    }
  }
  if (i.agent.status === 'paused') {
    return {
      allowed: false,
      status: 409,
      code: 'agent_paused',
      message: 'This agent is paused — check the workspace usage cap.',
    }
  }
  if (!i.agent.provider_agent_id) {
    return {
      allowed: false,
      status: 409,
      code: 'agent_not_ready',
      message: 'This agent has not finished provisioning.',
    }
  }
  if (i.room.blocked) {
    return {
      allowed: false,
      status: 429,
      code: 'concurrency_limit',
      message: i.room.why ?? 'At the simultaneous-call limit. Retry shortly.',
    }
  }
  return { allowed: true }
}
