import { describe, expect, it } from 'vitest'
import {
  concurrencyState,
  concurrentAt,
  dialHeadroom,
  liveConcurrency,
  peakConcurrency,
  type CallInterval,
} from './concurrency-math'

const call = (startedAt: string | null, durationSecs: number | null): CallInterval => ({
  startedAt,
  durationSecs,
})

/**
 * Hand-checked fixture (all UTC on 2026-09-23). Each call occupies
 * [start, start+duration):
 *
 *   A 10:00 ─────────────┐ (600s → 10:10)
 *   B      10:05 ────────┼──────┐ (600s → 10:15)
 *   C         10:08 ─────┘      │ (120s → 10:10)
 *   D              10:10 ───────┘ (300s → 10:15)
 *   E                       11:00 ──┐ (60s → 11:01)
 *
 *   10:00–10:05  A           → 1
 *   10:05–10:08  A,B         → 2
 *   10:08–10:10  A,B,C       → 3   ← peak
 *   10:10–10:15  B,D         → 2   (A and C end exactly as D starts)
 *   11:00–11:01  E           → 1
 */
const FIXTURE: CallInterval[] = [
  call('2026-09-23T10:00:00Z', 600),
  call('2026-09-23T10:05:00Z', 600),
  call('2026-09-23T10:08:00Z', 120),
  call('2026-09-23T10:10:00Z', 300),
  call('2026-09-23T11:00:00Z', 60),
]

describe('peakConcurrency', () => {
  it('finds the highest number of calls overlapping at once', () => {
    expect(peakConcurrency(FIXTURE).peak).toBe(3)
  })

  it('reports when the peak was first reached', () => {
    expect(peakConcurrency(FIXTURE).at).toBe('2026-09-23T10:08:00.000Z')
  })

  it('does not count a call that ends exactly as another starts', () => {
    // A ends at 10:10 and D starts at 10:10 — closed intervals would say 2.
    const backToBack = [call('2026-09-23T10:00:00Z', 600), call('2026-09-23T10:10:00Z', 300)]
    expect(peakConcurrency(backToBack).peak).toBe(1)
  })

  it('peaks at 1 when calls never overlap', () => {
    const sequential = [
      call('2026-09-23T10:00:00Z', 60),
      call('2026-09-23T11:00:00Z', 60),
      call('2026-09-23T12:00:00Z', 60),
    ]
    expect(peakConcurrency(sequential).peak).toBe(1)
  })

  it('is 0 with no calls', () => {
    expect(peakConcurrency([])).toEqual({ peak: 0, at: null })
  })

  it('ignores zero-length and negative-duration calls', () => {
    // Failed/unanswered calls land with duration 0 and never held a slot; a pile
    // of them at the same instant must not read as a concurrency spike.
    const zeroes = Array.from({ length: 5 }, () => call('2026-09-23T10:00:00Z', 0))
    expect(peakConcurrency([...zeroes, call('2026-09-23T10:00:00Z', -30)]).peak).toBe(0)
  })

  it('ignores calls with no start time', () => {
    expect(peakConcurrency([call(null, 600), call(null, null)]).peak).toBe(0)
  })

  it('counts an in-flight call (null duration) as still holding its slot', () => {
    const live = [call('2026-09-23T10:00:00Z', null), call('2026-09-23T23:00:00Z', 60)]
    expect(peakConcurrency(live).peak).toBe(2)
  })
})

describe('concurrentAt', () => {
  const at = (iso: string) => concurrentAt(FIXTURE, new Date(iso))

  it('counts the calls in progress at an instant', () => {
    expect(at('2026-09-23T10:09:00Z')).toBe(3)
  })

  it('counts a call from the instant it starts', () => {
    expect(at('2026-09-23T10:00:00Z')).toBe(1)
  })

  it('stops counting a call at the instant it ends', () => {
    // A: 10:00 + 600s. At 10:10 exactly, A is done and D has just started.
    expect(at('2026-09-23T10:10:00Z')).toBe(2)
  })

  it('is 0 in a gap between calls', () => {
    expect(at('2026-09-23T10:30:00Z')).toBe(0)
  })

  it('counts an in-flight call as live at any later instant', () => {
    const live = [call('2026-09-23T10:00:00Z', null)]
    expect(concurrentAt(live, new Date('2026-09-24T10:00:00Z'))).toBe(1)
  })

  it('does not count an in-flight call before it started', () => {
    const live = [call('2026-09-23T10:00:00Z', null)]
    expect(concurrentAt(live, new Date('2026-09-23T09:59:59Z'))).toBe(0)
  })
})

