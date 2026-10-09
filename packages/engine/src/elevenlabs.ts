import { createHmac, timingSafeEqual } from 'node:crypto'
import type {
  AgentConfig,
  AgentTool,
  CallAnalysis,
  CallEvent,
  KnowledgeSource,
  ProviderCall,
  SimulationResult,
  SimulationSpec,
  SipNumberConfig,
  TranscriptTurn,
  Voice,
  VoiceEngine,
  WebhookRequest,
} from './types'
import { KnowledgeIndexError } from './types'
import { workflowFromProvider, workflowToProvider } from './workflow-map'

/** KB docs attached to individual flow steps (EL additional_knowledge_base). */
const nodeKbIds = (cfg: Partial<AgentConfig>) => [
  ...new Set((cfg.workflow?.nodes ?? []).flatMap((n) => (n.kb ?? []).map((k) => k.knowledgeId))),
]

/**
 * ElevenLabs turns → neutral TranscriptTurn (Phase 26). EL already names these
 * three keys, so this drops nothing the UI reads — it drops the provider extras
 * (tool calls, per-turn metrics) that used to ride into the jsonb column and
 * quietly made `calls.transcript` an ElevenLabs-shaped field.
 */
function toTurns(raw: unknown): TranscriptTurn[] {
  if (!Array.isArray(raw)) return []
  return raw.map((t: any) => ({
    role: String(t?.role ?? ''),
    message: String(t?.message ?? ''),
    time_in_call_secs: Number(t?.time_in_call_secs ?? 0),
  }))
}

/** Human name → provider identifier (data_collection key / evaluation criterion id). */
function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'field'
  )
}

// Endpoint paths verified against https://elevenlabs.io/docs/eleven-agents/api-reference
// on 2026-07-12. Payload details marked VERIFY below must be confirmed against a
// captured live webhook/response in Phase 1 (rule 6).

const BASE = 'https://api.elevenlabs.io'

export interface ElevenLabsEngineOpts {
  apiKey: string
  webhookSecret: string
  /** Delay between RAG-index status polls (tests pass 0). */
  ragPollMs?: number
}

// Retrieval (RAG) for every agent that carries knowledge. Without it EL stuffs each doc
// into the prompt, which only works up to ~300k chars total; past that the agent cannot
// use its KB at all. Retrieval adds ~250 ms per turn. Chunk/length caps keep per-turn
// context small for voice. https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/rag
const RAG_MODEL = 'e5_mistral_7b_instruct'
// 5 chunks / 8k chars per turn: on the SDS demo call, 8 / 15k made the model read
// ~15k chars of context before every answer (LLM first-byte 1.2-2.8 s).
const RAG = { enabled: true, max_retrieved_rag_chunks_count: 5, max_documents_length: 8000 }

// Short acknowledgements a caller says WHILE the agent talks. They shouldn't cut it off;
// a real interruption still does. Used with EL's curated English defaults.
const BACKCHANNELS = ['uh-huh', 'mm-hmm', 'mhm', 'yeah', 'right', 'okay', 'got it', 'i see']
// Neutral acknowledgements only: a filler fires on ANY slow turn — after "I'm busy" or
// "don't call me" too — so "Good question" / "Let me check that" sounded robotic (seen in
// end-to-end tests, 2026-10-09).
const FILLERS = ['Mm-hmm.', 'Okay.', 'Right, one sec.']
const RAG_WAIT_MS = 90_000

export class ElevenLabsEngine implements VoiceEngine {
  constructor(private opts: ElevenLabsEngineOpts) {}

