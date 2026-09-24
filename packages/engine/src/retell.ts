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

// Phase 26 — the second provider the architecture RFC keeps open (§5 "the adapter
// is your insurance", §10 "Stay on Retell as engine … the adapter keeps this open").
//
// Endpoints and payload shapes verified 2026-09-24 against docs.retellai.com and
// the generated RetellAI/retell-typescript-sdk (api.md + src/resources/*.ts,
// which is the SDK's own source of truth for request/response types).
//
// The shape of Retell that matters here: an agent is TWO objects. The response
// engine (a "Retell LLM") holds the prompt, first message, model, tools and
// knowledge bases; the agent holds the voice, language, webhook and post-call
// analysis, and points at the engine by id. Our neutral AgentConfig is one
// object, so almost every write below is a two-call dance.

const BASE = 'https://api.retellai.com'

/** Human name → Retell analysis field name (letters/digits/underscore). */
function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'field'
  )
}

/**
 * Retell Utterance[] → neutral TranscriptTurn[]. Retell names the text `content`
 * and gives no turn-level offset — only per-word timings — so the turn's start is
 * its first word's `start` (seconds, relative audio time per the SDK docstring).
 * Word timings themselves are dropped: nothing downstream reads them, and keeping
 * them would put a Retell-only field in `calls.transcript`.
 */
function toTurns(raw: unknown): TranscriptTurn[] {
  if (!Array.isArray(raw)) return []
  return raw.map((t: any) => ({
    role: String(t?.role ?? ''),
    message: String(t?.content ?? ''),
    time_in_call_secs: Number(t?.words?.[0]?.start ?? 0),
  }))
}

/**
 * Capabilities ElevenLabs has and Retell does not. These throw rather than
 * quietly no-op: a silent no-op here would look like a working feature in the
 * UI and produce nothing at the provider. Callers that can be reached by a
 * Retell org must guard on `agent.provider` first.
 */
function unsupported(what: string): never {
  throw new Error(`Retell does not support ${what} (Phase 26; see the decisions log)`)
}

export interface RetellEngineOpts {
  apiKey: string
  /**
   * Where Retell should POST call events. Set per agent at creation time —
   * Retell has no workspace-level webhook for calls the way ElevenLabs does.
   */
  webhookUrl?: string
}

export class RetellEngine implements VoiceEngine {
  constructor(private opts: RetellEngineOpts) {}

