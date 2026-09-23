// Phase 20: the overlap math behind the concurrency ceiling (architecture §3).
// ElevenLabs bills minutes but CAPS simultaneous calls, so the number that
// forces a plan upgrade is peak concurrency — which no single row records. It
// has to be derived from the intervals calls occupy: [started_at, +duration).

/** One call's slot occupancy. `durationSecs: null` = still in flight (no end yet). */
export interface CallInterval {
  startedAt: string | null
  durationSecs: number | null
}

/** Milliseconds a call occupies, or null when the row can't be placed on a timeline. */
function bounds(call: CallInterval): { start: number; end: number } | null {
  if (!call.startedAt) return null
  const start = Date.parse(call.startedAt)
  if (Number.isNaN(start)) return null
  const dur = call.durationSecs ?? null
  // In flight: holds its slot until something says otherwise.
  if (dur === null) return { start, end: Infinity }
  // A 0-second call (unanswered/failed) never held a slot — counting it would
  // turn a pile of failed dials into a fake concurrency spike.
  if (dur <= 0) return null
  return { start, end: start + dur * 1000 }
}

/**
 * Highest number of calls in progress at the same instant, and when that was
 * first reached. Sweep line over start/end events: intervals are half-open
 * [start, end), so a call ending exactly as the next starts is NOT an overlap
 * — closed intervals would inflate every back-to-back dial into a peak of 2.
 */
export function peakConcurrency(calls: CallInterval[]): { peak: number; at: string | null } {
  const events: { t: number; delta: number }[] = []
  for (const call of calls) {
    const b = bounds(call)
    if (!b) continue
    events.push({ t: b.start, delta: 1 })
    if (b.end !== Infinity) events.push({ t: b.end, delta: -1 })
  }
  // Ends before starts at the same instant — that IS the half-open rule.
  events.sort((a, b) => a.t - b.t || a.delta - b.delta)

  let live = 0
  let peak = 0
  let at: number | null = null
  for (const e of events) {
    live += e.delta
    if (live > peak) {
      peak = live
      at = e.t
    }
  }
  return { peak, at: at === null ? null : new Date(at).toISOString() }
}

/** How many of these calls are in progress at one instant (same half-open rule). */
export function concurrentAt(calls: CallInterval[], at: Date): number {
  const t = at.getTime()
  let live = 0
  for (const call of calls) {
    const b = bounds(call)
    if (b && b.start <= t && t < b.end) live++
  }
  return live
}

/** A calls row, with the provider id that links it to a dialed contact. */
export interface LiveCallRow extends CallInterval {
  providerCallId: string | null
}

/**
 * Calls holding a provider slot right now, merged from the only two things that
 * can know about one:
 *   * `calls` rows — but the post-call webhook writes those at HANGUP, so a call
 *     in progress usually has no row at all; and
 *   * campaign_contacts still flagged 'calling' — the live trace of an outbound
 *     dial, which is what the guard mostly runs on.
 * Deduped by provider_call_id with the calls row winning: when a missed webhook
 * strands a contact on 'calling', the row nightly reconcile writes is what ends
 * its interval and releases the slot.
 *
 * Blind spot worth naming: an INBOUND call in progress has neither, so the pool
 * count is a floor, not a census. Closing that needs a row written at ring time.
 */
export function liveConcurrency(
  calls: LiveCallRow[],
  inFlight: { providerCallId: string | null }[],
  now: Date
): number {
  const known = new Set(calls.map((c) => c.providerCallId).filter((id): id is string => !!id))
  const intervals: CallInterval[] = calls.map((c) => ({
    startedAt: c.startedAt,
    durationSecs: c.durationSecs,
  }))
  for (const f of inFlight) {
    if (f.providerCallId && known.has(f.providerCallId)) continue
    // No row yet → treat it as started and open-ended: it holds a slot now.
    intervals.push({ startedAt: now.toISOString(), durationSecs: null })
  }
  return concurrentAt(intervals, now)
}

export interface ConcurrencySnapshot {
  orgLive: number
  orgLimit: number
  poolLive: number
  poolLimit: number
}

export interface DialDecision {
  blocked: boolean
  /** How many more calls may be started right now. */
  slots: number
  why: string | null
}

/**
 * The dial-time ceiling (§8 row 6): an org is capped by its own plan AND by the
 * pool every tenant shares, so the binding limit is whichever runs out first.
 */
export function dialHeadroom(s: ConcurrencySnapshot): DialDecision {
  const orgFree = Math.max(0, s.orgLimit - s.orgLive)
  const poolFree = Math.max(0, s.poolLimit - s.poolLive)
  const slots = Math.min(orgFree, poolFree)
  if (slots > 0) return { blocked: false, slots, why: null }
  return {
    blocked: true,
    slots: 0,
    why:
      orgFree === 0
        ? `org at its plan concurrency limit (${s.orgLive}/${s.orgLimit} calls)`
        : `shared provider pool full (${s.poolLive}/${s.poolLimit} calls)`,
  }
}

/**
 * Where the 80% alert fires (§8 row 6: "upgrade ElevenLabs tier ahead of the
 * curve" — the warning has to arrive BEFORE calls start getting rejected).
 * One constant so the dashboard meter and the pool alert can never disagree
 * about what "approaching the ceiling" means.
 */
export const CONCURRENCY_WARN_PCT = 80

export type ConcurrencyState = 'ok' | 'approaching' | 'at_limit'

/** Severity of a peak against its ceiling. Drives the meter AND the alert. */
export function concurrencyState(peak: number, limit: number): ConcurrencyState {
  if (limit <= 0) return 'ok'
  if (peak >= limit) return 'at_limit'
  return (peak / limit) * 100 >= CONCURRENCY_WARN_PCT ? 'approaching' : 'ok'
}
