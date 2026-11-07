import { createHash, createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { ElevenLabsEngine, phoneStyle } from './elevenlabs'
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

describe('startOutboundCall', () => {
  function stubDial(dial: Record<string, unknown>) {
    const calls: { url: string; body: any }[] = []
    const orig = globalThis.fetch
    globalThis.fetch = (async (url: string, init: any) => {
      calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : undefined })
      const json = async () =>
        String(url).endsWith('/v1/convai/phone-numbers')
          ? [{ phone_number_id: 'pn_1', assigned_agent: { agent_id: 'agent_1' } }]
          : dial
      return { ok: true, status: 200, json, text: async () => '' }
    }) as unknown as typeof fetch
    return { calls, restore: () => { globalThis.fetch = orig } }
  }

  it('opens on the outbound step and carries the contact vars', async () => {
    const s = stubDial({ success: true, conversation_id: 'conv_1', callSid: 'CA1' })
    try {
      const r = await engine.startOutboundCall('agent_1', '+15551234567', { name: 'Ana' }, 'outbound_open')
      expect(r).toEqual({ providerCallId: 'conv_1' })
    } finally {
      s.restore()
    }
    expect(s.calls[1].body).toEqual({
      agent_id: 'agent_1',
      agent_phone_number_id: 'pn_1',
      to_number: '+15551234567',
      conversation_initiation_client_data: {
        dynamic_variables: { name: 'Ana' },
        starting_workflow_node_id: 'outbound_open',
      },
    })
  })

  it('sends no initiation data when there is nothing to send', async () => {
    const s = stubDial({ success: true, conversation_id: 'conv_1' })
    try {
      await engine.startOutboundCall('agent_1', '+15551234567')
    } finally {
      s.restore()
    }
    expect(s.calls[1].body).not.toHaveProperty('conversation_initiation_client_data')
  })

  it('throws when the provider answers 200 but refuses the dial', async () => {
    const s = stubDial({ success: false, message: 'Twilio rejected the number', conversation_id: null })
    try {
      await expect(engine.startOutboundCall('agent_1', '+15551234567')).rejects.toThrow('Twilio rejected the number')
    } finally {
      s.restore()
    }
  })
})

// 2026-10-09: humanized turn-taking + one shared OpenRouter secret.
describe('turn-taking and shared secrets', () => {
  function capture(responder: (url: string, method: string) => unknown = () => ({})) {
    const calls: { url: string; method: string; body: any }[] = []
    const orig = globalThis.fetch
    globalThis.fetch = (async (url: string, init: any) => {
      const method = init?.method ?? 'GET'
      calls.push({ url: String(url), method, body: init?.body ? JSON.parse(init.body) : undefined })
      return { ok: true, status: 200, json: async () => responder(String(url), method), text: async () => '' }
    }) as unknown as typeof fetch
    return { calls, restore: () => { globalThis.fetch = orig } }
  }

  it('patient turn-taking waits for the caller, and any interruption stops the agent at once', async () => {
    const s = capture()
    try {
      await engine.updateAgent('agent_1', { call: { endOnSilenceSecs: 30, patience: 'patient', fillers: true } })
    } finally {
      s.restore()
    }
    const turn = s.calls[0]!.body.conversation_config.turn
    expect(turn.turn_eagerness).toBe('patient')
    expect(turn.silence_end_call_timeout).toBe(30) // merged into the SAME turn object, not overwritten
    // an ignore list makes EL transcribe before it stops talking (barge-in bench, real call 2026-10-15)
    expect(turn.interruption_ignore_terms).toEqual([])
    expect(turn.interruption_ignore_term_languages).toEqual([])
    expect(turn.merge_with_default_ignore_terms).toBe(false)
    expect(turn.soft_timeout_config).toMatchObject({
      timeout_seconds: 1.5,
      message: 'Mm-hmm.',
      additional_soft_timeout_messages: ['Right, one sec.'],
      randomize_fillers: false, // ack first, "one sec" only if it is still thinking
      disable_until_first_user_message: true,
    })
  })

  it('turning fillers off disables the soft timeout; omitting them leaves the provider untouched', async () => {
    const s = capture()
    try {
      await engine.updateAgent('agent_1', { call: { fillers: false } })
      await engine.updateAgent('agent_1', { call: { maxDurationSecs: 300 } })
    } finally {
      s.restore()
    }
    expect(s.calls[0]!.body.conversation_config.turn.soft_timeout_config).toEqual({ timeout_seconds: -1 })
    expect(s.calls[1]!.body.conversation_config.turn).toBeUndefined()
  })

  it('reuses a secret by name, and creates it only when missing', async () => {
    const existing = capture(() => ({ secrets: [{ name: 'openrouter_api_key', secret_id: 'sec_1' }] }))
    try {
      expect(await engine.ensureSecret('openrouter_api_key', 'k')).toEqual({ secretId: 'sec_1' })
    } finally {
      existing.restore()
    }
    expect(existing.calls.map((c) => c.method)).toEqual(['GET'])

    const missing = capture((_url, method) => (method === 'GET' ? { secrets: [] } : { secret_id: 'sec_new' }))
    try {
      expect(await engine.ensureSecret('openrouter_api_key', 'k')).toEqual({ secretId: 'sec_new' })
    } finally {
      missing.restore()
    }
    expect(missing.calls[1]).toMatchObject({ method: 'POST', body: { type: 'new', name: 'openrouter_api_key', value: 'k' } })
  })
})