describe('liveConcurrency', () => {
  const NOW = new Date('2026-09-23T10:09:00Z')
  const row = (providerCallId: string | null, startedAt: string | null, durationSecs: number | null) => ({
    providerCallId,
    startedAt,
    durationSecs,
  })

  it('counts calls whose rows already landed and are still running', () => {
    expect(liveConcurrency([row('c1', '2026-09-23T10:08:00Z', 300)], [], NOW)).toBe(1)
  })

  it('counts a dialed contact that has no calls row yet', () => {
    // The post-call webhook writes the calls row at HANGUP, so a call in
    // progress has no row at all — only the campaign_contacts 'calling' flag.
    expect(liveConcurrency([], [{ providerCallId: 'c9' }], NOW)).toBe(1)
  })

  it('does not double count a contact whose calls row already landed', () => {
    const calls = [row('c1', '2026-09-23T10:08:00Z', 300)]
    expect(liveConcurrency(calls, [{ providerCallId: 'c1' }], NOW)).toBe(1)
  })

  it('drops a stale calling flag once its calls row says the call ended', () => {
    // Missed webhook → contact stuck on 'calling'. Nightly reconcile writes the
    // calls row; that row ending is what releases the slot.
    const ended = [row('c1', '2026-09-23T09:00:00Z', 60)]
    expect(liveConcurrency(ended, [{ providerCallId: 'c1' }], NOW)).toBe(0)
  })

  it('adds up rows and flagged contacts that refer to different calls', () => {
    const calls = [row('c1', '2026-09-23T10:08:00Z', 300), row('c2', '2026-09-23T10:05:00Z', 600)]
    expect(liveConcurrency(calls, [{ providerCallId: 'c3' }, { providerCallId: 'c4' }], NOW)).toBe(4)
  })
})

describe('dialHeadroom', () => {
  it('allows dialing up to the smaller of the two headrooms', () => {
    const d = dialHeadroom({ orgLive: 8, orgLimit: 10, poolLive: 12, poolLimit: 20 })
    expect(d).toMatchObject({ blocked: false, slots: 2 })
  })

  it('blocks and names the org when the org is at its own limit', () => {
    const d = dialHeadroom({ orgLive: 10, orgLimit: 10, poolLive: 12, poolLimit: 20 })
    expect(d.blocked).toBe(true)
    expect(d.slots).toBe(0)
    expect(d.why).toMatch(/org/i)
  })

  it('blocks and names the shared pool when the pool is full', () => {
    const d = dialHeadroom({ orgLive: 2, orgLimit: 10, poolLive: 20, poolLimit: 20 })
    expect(d.blocked).toBe(true)
    expect(d.why).toMatch(/pool/i)
  })

  it('never reports negative slots when a limit is already exceeded', () => {
    expect(dialHeadroom({ orgLive: 14, orgLimit: 10, poolLive: 3, poolLimit: 20 }).slots).toBe(0)
  })
})

describe('concurrencyState', () => {
  it('is ok well below the threshold', () => {
    expect(concurrencyState(4, 10)).toBe('ok')
  })

  it('is ok just under 80% of the limit', () => {
    expect(concurrencyState(7, 9)).toBe('ok') // 77.8%
  })

  it('is approaching at exactly 80% of the limit', () => {
    expect(concurrencyState(8, 10)).toBe('approaching')
  })

  it('is at_limit when the peak reaches the limit', () => {
    expect(concurrencyState(10, 10)).toBe('at_limit')
  })

  it('is at_limit when the peak somehow exceeds the limit', () => {
    expect(concurrencyState(13, 10)).toBe('at_limit')
  })

  it('is ok when there is no limit to compare against', () => {
    expect(concurrencyState(5, 0)).toBe('ok')
  })
})
