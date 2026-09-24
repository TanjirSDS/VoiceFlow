import type { Db } from '@voiceflow/db'
import type { VoiceEngine } from '@voiceflow/engine'
import { makeEngine } from '../engine'
import { dialDecision } from '../concurrency'
import { apiError, apiOk, type ApiContext, type ApiHandler } from './wrapper'
import {
  outboundCallDecision,
  parseCreateCall,
  parseListParams,
  serializeAgent,
  serializeCall,
  serializeUsage,
} from './shape'

// Phase 24: the glue. Every read below runs on ctx.db, which is RLS-scoped to
// the key's org — the queries carry no org_id filter of their own because
// Postgres is what enforces the boundary, exactly as the session pages do.
// Nothing here uses the service role.

function fail(db: { error: { message: string } | null }) {
  if (db.error) throw new Error(db.error.message)
}

const AGENT_COLS = 'id, name, agent_type, status, created_at, updated_at'
const CALL_COLS = 'id, agent_id, direction, from_e164, to_e164, started_at, duration_secs, status, outcome, cost_cents'

export const listAgents: ApiHandler = async ({ db, req }) => {
  const { limit, offset } = parseListParams(new URL(req.url).searchParams)
  const res = await db
    .from('agents')
    .select(AGENT_COLS)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  fail(res)
  return apiOk({ data: (res.data ?? []).map(serializeAgent), limit, offset })
}

export const getAgent: ApiHandler = async ({ db, params }) => {
  const res = await db.from('agents').select(AGENT_COLS).eq('id', params.id).maybeSingle()
  fail(res)
  // RLS turns "another org's agent" into no row, so this 404 covers both cases
  // without telling the caller which — no probing for ids that exist elsewhere.
  if (!res.data) return apiError(404, 'not_found', 'No such agent in this workspace.')
  return apiOk(serializeAgent(res.data))
}

export const listCalls: ApiHandler = async ({ db, req }) => {
  const sp = new URL(req.url).searchParams
  const { limit, offset } = parseListParams(sp)

  let q = db.from('calls').select(CALL_COLS).order('started_at', { ascending: false })
  const agentId = sp.get('agent_id')
  const direction = sp.get('direction')
  const from = sp.get('from')
  const to = sp.get('to')
  if (agentId) q = q.eq('agent_id', agentId)
  if (direction === 'inbound' || direction === 'outbound') q = q.eq('direction', direction)
  if (from) q = q.gte('started_at', from)
  if (to) q = q.lte('started_at', to)

  const res = await q.range(offset, offset + limit - 1)
  fail(res)
  return apiOk({ data: (res.data ?? []).map(serializeCall), limit, offset })
}

export const getCall: ApiHandler = async ({ db, params }) => {
  const res = await db.from('calls').select(CALL_COLS).eq('id', params.id).maybeSingle()
  fail(res)
  if (!res.data) return apiError(404, 'not_found', 'No such call in this workspace.')
  return apiOk(serializeCall(res.data))
}

export const getUsage: ApiHandler = async ({ db, orgId }) => {
  const periodStart = `${new Date().toISOString().slice(0, 8)}01`
  const [usage, org] = await Promise.all([
    db
      .from('usage_periods')
      .select('period_start, minutes_used, minutes_cap, overage_minutes')
      .eq('period_start', periodStart)
      .maybeSingle(),
    db.from('orgs').select('minutes_cap').eq('id', orgId).maybeSingle(),
  ])
  fail(usage)
  fail(org)
  // Before the month's first call there is no period row; fall back to the
  // org's cap so the shape is stable rather than half-missing.
  return apiOk(serializeUsage(usage.data, Number(org.data?.minutes_cap ?? 0)))
}

/** Injected so the dial path is testable without a provider or a database
 *  (the repo's convention — campaign-runner takes its engine the same way). */
export interface CreateCallDeps {
  engine: () => VoiceEngine
  room: (db: Db, orgId: string) => Promise<{ blocked: boolean; slots: number; why: string | null }>
}

const createCallDeps: CreateCallDeps = {
  engine: makeEngine,
  room: async (db, orgId) => {
    const d = await dialDecision(db, orgId)
    return { blocked: d.blocked, slots: d.slots, why: d.why ?? null }
  },
}

export function makeCreateCall(deps: CreateCallDeps = createCallDeps): ApiHandler {
  return async ({ db, orgId, req }: ApiContext) => {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return apiError(400, 'invalid_body', 'Body must be valid JSON.')
    }

    const input = parseCreateCall(body)
    if (!input.ok) return apiError(400, 'invalid_request', input.message)

    // Gather every precondition, then let the pure policy rule on them. These
    // reads are RLS-scoped, so an agent id belonging to another org simply
    // comes back null and the policy answers 404 — the key cannot reach it.
    const [agentRes, optOutRes, orgRes] = await Promise.all([
      db.from('agents').select('id, status, provider_agent_id').eq('id', input.agentId).maybeSingle(),
      db.from('opt_outs').select('e164').eq('e164', input.to).maybeSingle(),
      db.from('orgs').select('payment_failed_at').eq('id', orgId).maybeSingle(),
    ])
    fail(agentRes)
    fail(optOutRes)
    fail(orgRes)

    const decision = outboundCallDecision({
      agent: agentRes.data as never,
      optedOut: !!optOutRes.data,
      room: await deps.room(db, orgId),
      paymentFailed: !!(orgRes.data as { payment_failed_at?: string | null } | null)?.payment_failed_at,
    })
    // Rule 3: this is a money loop. Nothing reaches the provider until every
    // guard above has passed — the tests assert the engine is untouched on each
    // refusal path, because a refusal that still dials is a billed call.
    if (!decision.allowed) return apiError(decision.status, decision.code, decision.message)

    const agent = agentRes.data as unknown as { provider_agent_id: string }
    const { providerCallId } = await deps
      .engine()
      .startOutboundCall(agent.provider_agent_id, input.to, input.variables)

    // 202, not 201: the calls row is written at hangup by the post-call webhook,
    // so there is no /calls/{id} to point at yet. Callers poll the list or
    // subscribe to the call.completed webhook (Phase 17).
    return apiOk(
      { status: 'queued', agent_id: input.agentId, to: input.to, provider_call_id: providerCallId },
      202
    )
  }
}

export const createCall = makeCreateCall()