  private async req<T = any>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${this.opts.apiKey}`,
        ...(body !== undefined && { 'content-type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      throw new Error(`Retell ${method} ${path} → ${res.status}: ${await res.text()}`)
    }
    if (res.status === 204) return undefined as T
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
  }

  // ---------------------------------------------------------------- agents

  /** Prompt-side fields live on the Retell LLM, not the agent. */
  private toLlmConfig(cfg: Partial<AgentConfig>) {
    return {
      ...(cfg.systemPrompt !== undefined && { general_prompt: cfg.systemPrompt }),
      // '' is meaningful on both sides: the agent waits for the caller to speak.
      ...(cfg.firstMessage !== undefined && { begin_message: cfg.firstMessage }),
      ...(cfg.llm !== undefined && { model: cfg.llm }),
    }
  }

  /** Agent-side fields: voice, language, webhook, limits, analysis. */
  private toAgentConfig(cfg: Partial<AgentConfig>) {
    const analysis = cfg.analysis
    return {
      ...(cfg.name !== undefined && { agent_name: cfg.name }),
      ...(cfg.voiceId !== undefined && { voice_id: cfg.voiceId }),
      // Retell wants a full locale; our neutral config carries ISO 639-1.
      ...(cfg.language !== undefined && { language: RETELL_LOCALE[cfg.language] ?? cfg.language }),
      ...(this.opts.webhookUrl && { webhook_url: this.opts.webhookUrl }),
      ...(cfg.speech?.speed !== undefined && { voice_speed: cfg.speech.speed }),
      // Retell's knob is "how eager to interrupt", 0–1, same direction as EL's
      // stability in practice. Left unmapped rather than guessed: see the log.
      ...(cfg.call?.maxDurationSecs !== undefined && {
        max_call_duration_ms: cfg.call.maxDurationSecs * 1000,
      }),
      ...(cfg.call?.endOnSilenceSecs !== undefined && {
        end_call_after_silence_ms: cfg.call.endOnSilenceSecs * 1000,
      }),
      ...(cfg.transcription?.keywords?.length && { boosted_keywords: cfg.transcription.keywords }),
      ...(analysis && {
        post_call_analysis_data: [
          ...analysis.dataCollection.map((f) => ({
            type: f.type === 'number' ? 'number' : f.type === 'boolean' ? 'boolean' : 'string',
            name: slugify(f.name),
            description: f.description,
          })),
          // A success criterion is a yes/no judgement about the call, which is
          // exactly a boolean analysis field on Retell. The verdict comes back
          // in custom_analysis_data, alongside Retell's own call_successful.
          ...analysis.successCriteria.map((c) => ({
            type: 'boolean' as const,
            name: slugify(c.name),
            description: c.prompt,
          })),
        ],
      }),
    }
  }

  async createAgent(cfg: AgentConfig): Promise<{ providerAgentId: string }> {
    if (cfg.workflow) {
      // Retell's equivalent is the conversation-flow object, a different graph
      // model (nodes carry their own edges and tool bindings). Mapping Phase 18
      // graphs onto it is its own phase — refuse rather than half-build a flow.
      unsupported('conversational-flow agents yet (workflow graphs are ElevenLabs-only here)')
    }

    if (cfg.customLlm) {
      // Our AgentConfig.customLlm is an OpenAI-COMPATIBLE HTTP endpoint (that is
      // what ElevenLabs' custom_llm takes). Retell's 'custom-llm' is a different
      // animal: their own WebSocket protocol, at llm_websocket_url. Handing our
      // https URL to that field would mint an agent that can never answer a call.
      unsupported('bring-your-own LLM endpoints (its custom-llm is a Retell WebSocket protocol, not an OpenAI-compatible URL)')
    }
    const llm = await this.req('POST', '/create-retell-llm', this.toLlmConfig(cfg))
    const response_engine = { type: 'retell-llm', llm_id: llm.llm_id }

    const agent = await this.req('POST', '/create-agent', {
      response_engine,
      voice_id: cfg.voiceId,
      ...this.toAgentConfig(cfg),
    })
    return { providerAgentId: agent.agent_id as string }
  }

  /** The agent's response-engine id, needed for every prompt-side write. */
  private async llmIdFor(providerAgentId: string): Promise<string> {
    const agent = await this.req('GET', `/get-agent/${providerAgentId}`)
    const id = agent?.response_engine?.llm_id
    if (!id) {
      throw new Error(`Retell agent ${providerAgentId} has no retell-llm response engine`)
    }
    return id as string
  }

  async updateAgent(providerAgentId: string, cfg: Partial<AgentConfig>) {
    if (cfg.workflow) unsupported('conversational-flow agents yet')
    const llmPatch = this.toLlmConfig(cfg)
    if (Object.keys(llmPatch).length) {
      await this.req('PATCH', `/update-retell-llm/${await this.llmIdFor(providerAgentId)}`, llmPatch)
    }
    const agentPatch = this.toAgentConfig(cfg)
    if (Object.keys(agentPatch).length) {
      await this.req('PATCH', `/update-agent/${providerAgentId}`, agentPatch)
    }
  }

  async deleteAgent(providerAgentId: string) {
    // Read the engine id BEFORE the agent goes away, or the LLM is orphaned in
    // the workspace with no way left to find it.
    const llmId = await this.llmIdFor(providerAgentId).catch(() => null)
    await this.req('DELETE', `/delete-agent/${providerAgentId}`)
    if (llmId) await this.req('DELETE', `/delete-retell-llm/${llmId}`).catch(() => {})
  }

  async getAgent(providerAgentId: string): Promise<AgentConfig> {
    const agent = await this.req('GET', `/get-agent/${providerAgentId}`)
    const llmId = agent?.response_engine?.llm_id
    const llm = llmId ? await this.req('GET', `/get-retell-llm/${llmId}`) : {}
    return {
      name: agent.agent_name ?? '',
      systemPrompt: llm.general_prompt ?? '',
      firstMessage: llm.begin_message ?? '',
      voiceId: agent.voice_id ?? '',
      ...(llm.model && { llm: llm.model }),
      ...(agent.language && { language: String(agent.language).split('-')[0] }),
    }
  }

  // --------------------------------------------------------------- numbers

  async importNumber(_twilioSid: string, _e164: string): Promise<{ providerNumberId: string }> {
    // ElevenLabs takes Twilio account credentials and does the wiring itself.
    // Retell has no such endpoint: a Twilio number reaches Retell over an
    // elastic SIP trunk, which is exactly what importSipNumber already models.
    unsupported('importing a Twilio number by account SID — import it as a SIP trunk instead')
  }

  async importSipNumber(cfg: SipNumberConfig): Promise<{ providerNumberId: string }> {
    const res = await this.req('POST', '/import-phone-number', {
      phone_number: cfg.e164,
      termination_uri: cfg.address,
      ...(cfg.username && { sip_trunk_auth_username: cfg.username }),
      ...(cfg.password && { sip_trunk_auth_password: cfg.password }),
      ...(cfg.transport && cfg.transport !== 'auto' && { transport: cfg.transport.toUpperCase() }),
      nickname: cfg.label,
    })
    // Retell mints no surrogate id — every number endpoint is keyed by the
    // E.164 itself, so that is what we store in provider_number_id.
    return { providerNumberId: (res.phone_number as string) ?? cfg.e164 }
  }

  async deleteNumber(providerNumberId: string) {
    await this.req('DELETE', `/delete-phone-number/${encodeURIComponent(providerNumberId)}`)
  }

  async attachNumber(providerNumberId: string, providerAgentId: string) {
    await this.req('PATCH', `/update-phone-number/${encodeURIComponent(providerNumberId)}`, {
      inbound_agents: [{ agent_id: providerAgentId, weight: 1 }],
      outbound_agents: [{ agent_id: providerAgentId, weight: 1 }],
    })
  }

  async detachNumber(providerNumberId: string) {
    await this.req('PATCH', `/update-phone-number/${encodeURIComponent(providerNumberId)}`, {
      inbound_agents: [],
      outbound_agents: [],
    })
  }

  // ----------------------------------------------------------------- calls

  /** Outbound needs a number we own that routes to this agent. */
  private async fromNumberFor(providerAgentId: string): Promise<string> {
    const list = await this.req('GET', '/v2/list-phone-numbers')
    const numbers: any[] = Array.isArray(list) ? list : (list?.phone_numbers ?? [])
    const match = numbers.find((n) =>
      (n.outbound_agents ?? []).some((a: any) => a.agent_id === providerAgentId)
    )
    if (!match) throw new Error(`No Retell number routes outbound to agent ${providerAgentId}`)
    return match.phone_number as string
  }

  async startOutboundCall(providerAgentId: string, toE164: string, vars?: Record<string, string>) {
    const res = await this.req('POST', '/v2/create-phone-call', {
      from_number: await this.fromNumberFor(providerAgentId),
      to_number: toE164,
      override_agent_id: providerAgentId,
      ...(vars && { retell_llm_dynamic_variables: vars }),
    })
    return { providerCallId: res.call_id as string }
  }

  async startBatch(
    providerAgentId: string,
    contacts: { e164: string; vars?: Record<string, string> }[]
  ): Promise<{ batchId: string }> {
    const res = await this.req('POST', '/create-batch-call', {
      from_number: await this.fromNumberFor(providerAgentId),
      tasks: contacts.map((c) => ({
        to_number: c.e164,
        ...(c.vars && { retell_llm_dynamic_variables: c.vars }),
      })),
    })
    return { batchId: res.batch_call_id as string }
  }

  async listCalls(afterUnix: number, beforeUnix: number): Promise<ProviderCall[]> {
    // Retell timestamps are milliseconds; our interface speaks unix seconds.
    // Paginated like the ElevenLabs adapter: this feeds reconciliation, which is
    // the billing source of truth (rule 5), so a page cap that quietly drops the
    // tail would under-bill a busy day and look exactly like a quiet day.
    const calls: any[] = []
    let cursor: string | undefined
    for (let page = 0; ; page++) {
      if (page >= MAX_CALL_PAGES) {
        throw new Error(
          `Retell list-calls exceeded ${MAX_CALL_PAGES} pages for ${afterUnix}..${beforeUnix} — refusing to reconcile a truncated window`
        )
      }
      const res = await this.req('POST', '/v3/list-calls', {
        filter_criteria: {
          start_timestamp: { lower_threshold: afterUnix * 1000, upper_threshold: beforeUnix * 1000 },
        },
        limit: CALL_PAGE_SIZE,
        ...(cursor && { pagination_key: cursor }),
      })
      const batch: any[] = Array.isArray(res) ? res : (res?.calls ?? [])
      calls.push(...batch)
      // A bare-array response carries no cursor, so one page is all there is.
      cursor = Array.isArray(res) ? undefined : res?.pagination_key
      if (!cursor || batch.length < CALL_PAGE_SIZE) break
    }
    return calls.map((c) => ({
      providerCallId: c.call_id,
      providerAgentId: c.agent_id,
      direction: c.direction === 'outbound' ? 'outbound' : 'inbound',
      startedAt: new Date(c.start_timestamp ?? 0).toISOString(),
      durationSecs: Math.round((c.duration_ms ?? 0) / 1000),
      status: c.call_status ?? 'ended',
    }))
  }

  async fetchRecording(providerCallId: string): Promise<{ audio: ArrayBuffer; contentType: string }> {
    const call = await this.req('GET', `/v2/get-call/${providerCallId}`)
    const url = call?.recording_url
    if (!url) throw new Error(`Retell call ${providerCallId} has no recording_url`)
    // The URL is already a signed/public object URL — it takes no API key, and
    // sending one would be a credential leak to a CDN host.
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Retell recording ${providerCallId} → ${res.status}`)
    return {
      audio: await res.arrayBuffer(),
      contentType: res.headers.get('content-type') ?? 'audio/wav',
    }
  }

  // ------------------------------------------------------------- knowledge

  async createKnowledgeDoc(source: {
    name: string
    url?: string
    text?: string
    file?: { name: string; data: Blob }
  }): Promise<{ knowledgeId: string }> {
    // Retell's unit is a knowledge BASE holding many sources; ours is one doc.
    // One base per doc keeps the neutral model honest (attach/detach/remove all
    // act on a single thing) at the cost of more bases in the workspace.
    const form = new FormData()
    form.append('knowledge_base_name', source.name.slice(0, 40))
    if (source.url) form.append('knowledge_base_urls', source.url)
    if (source.text) {
      form.append(
        'knowledge_base_texts',
        JSON.stringify({ title: source.name, text: source.text })
      )
    }
    if (source.file) form.append('knowledge_base_files', source.file.data, source.file.name)

    const res = await fetch(`${BASE}/create-knowledge-base`, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.opts.apiKey}` }, // no content-type: FormData sets the boundary
      body: form,
    })
    if (!res.ok) throw new Error(`Retell POST /create-knowledge-base → ${res.status}: ${await res.text()}`)
    const body = (await res.json()) as { knowledge_base_id: string }
    return { knowledgeId: body.knowledge_base_id }
  }

  /** Knowledge attaches to the response engine, not the agent. */
  private async patchKnowledgeBaseIds(providerAgentId: string, ids: string[]) {
    await this.req('PATCH', `/update-retell-llm/${await this.llmIdFor(providerAgentId)}`, {
      knowledge_base_ids: ids,
    })
  }

  private async knowledgeBaseIdsOf(providerAgentId: string): Promise<string[]> {
    const llm = await this.req('GET', `/get-retell-llm/${await this.llmIdFor(providerAgentId)}`)
    return (llm?.knowledge_base_ids ?? []) as string[]
  }

  async attachKnowledge(
    providerAgentId: string,
    doc: { knowledgeId: string; name: string; type: KnowledgeSource['type'] }
  ) {
    const ids = await this.knowledgeBaseIdsOf(providerAgentId)
    if (ids.includes(doc.knowledgeId)) return // idempotent, per the interface
    await this.patchKnowledgeBaseIds(providerAgentId, [...ids, doc.knowledgeId])
  }

  async detachKnowledge(providerAgentId: string, knowledgeId: string) {
    const ids = await this.knowledgeBaseIdsOf(providerAgentId)
    await this.patchKnowledgeBaseIds(
      providerAgentId,
      ids.filter((id) => id !== knowledgeId)
    )
  }

  async listKnowledge(providerAgentId: string): Promise<KnowledgeSource[]> {
    const ids = await this.knowledgeBaseIdsOf(providerAgentId)
    const bases = await Promise.all(
      ids.map((id) => this.req('GET', `/get-knowledge-base/${id}`).catch(() => null))
    )
    return bases.filter(Boolean).map((b: any) => ({
      knowledgeId: b.knowledge_base_id,
      name: b.knowledge_base_name ?? '',
      type: KB_TYPE[b.knowledge_base_sources?.[0]?.type] ?? 'text',
    }))
  }

  async removeKnowledge(knowledgeId: string) {
    // Retell detaches on delete: an id that disappears is simply dropped from
    // every LLM that referenced it, so there is no force flag to pass.
    await this.req('DELETE', `/delete-knowledge-base/${knowledgeId}`)
  }

  // ----------------------------------------------------------------- tools

  async setAgentTools(providerAgentId: string, tools: AgentTool[]) {
    await this.req('PATCH', `/update-retell-llm/${await this.llmIdFor(providerAgentId)}`, {
      general_tools: tools.map((t) => ({
        type: 'custom',
        name: slugify(t.name),
        description: t.description,
        url: t.url,
        method: 'POST',
        speak_during_execution: true,
        speak_after_execution: true,
        ...(t.timeoutSecs && { timeout_ms: t.timeoutSecs * 1000 }),
        ...(t.secretHeader && { headers: { [t.secretHeader.name]: t.secretHeader.value } }),
        parameters: {
          type: 'object',
          properties: Object.fromEntries(
            t.params.map((p) => [p.name, { type: p.type, description: p.description }])
          ),
          required: t.params.filter((p) => p.required).map((p) => p.name),
        },
        // EL fills system params itself; on Retell the equivalent is a dynamic
        // variable substituted into the request. VERIFY against a live tool call
        // before relying on booking attribution for a Retell org.
        ...(t.systemParams?.length && {
          query_params: Object.fromEntries(
            t.systemParams.map((p) => [p.name, `{{${RETELL_SYSTEM_VAR[p.source]}}}`])
          ),
        }),
      })),
    })
  }

  // --------------------------------------------------------------- voices

  async listVoices(): Promise<Voice[]> {
    const res = await this.req('GET', '/list-voices')
    const voices: any[] = Array.isArray(res) ? res : (res?.voices ?? [])
    return voices.map((v) => ({
      voiceId: v.voice_id,
      name: v.voice_name ?? v.voice_id,
      previewUrl: v.preview_audio_url ?? null,
      // Retell's discriminator is which TTS vendor the voice comes from.
      ...(v.provider && { category: v.provider }),
    }))
  }

  // ------------------------------------------------- ElevenLabs-only paths

  testWidgetEmbed(_providerAgentId: string): never {
    // Retell's in-browser test is a web call: POST /v3/create-web-call for a
    // short-lived access token, then their client SDK opens WebRTC. That cannot
    // be expressed as a static <tag> descriptor, and a token minted at render
    // time would leak into the HTML. Needs its own phase.
    unsupported('a static test-widget embed (its browser test needs a minted web-call token)')
  }

  async setAgentPublic(_providerAgentId: string, _isPublic: boolean): Promise<void> {
    unsupported('public agents — it has no signed/unsigned widget auth toggle')
  }

  async createSecret(_name: string, _value: string): Promise<{ secretId: string }> {
    unsupported('workspace secrets — a custom-LLM URL carries its own auth')
  }

  async simulateConversation(
    _providerAgentId: string,
    _spec: SimulationSpec
  ): Promise<SimulationResult> {
    // Retell tests agents through stored test-case definitions and async batch
    // jobs (/create-test-case-definition, /create-batch-test), not a synchronous
    // "run this persona once and grade it". Different model, own phase.
    unsupported('one-shot scripted simulation (its testing API is stored test cases + async jobs)')
  }

  // ------------------------------------------------------------ operations

  async ping(): Promise<void> {
    await this.req('GET', '/get-api-key-info')
  }

  /**
   * `x-retell-signature: v=<unix ms>,d=<hex hmac-sha256>` over `body + timestamp`,
   * keyed by the API KEY itself — Retell issues no separate webhook secret.
   * Algorithm read from retell-typescript-sdk src/lib/webhook_auth.ts and checked
   * against that SDK's own published test vector; implemented here with
   * node:crypto because our interface is synchronous and theirs is WebCrypto.
   */
  verifyWebhook(req: WebhookRequest): boolean {
    if (!req.signature) return false
    const m = /^v=(\d+),d=([0-9a-f]+)$/i.exec(req.signature)
    if (!m) return false
    const stamp = Number(m[1])
    if (!Number.isSafeInteger(stamp)) return false
    if (Math.abs(Date.now() - stamp) > 5 * 60 * 1000) return false // their tolerance
    const digest = createHmac('sha256', this.opts.apiKey)
      .update(`${req.rawBody}${stamp}`)
      .digest('hex')
    const a = Buffer.from(m[2]!.toLowerCase())
    const b = Buffer.from(digest)
    return a.length === b.length && timingSafeEqual(a, b)
  }

  describeWebhook(payload: unknown): { eventId: string; isPostCall: boolean } {
    const p = payload as any
    const event = p?.event ?? 'unknown'
    return {
      // Retell sends no delivery id either; event + call id is unique per kind.
      eventId: `${event}:${p?.call?.call_id ?? 'unknown'}`,
      // call_ended fires at hangup WITHOUT analysis; call_analyzed is the one
      // that carries call_analysis, so it is the one that writes the calls row.
      isPostCall: event === 'call_analyzed',
    }
  }

  /** Normalizes a call_analyzed webhook payload. */
  normalizeCallEvent(payload: unknown): CallEvent {
    const p = payload as any
    if (p?.event !== 'call_analyzed' || !p?.call?.call_id) {
      throw new Error(`Not a call_analyzed payload: ${p?.event}`)
    }
    const c = p.call
    const direction: CallEvent['direction'] = c.direction === 'outbound' ? 'outbound' : 'inbound'
    const analysis = this.normalizeAnalysis(c.call_analysis)
    const durationMs =
      c.duration_ms ??
      (c.end_timestamp && c.start_timestamp ? c.end_timestamp - c.start_timestamp : 0)
    return {
      providerCallId: c.call_id,
      providerAgentId: c.agent_id ?? '',
      direction,
      // Retell reports the two legs as from/to directly — no inbound/outbound
      // flip needed, unlike ElevenLabs' agent_number/external_number pair.
      fromE164: c.from_number ?? null,
      toE164: c.to_number ?? null,
      // Retell timestamps are MILLISECONDS. Reading them as seconds puts every
      // call in the year 57000 and is the bug this adapter is most likely to have.
      startedAt: new Date(c.start_timestamp ?? 0).toISOString(),
      durationSecs: Math.round(durationMs / 1000),
      transcript: toTurns(c.transcript_object),
      recordingUrl: c.recording_url ?? null,
      status: c.call_status ?? 'ended',
      // call_cost.combined_cost IS in cents here (unlike ElevenLabs' credits),
      // but rule 5 stands: billing truth comes from reconciliation, not a webhook.
      ...(analysis && { analysis }),
    }
  }

  /**
   * Retell's call_analysis → neutral CallAnalysis:
   *   call_successful: boolean            → success
   *   user_sentiment: Positive|Negative|… → sentiment
   *   custom_analysis_data: {name: value} → data
   *   (no per-criterion breakdown)        → criteria: the one verdict it does give
   */
  private normalizeAnalysis(a: any): CallAnalysis | undefined {
    if (!a || typeof a !== 'object') return undefined
    const out: CallAnalysis = {}
    if (typeof a.call_successful === 'boolean') {
      out.success = a.call_successful
      // Retell judges the call once and does not say why. Surfacing that single
      // verdict as one criterion is the same fact reshaped, not an invented one —
      // it keeps `criteria` meaning "what the provider judged" on both adapters.
      // No `rationale` key: Retell has nothing to put in it.
      out.criteria = [
        { name: 'call_successful', result: a.call_successful ? 'success' : 'failure' },
      ]
    }
    if (a.custom_analysis_data && typeof a.custom_analysis_data === 'object') {
      const data = { ...(a.custom_analysis_data as Record<string, unknown>) }
      if (Object.keys(data).length) out.data = data
    }
    // Case-folded: Retell capitalises its enum, ElevenLabs does not (Phase 26 parity).
    if (a.user_sentiment != null) out.sentiment = String(a.user_sentiment).toLowerCase()
    return Object.keys(out).length ? out : undefined
  }
}

/** Page size and hard page cap for list-calls (reconciliation, rule 5). */
const CALL_PAGE_SIZE = 500
const MAX_CALL_PAGES = 200

/** ISO 639-1 → the full locale Retell expects. Unlisted codes pass through. */
const RETELL_LOCALE: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-PT',
  it: 'it-IT',
  nl: 'nl-NL',
  hi: 'hi-IN',
  ja: 'ja-JP',
  zh: 'zh-CN',
}

/** Retell knowledge-base source kinds → our neutral three. */
const KB_TYPE: Record<string, KnowledgeSource['type']> = {
  url: 'url',
  document: 'file',
  file: 'file',
  text: 'text',
}

/** Our system-param sources → Retell dynamic variables. */
const RETELL_SYSTEM_VAR: Record<string, string> = {
  conversationId: 'call_id',
  callerId: 'from_number',
  agentId: 'agent_id',
}
