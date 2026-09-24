import { describe, expect, it } from 'vitest'
import elFixture from '../fixtures/post-call-transcription.json'
import retellFixture from '../fixtures/retell-call-analyzed.json'
import { ElevenLabsEngine } from './elevenlabs'
import { RetellEngine } from './retell'
import type { CallEvent } from './types'

// Phase 26. The adapter is only insurance (architecture §5, §10) if a second
// provider lands on the SAME CallEvent — otherwise every consumer downstream
// (calls upsert, CallPlayer, learning, outbound webhooks) silently becomes
// ElevenLabs-shaped. These two fixtures describe the same 42-second inbound
// call as each provider reports it; normalizeCallEvent must flatten that
// difference completely.

const elevenlabs = new ElevenLabsEngine({
  apiKey: 'test',
  webhookSecret: 'whsec_test',
  twilioAccountSid: 'AC_test',
  twilioAuthToken: 'test',
})
const retell = new RetellEngine({ apiKey: 'key_test' })

const EL: CallEvent = elevenlabs.normalizeCallEvent(elFixture)
const RT: CallEvent = retell.normalizeCallEvent(retellFixture)
const BOTH: [string, CallEvent][] = [
  ['elevenlabs', EL],
  ['retell', RT],
]

const keys = (o: unknown) => Object.keys(o as object).sort()

describe('CallEvent key parity', () => {
  it('both providers emit exactly the same top-level keys', () => {
    expect(keys(RT)).toEqual(keys(EL))
  })

  it('both providers emit exactly the same analysis keys', () => {
    expect(keys(RT.analysis)).toEqual(keys(EL.analysis))
  })

  it('both providers emit exactly the same transcript turn keys', () => {
    const turnKeys = (ev: CallEvent) => (ev.transcript as unknown[]).map(keys)
    // Every turn, not just the first: a provider that fills a key on turn 0
    // and drops it on turn 2 breaks click-to-seek halfway down the panel.
    expect(turnKeys(RT)).toEqual(turnKeys(EL))
  })

  it('neither provider reports money from a webhook (rule 5)', () => {
    // Retell DOES send call_cost.combined_cost in cents. It is still not
    // billing truth — reconciliation is. Emitting it here would also break
    // key parity, since ElevenLabs only sends credits.
    expect(EL.costCents).toBeUndefined()
    expect(RT.costCents).toBeUndefined()
  })
})

describe('CallEvent type contract', () => {
  const isStr = (v: unknown) => typeof v === 'string' && v.length > 0
  const isStrOrNull = (v: unknown) => v === null || isStr(v)
  const CONTRACT: Record<string, (v: unknown) => boolean> = {
    providerCallId: isStr,
    providerAgentId: isStr,
    direction: (v) => v === 'inbound' || v === 'outbound',
    fromE164: isStrOrNull,
    toE164: isStrOrNull,
    startedAt: (v) => isStr(v) && !Number.isNaN(Date.parse(v as string)),
    durationSecs: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    transcript: (v) => Array.isArray(v),
    recordingUrl: isStrOrNull,
    status: isStr,
    analysis: (v) => typeof v === 'object' && v !== null,
  }

  it.each(BOTH)('%s satisfies every field contract', (_name, ev) => {
    for (const [field, ok] of Object.entries(CONTRACT)) {
      expect({ field, value: (ev as never)[field], ok: ok((ev as never)[field]) }).toMatchObject({
        field,
        ok: true,
      })
    }
  })

  it.each(BOTH)('%s emits transcript turns the CallPlayer can render', (_name, ev) => {
    const turns = ev.transcript as { role: string; message: string; time_in_call_secs: number }[]
    expect(turns.length).toBeGreaterThan(0)
    for (const t of turns) {
      expect(typeof t.role).toBe('string')
      expect(typeof t.message).toBe('string')
      expect(typeof t.time_in_call_secs).toBe('number')
    }
  })

  it.each(BOTH)('%s emits success criteria with name+result', (_name, ev) => {
    const criteria = ev.analysis?.criteria ?? []
    expect(criteria.length).toBeGreaterThan(0)
    for (const c of criteria) {
      expect(typeof c.name).toBe('string')
      expect(typeof c.result).toBe('string')
      // `rationale` is the one declared-optional key that legitimately differs:
      // ElevenLabs explains each verdict, Retell does not expose a per-criterion
      // rationale at all. Anything BEYOND that set is an adapter leak.
      expect(Object.keys(c).filter((k) => k !== 'name' && k !== 'result')).toEqual(
        expect.arrayContaining([])
      )
      expect(Object.keys(c).every((k) => ['name', 'result', 'rationale'].includes(k))).toBe(true)
    }
  })
})

describe('the same call, reported by two providers, normalizes to the same facts', () => {
  // Guards the classic adapter bugs: ms read as seconds, from/to swapped on an
  // inbound call, a start time taken from the delivery instead of the call.
  it('agrees on direction', () => expect(RT.direction).toBe(EL.direction))
  it('agrees on the caller number', () => expect(RT.fromE164).toBe(EL.fromE164))
  it('agrees on the dialled number', () => expect(RT.toE164).toBe(EL.toE164))
  it('agrees on when the call started', () => expect(RT.startedAt).toBe(EL.startedAt))
  it('agrees on duration in SECONDS', () => expect(RT.durationSecs).toBe(EL.durationSecs))
  it('agrees on the success verdict', () => expect(RT.analysis?.success).toBe(EL.analysis?.success))
  it('agrees on sentiment', () => expect(RT.analysis?.sentiment).toBe(EL.analysis?.sentiment))
  it('agrees on the transcript turns', () => {
    const spoken = (ev: CallEvent) =>
      (ev.transcript as { role: string; message: string }[]).map((t) => [t.role, t.message])
    expect(spoken(RT)).toEqual(spoken(EL))
  })
})
