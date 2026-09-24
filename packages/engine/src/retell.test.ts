import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import fixture from '../fixtures/retell-call-analyzed.json'
import { RetellEngine } from './retell'

const API_KEY = 'key_test'
const engine = new RetellEngine({ apiKey: API_KEY })

/** Retell's own format: `v=<unix ms>,d=<hex hmac-sha256 over body+timestamp>`. */
function sign(body: string, key = API_KEY, t = Date.now()) {
  return `v=${t},d=${createHmac('sha256', key).update(`${body}${t}`).digest('hex')}`
}

describe('verifyWebhook', () => {
  const body = JSON.stringify(fixture)

  it('verifies the signature vector published by retell-typescript-sdk', () => {
    // Body, key, timestamp and digest all lifted from
    // RetellAI/retell-typescript-sdk tests/webhook-auth.test.ts. Driven THROUGH
    // verifyWebhook, not recomputed beside it — otherwise this only proves that
    // node:crypto works. Clock is pinned because the vector is from 2023 and
    // the freshness window is five minutes.
    vi.useFakeTimers()
    try {
      vi.setSystemTime(1_700_000_000_000)
      const ok = new RetellEngine({ apiKey: 'test-api-key' }).verifyWebhook({
        rawBody: '{"event":"call_ended"}',
        signature:
          'v=1700000000000,d=07024cabe7dd8f6d1c6e4a8324ca92c812e6ad4a7ee506c04f7e462e3321823e',
      })
      expect(ok).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('accepts a valid signature', () => {
    expect(engine.verifyWebhook({ rawBody: body, signature: sign(body) })).toBe(true)
  })

  it('rejects a tampered body', () => {
    expect(engine.verifyWebhook({ rawBody: body + 'x', signature: sign(body) })).toBe(false)
  })

  it('rejects a wrong key', () => {
    expect(engine.verifyWebhook({ rawBody: body, signature: sign(body, 'key_wrong') })).toBe(false)
  })

  it('rejects a stale timestamp', () => {
    const stale = Date.now() - 10 * 60 * 1000 // their tolerance is 5 minutes
    expect(engine.verifyWebhook({ rawBody: body, signature: sign(body, API_KEY, stale) })).toBe(false)
  })

  it('rejects a malformed signature', () => {
    for (const bad of ['', 'v=1', `d=abc,v=1`, 'v=1,d=not-hex', 'garbage']) {
      expect(engine.verifyWebhook({ rawBody: body, signature: bad })).toBe(false)
    }
  })

  it('rejects a missing signature', () => {
    expect(engine.verifyWebhook({ rawBody: body, signature: null })).toBe(false)
  })
})

describe('describeWebhook', () => {
  it('keys idempotency on the event kind and the call', () => {
    expect(engine.describeWebhook(fixture)).toEqual({
      eventId: 'call_analyzed:call_placeholder000000000000000000',
      isPostCall: true,
    })
  })

  it('accepts call_ended for the webhook_events log but does NOT treat it as post-call', () => {
    // call_ended fires at hangup with no call_analysis. Writing the calls row
    // from it would store a call with no analysis and then skip the real one as
    // a duplicate — the analysis would be lost for every Retell call.
    const ended = { event: 'call_ended', call: { call_id: 'call_x' } }
    expect(engine.describeWebhook(ended)).toEqual({
      eventId: 'call_ended:call_x',
      isPostCall: false,
    })
  })
})

describe('normalizeCallEvent', () => {
  const ev = engine.normalizeCallEvent(fixture)

  it('maps the post-call fixture to a CallEvent', () => {
    expect(ev).toMatchObject({
      providerCallId: 'call_placeholder000000000000000000',
      providerAgentId: 'agent_placeholder0000000000000000',
      direction: 'inbound',
      fromE164: '+15559876543',
      toE164: '+15551230000',
      durationSecs: 42,
      status: 'ended',
    })
  })

  it('reads Retell timestamps as milliseconds', () => {
    // 1752300000000 ms. Read as seconds this lands in the year 57500 — and it
    // would still look like a valid ISO string in the database.
    expect(ev.startedAt).toBe(new Date(1752300000000).toISOString())
  })

  it('serves the recording URL Retell provides', () => {
    // Unlike ElevenLabs, Retell puts the audio URL straight on the call.
    expect(ev.recordingUrl).toMatch(/^https:\/\//)
  })

  it('never reports cost from a webhook, though Retell sends cents (rule 5)', () => {
    expect(fixture.call.call_cost.combined_cost).toBeGreaterThan(0)
    expect(ev.costCents).toBeUndefined()
  })

  it('turns the single call_successful verdict into one criterion', () => {
    expect(ev.analysis?.success).toBe(true)
    expect(ev.analysis?.criteria).toEqual([{ name: 'call_successful', result: 'success' }])
  })

  it('reports a failed call as a failure, not a missing verdict', () => {
    const failed = structuredClone(fixture) as typeof fixture
    failed.call.call_analysis.call_successful = false
    const out = engine.normalizeCallEvent(failed)
    expect(out.analysis?.success).toBe(false)
    expect(out.analysis?.criteria).toEqual([{ name: 'call_successful', result: 'failure' }])
  })

  it('throws on a payload that is not call_analyzed', () => {
    expect(() => engine.normalizeCallEvent({ event: 'call_started', call: { call_id: 'x' } })).toThrow()
  })

  it('throws on a payload with no call', () => {
    expect(() => engine.normalizeCallEvent({ event: 'call_analyzed' })).toThrow()
  })
})

describe('capabilities Retell does not have', () => {
  // These must THROW, not resolve. A silent no-op would look like a working
  // feature in the UI and leave nothing at the provider.
  it('refuses a Twilio-SID number import and names the alternative', async () => {
    await expect(engine.importNumber('AC_x', '+15551230000')).rejects.toThrow(/SIP trunk/)
  })

  it('refuses a static test-widget embed', () => {
    expect(() => engine.testWidgetEmbed('agent_x')).toThrow(/Retell does not support/)
  })

  it('refuses to make an agent public', async () => {
    await expect(engine.setAgentPublic('agent_x', true)).rejects.toThrow(/Retell does not support/)
  })

  it('refuses workspace secrets', async () => {
    await expect(engine.createSecret('k', 'v')).rejects.toThrow(/Retell does not support/)
  })

  it('refuses one-shot simulation', async () => {
    await expect(engine.simulateConversation('agent_x', { userPrompt: 'hi' })).rejects.toThrow(
      /Retell does not support/
    )
  })

  it('refuses a bring-your-own LLM endpoint instead of minting a dead agent', async () => {
    // Retell's custom-llm is a WebSocket protocol; ours is an OpenAI-compatible
    // HTTP URL. Mapping one to the other creates an agent that never answers.
    await expect(
      engine.createAgent({
        name: 'n',
        systemPrompt: 'p',
        firstMessage: '',
        voiceId: 'v',
        customLlm: { url: 'https://example.com/v1' },
      })
    ).rejects.toThrow(/custom-llm/)
  })

  it('refuses to create a workflow agent rather than half-building a flow', async () => {
    await expect(
      engine.createAgent({
        name: 'n',
        systemPrompt: 'p',
        firstMessage: '',
        voiceId: 'v',
        workflow: { startNodeId: 'a', nodes: [], edges: [] },
      })
    ).rejects.toThrow(/conversational-flow/)
  })
})
