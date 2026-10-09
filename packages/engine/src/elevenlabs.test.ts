import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { ElevenLabsEngine } from './elevenlabs'
import { KnowledgeIndexError } from './types'
import fixture from '../fixtures/post-call-transcription.json'

const engine = new ElevenLabsEngine({
  apiKey: 'test',
  webhookSecret: 'whsec_test',
})

function sign(body: string, secret: string, t = Math.floor(Date.now() / 1000)) {
  const digest = createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')
  return `t=${t},v0=${digest}`
}

describe('verifyWebhook', () => {
  const body = JSON.stringify(fixture)

  it('accepts a valid signature', () => {
    expect(engine.verifyWebhook({ rawBody: body, signature: sign(body, 'whsec_test') })).toBe(true)
  })

  it('rejects a tampered body', () => {
    expect(engine.verifyWebhook({ rawBody: body + 'x', signature: sign(body, 'whsec_test') })).toBe(false)
  })

  it('rejects a wrong secret', () => {
    expect(engine.verifyWebhook({ rawBody: body, signature: sign(body, 'whsec_wrong') })).toBe(false)
  })

  it('rejects a stale timestamp', () => {
    const stale = Math.floor(Date.now() / 1000) - 3600
    expect(engine.verifyWebhook({ rawBody: body, signature: sign(body, 'whsec_test', stale) })).toBe(false)
  })

  it('rejects a missing signature', () => {
    expect(engine.verifyWebhook({ rawBody: body, signature: null })).toBe(false)
  })
})

describe('normalizeCallEvent', () => {
  it('maps the post-call fixture to a CallEvent', () => {
    const ev = engine.normalizeCallEvent(fixture)
    expect(ev).toMatchObject({
      providerCallId: 'conv_placeholder00000000000000000',
      direction: 'inbound',
      fromE164: '+15559876543',
      toE164: '+15551230000',
      durationSecs: 42,
      status: 'done',
    })
    expect(ev.startedAt).toBe(new Date(1752300000 * 1000).toISOString())
    expect(Array.isArray(ev.transcript)).toBe(true)
  })

  it('throws on a non post-call payload', () => {
    expect(() => engine.normalizeCallEvent({ type: 'other' })).toThrow()
  })

  it('extracts the post-call analysis block (Phase 12)', () => {
    const ev = engine.normalizeCallEvent(fixture)
    expect(ev.analysis).toMatchObject({ success: true, sentiment: 'neutral' })
    expect(ev.analysis?.data).toMatchObject({ user_sentiment: 'neutral' })
    expect(ev.analysis?.data?.call_summary).toEqual(expect.any(String))
    expect(ev.analysis?.criteria).toEqual([
      { name: 'call_successful', result: 'success', rationale: expect.any(String) },
    ])
  })

  it('omits analysis when the payload carries none', () => {
    const bare = { type: 'post_call_transcription', event_timestamp: 1, data: { conversation_id: 'c', status: 'done' } }
    expect(engine.normalizeCallEvent(bare).analysis).toBeUndefined()
  })
})

// Offline analog of the "save → GET the EL agent → values match" acceptance:
// stub fetch, PATCH the agent, and assert the request body hit the verified paths.
describe('agent config mapping (Phase 12)', () => {
  it('maps every setting onto the verified provider paths', async () => {
    let captured: any
    const orig = globalThis.fetch
    globalThis.fetch = (async (_url: string, init: any) => {
      captured = JSON.parse(init.body)
      return { ok: true, status: 200, json: async () => ({}), text: async () => '' }
    }) as unknown as typeof fetch
    try {
      await engine.updateAgent('agent_1', {
        voiceId: 'v1',
        speech: { stability: 0.3, similarityBoost: 0.9, speed: 1.1 },
        transcription: { keywords: ['VoiceFlow', 'Cal.com'] },
        call: { maxDurationSecs: 300, endOnSilenceSecs: 20 },
        analysis: {
          dataCollection: [{ name: 'Call Summary', type: 'string', description: 'A concise summary.' }],
          successCriteria: [{ name: 'Call Successful', prompt: 'Did it work?' }],
        },
        widget: { public: false },
      })
    } finally {
      globalThis.fetch = orig
    }
    expect(captured.conversation_config.tts).toMatchObject({
      voice_id: 'v1',
      stability: 0.3,
      similarity_boost: 0.9,
      speed: 1.1,
    })
    expect(captured.conversation_config.asr).toEqual({ keywords: ['VoiceFlow', 'Cal.com'] })
    expect(captured.conversation_config.conversation).toEqual({ max_duration_seconds: 300 })
    expect(captured.conversation_config.turn).toEqual({ silence_end_call_timeout: 20 })
    expect(captured.platform_settings.data_collection).toEqual({
      call_summary: { type: 'string', description: 'A concise summary.' },
    })
    expect(captured.platform_settings.evaluation.criteria).toEqual([
      { id: 'call_successful', name: 'Call Successful', type: 'prompt', conversation_goal_prompt: 'Did it work?' },
    ])
    // public:false ⇒ auth required (enable_auth true)
    expect(captured.platform_settings.auth).toEqual({ enable_auth: true })
  })
})