describe('switching models', () => {
  async function bodyOf(cfg: Parameters<typeof engine.updateAgent>[1]) {
    let body: any
    const orig = globalThis.fetch
    globalThis.fetch = (async (_u: string, init: any) => {
      body = JSON.parse(init.body)
      return { ok: true, status: 200, json: async () => ({}), text: async () => '' }
    }) as unknown as typeof fetch
    try {
      await engine.updateAgent('agent_1', cfg)
    } finally {
      globalThis.fetch = orig
    }
    return body.conversation_config.agent.prompt
  }

  it('a hosted model clears any custom LLM left from an OpenRouter pick (EL 400s otherwise)', async () => {
    expect(await bodyOf({ llm: 'gemini-2.5-flash' })).toMatchObject({ llm: 'gemini-2.5-flash', custom_llm: null })
  })

  it('an OpenRouter pick sets custom-llm; a save without a model leaves the provider model alone', async () => {
    const or = await bodyOf({ customLlm: { url: 'https://openrouter.ai/api/v1', modelId: 'openai/gpt-4.1-mini', apiKeySecretId: 's' } })
    expect(or.llm).toBe('custom-llm')
    expect(or.custom_llm).toMatchObject({ model_id: 'openai/gpt-4.1-mini', api_key: { secret_id: 's' } })
    const none = await bodyOf({ systemPrompt: 'x' })
    expect('llm' in none || 'custom_llm' in none).toBe(false)
  })
})

