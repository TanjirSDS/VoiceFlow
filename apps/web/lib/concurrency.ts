import { getEnv, type SupabaseClient } from '@voiceflow/db'
import {
  dialHeadroom,
  liveConcurrency,
  peakConcurrency,
  type DialDecision,
  type LiveCallRow,
} from './concurrency-math'

// Phase 20 (architecture §3, §8 row 6). The reads behind the concurrency
// ceiling: what is live right now (the dial guard) and what the peak has been
// (the 80%-of-pool alert). The math is in concurrency-math.ts and is unit
// tested; this file is only the glue to the rows.

// Longest a single call is assumed to still be running. Bounds the live read to
// a couple of hours of calls instead of the whole table (calls_started_at_idx).
const LIVE_WINDOW_MINS = 120

/** Simultaneous calls OUR ElevenLabs plan allows, shared by every tenant (§3). */
function poolLimit(): number {
  return getEnv().ELEVENLABS_MAX_CONCURRENCY
}

/** The org's own ceiling, from its plan. Falls back to the column default. */
async function orgConcurrencyLimit(db: SupabaseClient, orgId: string): Promise<number> {
  const { data, error } = await db
    .from('orgs')
    // Explicit FK hint: orgs points at plans twice (plan_id + pending_plan_id).
    .select('plans!orgs_plan_id_fkey(max_concurrent)')
    .eq('id', orgId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  const plan = data?.plans as unknown as { max_concurrent: number } | null
  return plan?.max_concurrent ?? 2
}

async function callRows(db: SupabaseClient, orgId: string | null, sinceIso: string) {
  let q = db
    .from('calls')
    .select('provider_call_id, started_at, duration_secs, org_id')
    .gte('started_at', sinceIso)
  if (orgId) q = q.eq('org_id', orgId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data ?? []
}

const toInterval = (c: { provider_call_id: string | null; started_at: string | null; duration_secs: number | null }): LiveCallRow => ({
  providerCallId: c.provider_call_id,
  startedAt: c.started_at,
  durationSecs: c.duration_secs,
})

/**
 * Live concurrency for one org AND for the whole shared pool, from a single
 * snapshot. Deliberately one pair of reads rather than two: separate org and
 * pool queries can disagree (an org count taken after a pool count can exceed
 * it), and the guard compares them against each other.
 */
async function liveSnapshot(db: SupabaseClient, orgId: string, now: Date) {
  const since = new Date(now.getTime() - LIVE_WINDOW_MINS * 60_000).toISOString()
  const [calls, flagged] = await Promise.all([
    callRows(db, null, since),
    // The only live trace of a call in progress — see liveConcurrency for why
    // the calls row alone cannot answer this.
    db
      .from('campaign_contacts')
      .select('provider_call_id, campaigns!inner(org_id)')
      .eq('status', 'calling')
      .then(({ data, error }) => {
        if (error) throw new Error(error.message)
        return data ?? []
      }),
  ])

  const orgOf = (f: { campaigns: unknown }) => {
    const c = Array.isArray(f.campaigns) ? f.campaigns[0] : f.campaigns
    return (c as { org_id?: string } | null)?.org_id ?? null
  }
  const flag = (f: { provider_call_id: string | null }) => ({ providerCallId: f.provider_call_id })

  return {
    pool: liveConcurrency(calls.map(toInterval), flagged.map(flag), now),
    org: liveConcurrency(
      calls.filter((c) => c.org_id === orgId).map(toInterval),
      flagged.filter((f) => orgOf(f) === orgId).map(flag),
      now
    ),
  }
}

/**
 * Dial-time ceiling for one org: blocked when the org is at its plan limit OR
 * the shared pool is full, whichever binds first (§8 row 6).
 */
export async function dialDecision(
  db: SupabaseClient,
  orgId: string,
  now = new Date()
): Promise<DialDecision> {
  const [orgLimit, live] = await Promise.all([
    orgConcurrencyLimit(db, orgId),
    liveSnapshot(db, orgId, now),
  ])
  return dialHeadroom({ orgLive: live.org, orgLimit, poolLive: live.pool, poolLimit: poolLimit() })
}

export interface PeakWindow {
  peak: number
  /** When the peak was first reached, ISO — null when there were no calls. */
  at: string | null
  limit: number
  /** peak as a percentage of limit, rounded. */
  pct: number
}

/** Peak across every tenant since `sinceIso` — what the shared pool actually saw. */
export async function poolPeak(db: SupabaseClient, sinceIso: string): Promise<PeakWindow> {
  const { peak, at } = peakConcurrency((await callRows(db, null, sinceIso)).map(toInterval))
  const limit = poolLimit()
  return { peak, at, limit, pct: limit > 0 ? Math.round((peak / limit) * 100) : 0 }
}