// Phase 13: KB create/attach/detach + SIP import hit the verified provider paths.
describe('knowledge base + SIP (Phase 13)', () => {
  function stubFetch(agentKb: any[] = []) {
    const calls: { method: string; url: string; body: any }[] = []
    const orig = globalThis.fetch
    globalThis.fetch = (async (url: string, init: any) => {
      const method = init?.method ?? 'GET'
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body
      calls.push({ method, url: String(url), body })
      const json = async () =>
        String(url).includes('/rag-index')
          ? { status: 'succeeded' }
          : method === 'GET' && String(url).includes('/agents/')
          ? { conversation_config: { agent: { prompt: { knowledge_base: agentKb } } } }
          : { id: 'kb_new', phone_number_id: 'pn_new' }
      return { ok: true, status: 200, json, text: async () => '' }
    }) as unknown as typeof fetch
    return { calls, restore: () => { globalThis.fetch = orig } }
  }

  it('routes createKnowledgeDoc to the url/text endpoints with name', async () => {
    const s = stubFetch()
    try {
      const r = await engine.createKnowledgeDoc({ name: 'Docs', url: 'https://x.com' })
      expect(r).toEqual({ knowledgeId: 'kb_new' })
      await engine.createKnowledgeDoc({ name: 'FAQ', text: 'hello' })
    } finally {
      s.restore()
    }
    const creates = s.calls.filter((c) => !c.url.includes('/rag-index')) // each create also starts an index
    expect(creates[0]).toMatchObject({
      url: expect.stringContaining('/knowledge-base/url'),
      body: { url: 'https://x.com', name: 'Docs' },
    })
    expect(creates[1]).toMatchObject({
      url: expect.stringContaining('/knowledge-base/text'),
      body: { text: 'hello', name: 'FAQ' },
    })
  })

  it('attachKnowledge appends without duplicating; detach removes', async () => {
    const s = stubFetch([{ type: 'url', id: 'kb_old', name: 'Old' }])
    try {
      await engine.attachKnowledge('agent_1', { knowledgeId: 'kb_new', name: 'New', type: 'text' })
    } finally {
      s.restore()
    }
    expect(s.calls.find((c) => c.method === 'PATCH')!.body.conversation_config.agent.prompt.knowledge_base).toEqual([
      { type: 'url', id: 'kb_old', name: 'Old' },
      { type: 'text', id: 'kb_new', name: 'New' },
    ])

    // Already attached → no PATCH.
    const s2 = stubFetch([{ type: 'text', id: 'kb_new', name: 'New' }])
    try {
      await engine.attachKnowledge('agent_1', { knowledgeId: 'kb_new', name: 'New', type: 'text' })
    } finally {
      s2.restore()
    }
    expect(s2.calls.some((c) => c.method === 'PATCH')).toBe(false)

    const s3 = stubFetch([
      { type: 'url', id: 'kb_old', name: 'Old' },
      { type: 'text', id: 'kb_new', name: 'New' },
    ])
    try {
      await engine.detachKnowledge('agent_1', 'kb_old')
    } finally {
      s3.restore()
    }
    expect(s3.calls.find((c) => c.method === 'PATCH')!.body.conversation_config.agent.prompt.knowledge_base).toEqual([
      { type: 'text', id: 'kb_new', name: 'New' },
    ])
  })

  it('importNumber sends the creds of the account the number lives in', async () => {
    const s = stubFetch()
    try {
      await engine.importNumber('+15551234567', { accountSid: 'AC_sub', authToken: 'sub_token' })
    } finally {
      s.restore()
    }
    expect(s.calls[0]).toMatchObject({
      url: expect.stringContaining('/v1/convai/phone-numbers'),
      body: { provider: 'twilio', phone_number: '+15551234567', sid: 'AC_sub', token: 'sub_token' },
    })
  })

  it('importSipNumber builds the nested inbound/outbound trunk config', async () => {
    const s = stubFetch()
    try {
      const r = await engine.importSipNumber({
        e164: '+15551234567',
        label: 'HQ trunk',
        address: 'sip.example.com',
        transport: 'tls',
        username: 'u',
        password: 'p',
        allowedAddresses: ['10.0.0.0/24'],
      })
      expect(r).toEqual({ providerNumberId: 'pn_new' })
    } finally {
      s.restore()
    }
    expect(s.calls[0]).toMatchObject({
      url: expect.stringContaining('/phone-numbers'),
      body: {
        provider: 'sip_trunk',
        phone_number: '+15551234567',
        label: 'HQ trunk',
        outbound_trunk_config: {
          address: 'sip.example.com',
          transport: 'tls',
          credentials: { username: 'u', password: 'p' },
        },
        inbound_trunk_config: {
          allowed_addresses: ['10.0.0.0/24'],
          credentials: { username: 'u', password: 'p' },
        },
      },
    })
  })
})