  private async req<T = any>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'xi-api-key': this.opts.apiKey,
        ...(body !== undefined && { 'content-type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      throw new Error(`ElevenLabs ${method} ${path} → ${res.status}: ${await res.text()}`)
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
  }

  /**
   * Maps our AgentConfig onto ElevenLabs' nested conversation_config +
   * platform_settings. PATCH deep-merges top-level keys, so partial configs only
   * touch the fields they carry. Phase 12 field paths verified against the
   * Create/Update-agent OpenAPI on 2026-07-13:
   *   conversation_config.tts.{stability(0-1,def .5)|similarity_boost(0-1,def .8)|speed(def 1)}
   *   conversation_config.asr.keywords: string[]  (ASR bias words)
   *   conversation_config.conversation.max_duration_seconds: int (def 600)
   *   conversation_config.turn.silence_end_call_timeout: number sec (def -1 = off)
   *   platform_settings.data_collection: map<identifier,{type,description}>
   *   platform_settings.evaluation.criteria: [{id,name,type:'prompt',conversation_goal_prompt}]
   *   platform_settings.auth.enable_auth: bool (false = public)
   * MCP (agent.prompt.mcp_server_ids) takes PRE-REGISTERED server ids, not URLs,
   * so it isn't exposed here — see the Phase 12 log for the verdict.
   */
  private toProviderConfig(cfg: Partial<AgentConfig>) {
    // Custom LLM (verified 2026-07-13): prompt.llm='custom-llm' + prompt.custom_llm
    // {url, model_id?, api_key:{secret_id}} — the key is a workspace-secret ref,
    // never a plain string. https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm
    const custom = cfg.customLlm
    const nodeKb = nodeKbIds(cfg)
    const conversation_config: Record<string, unknown> = {
      agent: {
        // empty string ⇒ user speaks first (agent waits); verified against
        // https://elevenlabs.io/docs/api-reference/agents/create
        ...(cfg.firstMessage !== undefined && { first_message: cfg.firstMessage }),
        language: cfg.language ?? 'en',
        prompt: {
          ...(cfg.systemPrompt !== undefined && { prompt: cfg.systemPrompt }),
          ...(nodeKb.length && { rag: RAG }),
          ...(custom
            ? {
                llm: 'custom-llm',
                custom_llm: {
                  url: custom.url,
                  ...(custom.modelId && { model_id: custom.modelId }),
                  ...(custom.apiKeySecretId && { api_key: { secret_id: custom.apiKeySecretId } }),
                },
              }
            : // PATCH deep-merges, so a custom_llm left from an earlier OpenRouter pick survives a
              // switch back — and EL then 400s "custom_llm can only be set if llm is set to
              // CUSTOM_LLM" (live, 2026-10-09). Clear it whenever a hosted model is chosen.
              cfg.llm !== undefined && { llm: cfg.llm, custom_llm: null }),
        },
      },
    }

    // tts carries the voice AND the speech tuning — build it once so neither clobbers the other.
    const tts: Record<string, number | string> = {}
    if (cfg.voiceId !== undefined) tts.voice_id = cfg.voiceId
    if (cfg.speech?.stability !== undefined) tts.stability = cfg.speech.stability
    if (cfg.speech?.similarityBoost !== undefined) tts.similarity_boost = cfg.speech.similarityBoost
    if (cfg.speech?.speed !== undefined) tts.speed = cfg.speech.speed
    if (Object.keys(tts).length) conversation_config.tts = tts

    if (cfg.transcription?.keywords) conversation_config.asr = { keywords: cfg.transcription.keywords }
    if (cfg.call?.maxDurationSecs !== undefined)
      conversation_config.conversation = { max_duration_seconds: cfg.call.maxDurationSecs }
    // Turn-taking lives under conversation_config.turn (TurnConfig, verified 2026-10-09):
    // turn_eagerness patient|normal|eager, soft_timeout_config (filler while the LLM is slow),
    // interruption_ignore_terms (backchannels that must not cut the agent off).
    const turn: Record<string, unknown> = {}
    if (cfg.call?.endOnSilenceSecs !== undefined) turn.silence_end_call_timeout = cfg.call.endOnSilenceSecs
    if (cfg.call?.patience) {
      turn.turn_eagerness = cfg.call.patience
      turn.interruption_ignore_terms = BACKCHANNELS
      turn.interruption_ignore_term_languages = ['en']
      turn.merge_with_default_ignore_terms = true
    }
    if (cfg.call?.fillers !== undefined) {
      turn.soft_timeout_config = cfg.call.fillers
        ? {
            timeout_seconds: 1.5,
            message: FILLERS[0],
            additional_soft_timeout_messages: FILLERS.slice(1),
            randomize_fillers: true,
            max_soft_timeouts_per_generation: 1,
            disable_until_first_user_message: true,
          }
        : { timeout_seconds: -1 }
    }
    if (Object.keys(turn).length) conversation_config.turn = turn

    const platform_settings: Record<string, unknown> = {}
    if (cfg.analysis) {
      // data_collection is keyed by identifier; our human name slugifies to the key
      // and reappears as data_collection_id in the post-call results.
      platform_settings.data_collection = Object.fromEntries(
        cfg.analysis.dataCollection
          .slice(0, 30)
          .map((f) => [slugify(f.name), { type: f.type, description: f.description }])
      )
      platform_settings.evaluation = {
        criteria: cfg.analysis.successCriteria.slice(0, 30).map((c) => ({
          id: slugify(c.name),
          name: c.name,
          type: 'prompt',
          conversation_goal_prompt: c.prompt,
        })),
      }
    }
    if (cfg.widget?.public !== undefined) platform_settings.auth = { enable_auth: !cfg.widget.public }

    // Flow agents: let real SDK/phone callers start at a chosen node (opt-in gate at
    // platform_settings.overrides.enable_starting_workflow_node_id_from_client — verified
    // Phase 18; the embed widget can't carry it, so the Test picker rides simulate). VERIFY live.
    if (cfg.workflow) {
      platform_settings.overrides = {
        ...(platform_settings.overrides as object | undefined),
        enable_starting_workflow_node_id_from_client: true,
      }
    }

    return {
      ...(cfg.name !== undefined && { name: cfg.name }),
      conversation_config,
      ...(Object.keys(platform_settings).length && { platform_settings }),
      // workflow is a TOP-LEVEL sibling of conversation_config in the create/update body
      // (verified Phase 18 — NOT conversation_config.workflow). Absent for single/custom agents.
      ...(cfg.workflow && { workflow: workflowToProvider(cfg.workflow) }),
    }
  }

  async createAgent(cfg: AgentConfig) {
    await this.ensureRagIndexes(nodeKbIds(cfg))
    const res = await this.req('POST', '/v1/convai/agents/create', this.toProviderConfig(cfg))
    return { providerAgentId: res.agent_id as string }
  }

  async updateAgent(providerAgentId: string, cfg: Partial<AgentConfig>) {
    await this.ensureRagIndexes(nodeKbIds(cfg))
    await this.req('PATCH', `/v1/convai/agents/${providerAgentId}`, this.toProviderConfig(cfg))
  }

  async deleteAgent(providerAgentId: string) {
    await this.req('DELETE', `/v1/convai/agents/${providerAgentId}`)
  }

  /**
   * GET /v1/convai/agents/{id} → neutral AgentConfig. GET returns a TOP-LEVEL `workflow`
   * (verified Phase 18), so hydration/round-trip works. Parses the fields the builder
   * cares about (name/prompt/first-message/voice/llm/language/custom-LLM + workflow); the
   * Phase 12 tuning settings aren't reversed — our stored config is the authoritative
   * hydration source, this is for verification/drift.
   */
  async getAgent(providerAgentId: string): Promise<AgentConfig> {
    const a = await this.req('GET', `/v1/convai/agents/${providerAgentId}`)
    const agent = a.conversation_config?.agent ?? {}
    const prompt = agent.prompt ?? {}
    const workflow = workflowFromProvider(a.workflow)
    return {
      name: a.name ?? '',
      systemPrompt: prompt.prompt ?? '',
      firstMessage: agent.first_message ?? '',
      voiceId: a.conversation_config?.tts?.voice_id ?? '',
      ...(prompt.llm && prompt.llm !== 'custom-llm' && { llm: prompt.llm }),
      ...(agent.language && { language: agent.language }),
      ...(prompt.custom_llm && {
        customLlm: {
          url: prompt.custom_llm.url,
          ...(prompt.custom_llm.model_id && { modelId: prompt.custom_llm.model_id }),
          ...(prompt.custom_llm.api_key?.secret_id && { apiKeySecretId: prompt.custom_llm.api_key.secret_id }),
        },
      }),
      ...(workflow && { workflow }),
    }
  }

  // ElevenLabs wants the Twilio *account* creds of the account holding the number
  // — the org's subaccount. Parent creds point it at the wrong account.
  async importNumber(e164: string, twilio: { accountSid: string; authToken: string }) {
    const res = await this.req('POST', '/v1/convai/phone-numbers', {
      provider: 'twilio',
      phone_number: e164,
      label: e164,
      sid: twilio.accountSid,
      token: twilio.authToken,
    })
    return { providerNumberId: res.phone_number_id as string }
  }

  // SIP-trunk import. Nested inbound/outbound trunk config per
  // CreateSIPTrunkPhoneNumberRequestV2 (verified against docs 2026-07-13). One
  // credential set is reused both directions; split if members ever need per-leg auth.
  async importSipNumber(cfg: SipNumberConfig) {
    const credentials = cfg.username
      ? { username: cfg.username, password: cfg.password ?? null }
      : undefined
    const inbound =
      cfg.allowedAddresses?.length || credentials
        ? {
            inbound_trunk_config: {
              ...(cfg.allowedAddresses?.length && { allowed_addresses: cfg.allowedAddresses }),
              ...(credentials && { credentials }),
            },
          }
        : {}
    const res = await this.req('POST', '/v1/convai/phone-numbers', {
      provider: 'sip_trunk',
      phone_number: cfg.e164,
      label: cfg.label,
      outbound_trunk_config: {
        address: cfg.address,
        transport: cfg.transport ?? 'auto',
        ...(credentials && { credentials }),
      },
      ...inbound,
    })
    return { providerNumberId: res.phone_number_id as string }
  }

  // DELETE response body is undefined in the OpenAPI ("Any type") — don't parse it.
  async deleteNumber(providerNumberId: string) {
    await this.req('DELETE', `/v1/convai/phone-numbers/${providerNumberId}`)
  }

  async attachNumber(providerNumberId: string, providerAgentId: string) {
    await this.req('PATCH', `/v1/convai/phone-numbers/${providerNumberId}`, {
      agent_id: providerAgentId,
    })
  }

  /** agent_id is nullable in UpdatePhoneNumberRequest — null unassigns (verified against docs 2026-07-12). */
  async detachNumber(providerNumberId: string) {
    await this.req('PATCH', `/v1/convai/phone-numbers/${providerNumberId}`, { agent_id: null })
  }

  /** The outbound endpoints need the provider phone-number id; look it up by assigned agent. */
  private async phoneNumberIdFor(providerAgentId: string): Promise<string> {
    const numbers = await this.req<any[]>('GET', '/v1/convai/phone-numbers')
    const match = numbers.find(
      (n) => n.assigned_agent?.agent_id === providerAgentId || n.agent_id === providerAgentId
    )
    if (!match) throw new Error(`No phone number attached to agent ${providerAgentId}`)
    return match.phone_number_id as string
  }

  async startOutboundCall(
    providerAgentId: string,
    toE164: string,
    vars?: Record<string, string>,
    startNodeId?: string
  ) {
    // starting_workflow_node_id needs the agent's enable_starting_workflow_node_id_from_client
    // (set on every flow agent in toProviderConfig). Verified live 2026-10-09: a node with no
    // incoming edge is accepted, and the conversation opens on it.
    const initiation = {
      ...(vars && { dynamic_variables: vars }),
      ...(startNodeId && { starting_workflow_node_id: startNodeId }),
    }
    const res = await this.req('POST', '/v1/convai/twilio/outbound-call', {
      agent_id: providerAgentId,
      agent_phone_number_id: await this.phoneNumberIdFor(providerAgentId),
      to_number: toE164,
      ...(Object.keys(initiation).length && { conversation_initiation_client_data: initiation }),
    })
    // 200 is not success: the body carries {success, message} and a null conversation_id
    // when the dial was refused — that must not be recorded as a call in flight.
    if (!res.success || !res.conversation_id) throw new Error(res.message || 'Outbound call was not started')
    // conversation_id is the id post-call webhooks reference — that is our providerCallId.
    return { providerCallId: res.conversation_id as string }
  }

  async startBatch(
    providerAgentId: string,
    contacts: { e164: string; vars?: Record<string, string> }[]
  ) {
    const res = await this.req('POST', '/v1/convai/batch-calling/submit', {
      call_name: `batch-${contacts.length}-contacts`,
      agent_id: providerAgentId,
      agent_phone_number_id: await this.phoneNumberIdFor(providerAgentId),
      recipients: contacts.map((c) => ({
        phone_number: c.e164,
        ...(c.vars && { conversation_initiation_client_data: { dynamic_variables: c.vars } }),
      })),
    })
    return { batchId: res.id as string }
  }

  // Create a workspace KB doc. url/text return JSON directly; file is multipart.
  // Endpoints + {id,name,folder_path} response verified against docs 2026-07-13.
  async createKnowledgeDoc(source: {
    name: string
    url?: string
    text?: string
    file?: { name: string; data: Blob }
  }): Promise<{ knowledgeId: string }> {
    let doc: any
    if (source.url) {
      doc = await this.req('POST', '/v1/convai/knowledge-base/url', { url: source.url, name: source.name })
    } else if (source.text) {
      doc = await this.req('POST', '/v1/convai/knowledge-base/text', { text: source.text, name: source.name })
    } else if (source.file) {
      const form = new FormData()
      form.append('file', source.file.data, source.file.name)
      form.append('name', source.name)
      const res = await fetch(`${BASE}/v1/convai/knowledge-base/file`, {
        method: 'POST',
        headers: { 'xi-api-key': this.opts.apiKey },
        body: form,
      })
      if (!res.ok) throw new Error(`ElevenLabs KB file upload → ${res.status}: ${await res.text()}`)
      doc = await res.json()
    } else {
      throw new Error('createKnowledgeDoc needs url, text, or file')
    }
    // Start the RAG index now so it is usually ready by the time someone attaches the doc.
    // Best effort: attachKnowledge waits for (and reports) the real status.
    await this.req('POST', `/v1/convai/knowledge-base/${doc.id}/rag-index`, { model: RAG_MODEL }).catch(() => {})
    return { knowledgeId: doc.id as string }
  }

  // Attach shape {type,id,name} on conversation_config.agent.prompt.knowledge_base —
  // KnowledgeBaseLocator verified 2026-07-13 (usage_mode defaults 'auto'). The PATCH
  // replaces the whole array, so we GET the current list and resend it appended/filtered.
  async attachKnowledge(
    providerAgentId: string,
    doc: { knowledgeId: string; name: string; type: KnowledgeSource['type'] }
  ) {
    const existing = await this.knowledgeBaseOf(providerAgentId)
    if (existing.some((e) => e.id === doc.knowledgeId)) return
    // EL refuses (422 rag_index_not_ready) to attach a doc to a retrieval agent before its
    // index exists — verified live 2026-10-09 — so build/await it first.
    await this.ensureRagIndex(doc.knowledgeId)
    await this.patchKnowledgeBase(
      providerAgentId,
      [...existing, { type: doc.type, id: doc.knowledgeId, name: doc.name }],
      RAG
    )
  }

  async detachKnowledge(providerAgentId: string, knowledgeId: string) {
    const existing = await this.knowledgeBaseOf(providerAgentId)
    await this.patchKnowledgeBase(
      providerAgentId,
      existing.filter((e) => e.id !== knowledgeId)
    )
  }

  private async knowledgeBaseOf(providerAgentId: string): Promise<any[]> {
    const agent = await this.req('GET', `/v1/convai/agents/${providerAgentId}`)
    return agent.conversation_config?.agent?.prompt?.knowledge_base ?? []
  }

  // rag is sent only on attach: detaching the last doc leaves retrieval on, which is harmless.
  private async patchKnowledgeBase(providerAgentId: string, knowledge_base: any[], rag?: typeof RAG) {
    await this.req('PATCH', `/v1/convai/agents/${providerAgentId}`, {
      conversation_config: { agent: { prompt: { knowledge_base, ...(rag && { rag }) } } },
    })
  }

  /**
   * POST .../rag-index is idempotent: the first call starts the index, later calls report
   * its status (new|created|processing|succeeded|failed|rag_limit_exceeded|
   * document_too_small|cannot_index_folder — RAGIndexStatus, verified 2026-10-09).
   * Docs under 500 bytes are never indexed; EL puts them in the prompt instead.
   */
  private async ensureRagIndex(knowledgeId: string) {
    const deadline = Date.now() + RAG_WAIT_MS
    for (;;) {
      const r = await this.req('POST', `/v1/convai/knowledge-base/${knowledgeId}/rag-index`, { model: RAG_MODEL })
      if (r?.status === 'succeeded' || r?.status === 'document_too_small') return
      if (r?.status === 'rag_limit_exceeded') {
        throw new KnowledgeIndexError('The knowledge base storage limit for this plan is reached. Remove a document and try again.')
      }
      if (r?.status === 'failed' || r?.status === 'cannot_index_folder') {
        throw new KnowledgeIndexError('This document could not be indexed. Try re-uploading it in another format.')
      }
      if (Date.now() >= deadline) {
        throw new KnowledgeIndexError('This document is still being indexed. Try again in a minute.')
      }
      await new Promise((done) => setTimeout(done, this.opts.ragPollMs ?? 3000))
    }
  }

  private async ensureRagIndexes(ids: string[]) {
    for (const id of ids) await this.ensureRagIndex(id)
  }

  async listKnowledge(providerAgentId: string): Promise<KnowledgeSource[]> {
    const entries = await this.knowledgeBaseOf(providerAgentId)
    return entries.map((e) => ({ knowledgeId: e.id, name: e.name, type: e.type }))
  }

  // ponytail: force=true deletes the doc AND auto-detaches it from every agent
  // (verified Phase 2) — exactly what "delete detaches everywhere" needs.
  async removeKnowledge(knowledgeId: string) {
    await this.req('DELETE', `/v1/convai/knowledge-base/${knowledgeId}?force=true`)
  }

  // ponytail: first page of 100 voices only; add next_page_token pagination when
  // an account actually exceeds that.
  async listVoices(): Promise<Voice[]> {
    const res = await this.req('GET', '/v2/voices?page_size=100')
    return (res.voices as any[]).map((v) => ({
      voiceId: v.voice_id,
      name: v.name,
      previewUrl: v.preview_url ?? null,
      category: v.category,
    }))
  }

  /** GET /v1/user — free, no credits consumed; the health check's reachability probe. */
  async ping(): Promise<void> {
    await this.req('GET', '/v1/user')
  }

  /**
   * Standalone tools + prompt.tool_ids (inline prompt.tools was removed by
   * ElevenLabs 2025-07-23; verified against docs 2026-07-12). Replace-then-
   * delete: create the new tools, point tool_ids at exactly them, then delete
   * the previously attached ones — idempotent, no orphan tools accumulate.
   * ponytail: secretHeader is stored as a plain header string, visible to our
   * own workspace members via the tools API — switch to POST /v1/convai/secrets
   * + {secret_id} if the workspace ever has untrusted members.
   */
  async setAgentTools(providerAgentId: string, tools: AgentTool[]) {
    const SYSTEM_VARS = {
      conversationId: 'system__conversation_id',
      callerId: 'system__caller_id',
      agentId: 'system__agent_id',
    } as const

    const agent = await this.req('GET', `/v1/convai/agents/${providerAgentId}`)
    const oldIds: string[] = agent.conversation_config?.agent?.prompt?.tool_ids ?? []

    const newIds: string[] = []
    for (const t of tools) {
      const res = await this.req('POST', '/v1/convai/tools', {
        tool_config: {
          type: 'webhook',
          name: t.name,
          description: t.description,
          response_timeout_secs: t.timeoutSecs ?? 20,
          api_schema: {
            url: t.url,
            method: 'POST',
            content_type: 'application/json',
            ...(t.secretHeader && { request_headers: { [t.secretHeader.name]: t.secretHeader.value } }),
            request_body_schema: {
              type: 'object',
              required: t.params.filter((p) => p.required).map((p) => p.name),
              properties: {
                ...Object.fromEntries(
                  t.params.map((p) => [p.name, { type: p.type, description: p.description }])
                ),
                ...Object.fromEntries(
                  (t.systemParams ?? []).map((p) => [
                    p.name,
                    { type: 'string', dynamic_variable: SYSTEM_VARS[p.source] },
                  ])
                ),
              },
            },
          },
        },
      })
      newIds.push(res.id as string)
    }

    await this.req('PATCH', `/v1/convai/agents/${providerAgentId}`, {
      conversation_config: { agent: { prompt: { tool_ids: newIds } } },
    })

    for (const id of oldIds) {
      await this.req('DELETE', `/v1/convai/tools/${id}`).catch(() => {
        /* already gone or shared — an orphan tool is harmless */
      })
    }
  }

  /**
   * Phase 16: POST /v1/convai/agents/{id}/simulate-conversation (verified against
   * elevenlabs.io/docs/api-reference/agents/simulate-conversation, 2026-07-13).
   * The endpoint is DEPRECATED in favor of /v1/convai/agent-testing/create +
   * /v1/convai/agents/{id}/run-tests, but it stays the single-call fit for our
   * ad-hoc "{persona, criteria} → {verdict, transcript}" simulation (the newer
   * flow is a two-step create-then-run test-suite API). Upgrade there if EL drops it.
   *   Body: {simulation_specification:{simulated_user_config:{prompt:{prompt}}},
   *          extra_evaluation_criteria?:[PromptEvaluationCriteria]}  — the persona
   *   goes in simulated_user_config.prompt.prompt; the extra criterion reuses the
   *   same {id,name,type:'prompt',conversation_goal_prompt} shape as
   *   platform_settings.evaluation.criteria (Phase 12).
   *   Response: {simulated_conversation:[{role,message,...}], analysis:{...}} where
   *   analysis is the same post-call model normalizeAnalysis() already maps.
   */
  async simulateConversation(providerAgentId: string, spec: SimulationSpec): Promise<SimulationResult> {
    const criteria = spec.criteria?.trim()
    const res = await this.req('POST', `/v1/convai/agents/${providerAgentId}/simulate-conversation`, {
      simulation_specification: {
        simulated_user_config: { prompt: { prompt: spec.userPrompt } },
        // Flow agents (Phase 18): start the sim at a chosen node. starting_workflow_node_id's
        // verified home is the conversation-initiation request; the simulate endpoint's
        // acceptance of it here is UNVERIFIED — confirm on a live run. Only sent when picked.
        ...(spec.startingNodeId && {
          conversation_initiation_client_data: { starting_workflow_node_id: spec.startingNodeId },
        }),
      },
      ...(criteria && {
        extra_evaluation_criteria: [
          { id: 'sim_success', name: 'Simulation success', type: 'prompt', conversation_goal_prompt: criteria },
        ],
      }),
    })
    const turns = Array.isArray(res.simulated_conversation) ? res.simulated_conversation : []
    const analysis = this.normalizeAnalysis(res.analysis)
    return {
      passed: analysis?.success ?? null,
      transcript: turns.map((t: any) => ({ role: t.role ?? 'agent', message: t.message ?? t.text ?? '' })),
      ...(analysis?.criteria && { criteria: analysis.criteria }),
      ...(res.analysis?.transcript_summary && { summary: String(res.analysis.transcript_summary) }),
    }
  }

  /** Embed per https://elevenlabs.io/docs/eleven-agents/customization/widget —
   *  NOTE: the widget needs the agent public with authentication disabled.
   *  dynamic-variables: a JSON-object string, e.g. '{"user_name":"John"}'
   *  (verified 2026-07-13 against the widget + dynamic-variables docs). */
  testWidgetEmbed(providerAgentId: string) {
    return {
      scriptSrc: 'https://unpkg.com/@elevenlabs/convai-widget-embed',
      tagName: 'elevenlabs-convai',
      attrs: { 'agent-id': providerAgentId },
      dynamicVariablesAttr: 'dynamic-variables',
    }
  }

  /** platform_settings.auth.enable_auth=false ⇒ public (widget works signed-out).
   *  Verified 2026-07-13; the field sits behind a $ref in the create schema —
   *  confirm on a live GET. https://elevenlabs.io/docs/eleven-agents/customization/authentication */
  async setAgentPublic(providerAgentId: string, isPublic: boolean) {
    await this.req('PATCH', `/v1/convai/agents/${providerAgentId}`, {
      platform_settings: { auth: { enable_auth: !isPublic } },
    })
  }

  /** POST /v1/convai/secrets {type:'new',name,value} → {secret_id} (verified
   *  2026-07-13). Referenced elsewhere as {secret_id}, so a custom-LLM key lands
   *  at the provider, never in our DB. https://elevenlabs.io/docs/api-reference/workspace/secrets/create */
  // ponytail: reuses by NAME and never rewrites the value — to rotate the key, delete the
  // secret in the provider dashboard and the next save recreates it.
  async ensureSecret(name: string, value: string) {
    const res = await this.req('GET', '/v1/convai/secrets')
    const found = (res.secrets as { name: string; secret_id: string }[] | undefined)?.find((s) => s.name === name)
    return found ? { secretId: found.secret_id } : this.createSecret(name, value)
  }

  async createSecret(name: string, value: string) {
    const res = await this.req('POST', '/v1/convai/secrets', { type: 'new', name, value })
    return { secretId: res.secret_id as string }
  }

  /** GET /v1/convai/conversations/{id}/audio — verified against docs 2026-07-12. */
  // ponytail: buffered, not streamed — call recordings are a few MB and a
  // Content-Length makes <audio> seeking reliable; stream + Range support if
  // recordings ever get long.
  async fetchRecording(providerCallId: string) {
    const res = await fetch(`${BASE}/v1/convai/conversations/${providerCallId}/audio`, {
      headers: { 'xi-api-key': this.opts.apiKey },
    })
    if (!res.ok) {
      throw new Error(`ElevenLabs GET conversation audio → ${res.status}: ${await res.text()}`)
    }
    return {
      audio: await res.arrayBuffer(),
      contentType: res.headers.get('content-type') ?? 'audio/mpeg',
    }
  }

  /** GET /v1/convai/conversations with call_start_{after,before}_unix + cursor
   *  pagination (page_size max 100, has_more/next_cursor) — verified against docs 2026-07-12. */
  async listCalls(afterUnix: number, beforeUnix: number): Promise<ProviderCall[]> {
    const out: ProviderCall[] = []
    let cursor: string | undefined
    do {
      const qs = new URLSearchParams({
        call_start_after_unix: String(afterUnix),
        call_start_before_unix: String(beforeUnix),
        page_size: '100',
        ...(cursor && { cursor }),
      })
      const res = await this.req('GET', `/v1/convai/conversations?${qs}`)
      for (const c of res.conversations as any[]) {
        out.push({
          providerCallId: c.conversation_id,
          providerAgentId: c.agent_id,
          direction: c.direction === 'outbound' ? 'outbound' : 'inbound',
          startedAt: new Date(c.start_time_unix_secs * 1000).toISOString(),
          durationSecs: c.call_duration_secs ?? 0,
          status: c.status ?? 'done',
        })
      }
      cursor = res.has_more ? res.next_cursor : undefined
    } while (cursor)
    return out
  }

  /**
   * Header format: `elevenlabs-signature: t=<unix>,v0=<hex hmac-sha256 of "<t>.<rawBody>">`.
   * VERIFY against a live webhook in Phase 1 (docs point at SDK constructEvent).
   */
  verifyWebhook(req: WebhookRequest): boolean {
    if (!req.signature) return false
    const parts = Object.fromEntries(req.signature.split(',').map((p) => p.split('=', 2)))
    const t = parts['t']
    const v0 = parts['v0']
    if (!t || !v0) return false
    if (Math.abs(Date.now() / 1000 - Number(t)) > 30 * 60) return false // stale/replayed
    const digest = createHmac('sha256', this.opts.webhookSecret)
      .update(`${t}.${req.rawBody}`)
      .digest('hex')
    const a = Buffer.from(v0)
    const b = Buffer.from(digest)
    return a.length === b.length && timingSafeEqual(a, b)
  }

  describeWebhook(payload: unknown): { eventId: string; isPostCall: boolean } {
    const p = payload as any
    return {
      // Phase 1: ElevenLabs webhooks carry no event id of their own.
      eventId: `${p?.type}:${p?.data?.conversation_id ?? 'unknown'}`,
      isPostCall: p?.type === 'post_call_transcription',
    }
  }

  /** Normalizes a post_call_transcription webhook payload. */
  normalizeCallEvent(payload: unknown): CallEvent {
    const p = payload as any
    if (p?.type !== 'post_call_transcription' || !p?.data?.conversation_id) {
      throw new Error(`Not a post_call_transcription payload: ${p?.type}`)
    }
    const d = p.data
    const meta = d.metadata ?? {}
    const pc = meta.phone_call ?? {} // {direction, agent_number, external_number} — VERIFY vs captured fixture
    const direction: CallEvent['direction'] = pc.direction === 'outbound' ? 'outbound' : 'inbound'
    const analysis = this.normalizeAnalysis(d.analysis)
    return {
      providerCallId: d.conversation_id,
      providerAgentId: d.agent_id ?? '',
      direction,
      fromE164: (direction === 'inbound' ? pc.external_number : pc.agent_number) ?? null,
      toE164: (direction === 'inbound' ? pc.agent_number : pc.external_number) ?? null,
      startedAt: new Date((meta.start_time_unix_secs ?? p.event_timestamp) * 1000).toISOString(),
      durationSecs: meta.call_duration_secs ?? 0,
      transcript: toTurns(d.transcript),
      // Recording arrives via a separate post_call_audio webhook / fetch API — Phase 3 concern.
      recordingUrl: null,
      status: d.status ?? 'done',
      // metadata.cost is in ElevenLabs credits, not cents; money comes from reconciliation (rule 5).
      ...(analysis && { analysis }),
    }
  }

  /**
   * Phase 12: map data.analysis (verified against the Get-Conversation OpenAPI,
   * same model as the post_call_transcription webhook):
   *   call_successful: 'success'|'failure'|'unknown'  → success true/false/undefined
   *   evaluation_criteria_results: map<id,{criteria_id,result,rationale}>  → criteria[]
   *   data_collection_results: map<id,{value,rationale,...}>  → data{id: value}
   * Sentiment is NOT native to ElevenLabs; a seeded "user_sentiment" data field,
   * if present, is surfaced into the neutral `sentiment` slot for convenience.
   */
  private normalizeAnalysis(a: any): CallAnalysis | undefined {
    if (!a || typeof a !== 'object') return undefined
    const out: CallAnalysis = {}
    if (a.call_successful === 'success') out.success = true
    else if (a.call_successful === 'failure') out.success = false

    if (a.evaluation_criteria_results && typeof a.evaluation_criteria_results === 'object') {
      const criteria = Object.values(a.evaluation_criteria_results as Record<string, any>).map((r) => ({
        name: r.criteria_id ?? '',
        result: r.result ?? 'unknown',
        ...(r.rationale && { rationale: r.rationale }),
      }))
      if (criteria.length) out.criteria = criteria
    }

    if (a.data_collection_results && typeof a.data_collection_results === 'object') {
      const data = Object.fromEntries(
        Object.entries(a.data_collection_results as Record<string, any>).map(([k, v]) => [k, v?.value])
      )
      if (Object.keys(data).length) {
        out.data = data
        // Case-folded so it matches every other adapter (Phase 26 parity).
        if (data.user_sentiment != null) out.sentiment = String(data.user_sentiment).toLowerCase()
      }
    }

    return Object.keys(out).length ? out : undefined
  }
}