// 2026-10-14: every agent speaks like a person on a live call.
describe('human phone speech', () => {
  async function patchBody(cfg: Parameters<typeof engine.updateAgent>[1]) {
    let body: any
    const orig = globalThis.fetch
    globalThis.fetch = (async (_url: string, init: any) => {
      body = JSON.parse(init.body)
      return { ok: true, status: 200, json: async () => ({}), text: async () => '' }
    }) as unknown as typeof fetch
    try {
      await engine.updateAgent('agent_1', cfg)
    } finally {
      globalThis.fetch = orig
    }
    return body
  }

  it('adds the speaking style, sampling and the end-call/skip-turn tools whenever the prompt is sent', async () => {
    const prompt = (await patchBody({ systemPrompt: 'You are Acme.\n' })).conversation_config.agent.prompt
    expect(prompt.prompt.startsWith('You are Acme.\n\n## How you speak (live phone call)')).toBe(true)
    expect(prompt.temperature).toBeGreaterThan(0)
    expect(Object.keys(prompt.built_in_tools)).toEqual(['end_call', 'skip_turn'])
    // a real call hung up in the same reply that asked "…, right?"
    expect(prompt.built_in_tools.end_call.description).toContain('Never use it in a reply that asks a question')
    // spoken read-backs: phone numbers in groups, emails as words (simulated calls read digit by digit)
    expect(prompt.prompt).toContain('Phone numbers in small groups')
    expect(prompt.prompt).toContain('emails as "jane dot doe at acme dot com"')
    // calm goodbye: "!" made the voice sound over-excited on a real call; nothing new after their bye
    expect(prompt.prompt).toContain('then "Have a great day." After their bye, add nothing new, even when the bye came with an answer to your question: no pitch, offer, reminder or question.')
    expect(prompt.prompt).not.toContain('warm goodbye')
    expect(prompt.prompt).not.toContain('!') // an example with "!" gets copied, and the voice hypes it
    // v2, from two real calls that sounded robotic (2026-10-15)
    expect(prompt.prompt).toContain("Didn't catch it, or it's cut off: ask them to say it again")
    expect(prompt.prompt).toContain("If they talk over you, you've already stopped")
    // v3, from a real call that sounded canned (2026-11-06)
    expect(prompt.prompt).toContain('Answer first: your first words are the answer')
    expect(prompt.prompt).toContain('One idea per reply: usually one short sentence, two at most, each about a breath long.')
    expect(prompt.prompt).not.toMatch(/anything else I can help/i)
    expect(prompt.prompt.split('## How you speak (live phone call)')).toHaveLength(2) // exactly once
    // a save that doesn't carry the prompt leaves all three alone (PATCH deep-merges)
    const other = (await patchBody({ call: { maxDurationSecs: 300 } })).conversation_config.agent.prompt
    expect(['prompt', 'temperature', 'built_in_tools'].some((k) => k in other)).toBe(false)
  })

  // Round 3 (v14.2, 2026-11-06), from a hostile review of v14.1 on claude-haiku-5-5: any exact phrase in
  // the block becomes a canned opener ("Fair to double-check" opened 4 of 4 correction turns), bracket
  // tags get performed by eleven_v4_turbo, and it handed off to "a specialist" 7-8 times in one call.
  // Round 4 (v14.3, 2026-11-07): "I'm not wrong about the price" on disputes, 30+ word replies, cold
  // with frustrated callers. The block is what was measured, byte for byte; re-measure before editing it.
  it('speaks the measured round-4 style: described behaviour, no scripted wording', async () => {
    const style = phoneStyle()
    // no exact-phrase menu: the only quoted words are things callers say, things to drop, read-back
    // formats and the fixed goodbye; every scripted reply wording (incl. "Fair to double-check") is gone
    expect(style).not.toMatch(/Oh, gotcha|Mm, okay|Ah, right|Oh, sure|Got it\.|Perfect\.|Fair to double-check|You're right, sorry|double-check|never reuse the wording|→/)
    expect(new Set(style.match(/"[^"]*"/g))).toEqual(new Set([
      '"want me to...?"', '"does that help?"', '"anything else?"', // check-ins to drop
      '"five five five, one two three, four five six seven"', '"jane dot doe at acme dot com"', // read-back formats
      '"hello?"', '"wait"', '"mm-hmm"', '"hold on"', '"that\'s all"', '"um"', '"so"', // caller words / fillers
      '"Thanks for calling."', '"Thanks for your time."', '"Have a great day."', // the fixed goodbye
    ]))
    // no audio tags: none written, and told not to write any
    expect(style).not.toMatch(/\[[^\]]*\]/)
    expect(style).toContain('the voice reads your text exactly as written and brings its own warmth, so any warmth comes from the words you choose, never from a tag or stage direction in square brackets')
    // never re-ask, one question at most, details one at a time
    expect(style).toContain("Before asking anything, check the whole call, their first sentence included: what they've said, you use, never ask for.")
    expect(style).toContain('one at most, as your last sentence')
    expect(style).toContain('Details (name, email, phone, a time) one at a time: ask for one')
    expect(style).toContain("given several at once, say them back and ask only what's missing")
    // corrections described, not scripted
    expect(style).toContain('Told you got something wrong: re-check it in your head first.')
    // round 4: no defending ("I'm not wrong"); show the working, never cave on a correct fact
    expect(style).toContain("Right: leave who's right out of it and show the working instead, in fresh words: what they told you, what that gives, and where they can see it for themselves")
    expect(style).toContain('never changing a correct fact because they pushed')
    expect(style).toContain('No set phrase for either.')
    // a specialist / follow-up at most once per call
    expect(style).toContain("Offer someone's follow-up at most once per call, only for something they need that you can't answer")
    expect(style.match(/follow-up/g)).toHaveLength(2) // the cap and the goodbye, no other hand-off line
    // round 4: a little warmth for a frustrated caller, about their point, never about itself
    expect(style).toContain("let a little real warmth through first, a few easy words on their side about what's bothering them (their point, not a stock line, never about yourself)")
    // byte for byte what was measured (~/vf-sds-demo/human3/style-v3.txt, v14.3); the apply script's EXPECTED_SHA depends on it
    expect(createHash('sha256').update(style).digest('hex')).toBe('6bcaa642ed6ede7605e7d69894987e589a562c1ad4b8d861043b3b076b9197c5')
  })

  it('learned filler phrases are not a menu of reply openers; the newest is the slow-answer filler', async () => {
    const body = await patchBody({ systemPrompt: 'x', call: { fillers: true, fillerPhrases: ['Oh, gotcha.', 'Okay.'] } })
    const plain = await patchBody({ systemPrompt: 'x' })
    expect(body.conversation_config.agent.prompt.prompt).toBe(plain.conversation_config.agent.prompt.prompt)
    const soft = body.conversation_config.turn.soft_timeout_config
    // EL raises the max to the number of phrases, so never more than two (no stacked fillers)
    expect([soft.message, ...soft.additional_soft_timeout_messages]).toEqual(['Oh, gotcha.', 'Right, one sec.'])
    expect(soft.max_soft_timeouts_per_generation).toBe(2)
    expect(soft.use_llm_generated_message).toBeUndefined() // the filler model made up a price in testing
  })

  it('getAgent returns the owner\'s prompt without the added style', async () => {
    // the owner's own "## …" headings survive (the SDS demo prompt has "## Guardrails"); only the style goes
    const owner = 'You are Acme.\n\n## Guardrails\n- Quote the paid plan.'
    const sent = (await patchBody({ systemPrompt: owner })).conversation_config.agent.prompt.prompt
    expect(sent).toBe(`${owner}\n\n${phoneStyle()}`)
    const orig = globalThis.fetch
    globalThis.fetch = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ name: 'a', conversation_config: { agent: { prompt: { prompt: sent } } } }),
      text: async () => '',
    })) as unknown as typeof fetch
    try {
      expect((await engine.getAgent('agent_1')).systemPrompt).toBe(owner)
    } finally {
      globalThis.fetch = orig
    }
  })
})