// Phase 16: simulate-conversation payload + response mapping (offline analog of
// running a real simulation — no EL key exists yet).
describe('simulateConversation (Phase 16)', () => {
  it('sends the persona + extra criterion and maps the graded response', async () => {
    let captured: any
    let capturedUrl = ''
    const orig = globalThis.fetch
    globalThis.fetch = (async (url: string, init: any) => {
      capturedUrl = String(url)
      captured = JSON.parse(init.body)
      return {
        ok: true,
        status: 200,
        json: async () => ({
          simulated_conversation: [
            { role: 'user', message: 'My heater is leaking.' },
            { role: 'agent', message: 'I can book you for today.' },
          ],
          analysis: {
            call_successful: 'success',
            transcript_summary: 'Booked an emergency visit.',
            evaluation_criteria_results: {
              sim_success: { criteria_id: 'sim_success', result: 'success', rationale: 'Appointment booked.' },
            },
          },
        }),
        text: async () => '',
      }
    }) as unknown as typeof fetch
    let result
    try {
      result = await engine.simulateConversation('agent_1', {
        userPrompt: 'You are a caller whose water heater is leaking.',
        criteria: 'The agent books an appointment.',
      })
    } finally {
      globalThis.fetch = orig
    }
    expect(capturedUrl).toContain('/v1/convai/agents/agent_1/simulate-conversation')
    expect(captured.simulation_specification.simulated_user_config.prompt.prompt).toBe(
      'You are a caller whose water heater is leaking.'
    )
    expect(captured.extra_evaluation_criteria).toEqual([
      { id: 'sim_success', name: 'Simulation success', type: 'prompt', conversation_goal_prompt: 'The agent books an appointment.' },
    ])
    expect(result).toMatchObject({
      passed: true,
      summary: 'Booked an emergency visit.',
      transcript: [
        { role: 'user', message: 'My heater is leaking.' },
        { role: 'agent', message: 'I can book you for today.' },
      ],
      criteria: [{ name: 'sim_success', result: 'success', rationale: 'Appointment booked.' }],
    })
  })

  it('omits extra_evaluation_criteria when no criteria given and reports unknown verdicts', async () => {
    let captured: any
    const orig = globalThis.fetch
    globalThis.fetch = (async (_url: string, init: any) => {
      captured = JSON.parse(init.body)
      return {
        ok: true,
        status: 200,
        json: async () => ({ simulated_conversation: [], analysis: { call_successful: 'unknown' } }),
        text: async () => '',
      }
    }) as unknown as typeof fetch
    let result
    try {
      result = await engine.simulateConversation('agent_1', { userPrompt: 'hi' })
    } finally {
      globalThis.fetch = orig
    }
    expect(captured.extra_evaluation_criteria).toBeUndefined()
    expect(result).toEqual({ passed: null, transcript: [] })
  })
})

// RAG (2026-10-09): a big KB only works through retrieval, and EL refuses to attach a doc
// to a retrieval agent before its index exists (422 rag_index_not_ready, seen live).
describe('knowledge base retrieval (RAG)', () => {
  const rag = new ElevenLabsEngine({ apiKey: 'k', webhookSecret: 's', ragPollMs: 0 })
  function stub(statuses: string[]) {
    const calls: { method: string; url: string; body: any }[] = []
    const orig = globalThis.fetch
    globalThis.fetch = (async (url: string, init: any) => {
      const method = init?.method ?? 'GET'
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body
      calls.push({ method, url: String(url), body })
      const json = async () =>
        String(url).includes('/rag-index')
          ? { status: statuses.length > 1 ? statuses.shift() : statuses[0] }
          : String(url).includes('/agents/') && method === 'GET'
            ? { conversation_config: { agent: { prompt: { knowledge_base: [] } } } }
            : { id: 'kb_1', agent_id: 'agent_1' }
      return { ok: true, status: 200, json, text: async () => '' }
    }) as unknown as typeof fetch
    return { calls, restore: () => { globalThis.fetch = orig } }
  }
  const doc = { knowledgeId: 'kb_1', name: 'Manual', type: 'file' as const }

  it('indexes the doc BEFORE attaching, and turns retrieval on in the same PATCH', async () => {
    const s = stub(['succeeded'])
    try {
      await rag.attachKnowledge('agent_1', doc)
    } finally {
      s.restore()
    }
    const idx = s.calls.findIndex((c) => c.url.endsWith('/knowledge-base/kb_1/rag-index'))
    const patch = s.calls.findIndex((c) => c.method === 'PATCH')
    expect(idx).toBeGreaterThan(-1)
    expect(s.calls[idx]!.body).toEqual({ model: 'e5_mistral_7b_instruct' })
    expect(patch).toBeGreaterThan(idx)
    expect(s.calls[patch]!.body.conversation_config.agent.prompt.rag).toMatchObject({ enabled: true })
  })

  it('waits while the index is processing', async () => {
    const s = stub(['new', 'processing', 'succeeded'])
    try {
      await rag.attachKnowledge('agent_1', doc)
    } finally {
      s.restore()
    }
    expect(s.calls.filter((c) => c.url.includes('/rag-index'))).toHaveLength(3)
    expect(s.calls.some((c) => c.method === 'PATCH')).toBe(true)
  })

  it('treats a doc too small to index as usable (EL puts it in the prompt)', async () => {
    const s = stub(['document_too_small'])
    try {
      await rag.attachKnowledge('agent_1', doc)
    } finally {
      s.restore()
    }
    expect(s.calls.some((c) => c.method === 'PATCH')).toBe(true)
  })

  it('refuses with a user-facing error, and never PATCHes, when the plan storage is full', async () => {
    const s = stub(['rag_limit_exceeded'])
    try {
      await expect(rag.attachKnowledge('agent_1', doc)).rejects.toBeInstanceOf(KnowledgeIndexError)
    } finally {
      s.restore()
    }
    expect(s.calls.some((c) => c.method === 'PATCH')).toBe(false)
  })

  it('starts indexing as soon as a doc is created', async () => {
    const s = stub(['new'])
    try {
      await rag.createKnowledgeDoc({ name: 'FAQ', text: 'hello' })
    } finally {
      s.restore()
    }
    expect(s.calls.map((c) => c.url)).toEqual([
      expect.stringContaining('/knowledge-base/text'),
      expect.stringContaining('/knowledge-base/kb_1/rag-index'),
    ])
  })

  it('a flow step with its own knowledge gets indexed docs and retrieval on', async () => {
    const s = stub(['succeeded'])
    try {
      await rag.updateAgent('agent_1', {
        workflow: {
          startNodeId: 'a',
          nodes: [{ id: 'a', type: 'conversation', label: 'A', kb: [doc] }, { id: 'end', type: 'end' }],
          edges: [{ from: 'a', to: 'end' }],
        },
      })
    } finally {
      s.restore()
    }
    expect(s.calls[0]!.url).toContain('/knowledge-base/kb_1/rag-index')
    const patch = s.calls.find((c) => c.method === 'PATCH')!
    expect(patch.body.conversation_config.agent.prompt.rag).toMatchObject({ enabled: true })
  })
})
