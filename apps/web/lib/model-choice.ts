// Which LLM an agent talks with (2026-10-09). Browser-safe: shared by the model picker
// and the save action. Two families:
//  - a provider-hosted id (ElevenLabs runs it, e.g. 'gemini-2.5-flash') → AgentConfig.llm
//  - any OpenRouter model, 'openrouter:<model id>' in the UI → AgentConfig.customLlm
//    pointing at OpenRouter's OpenAI-compatible endpoint (ElevenLabs' custom-LLM path,
//    verified live: OpenRouter streams + tool-calls the way it requires).
import type { AgentConfig } from '@voiceflow/engine'

export const OPENROUTER_URL = 'https://openrouter.ai/api/v1'
export const OPENROUTER_PREFIX = 'openrouter:'
/** Name of the shared provider secret holding the OpenRouter key. */
export const OPENROUTER_SECRET_NAME = 'openrouter_api_key'

export interface OpenRouterModel {
  id: string
  name: string
  /** USD per 1M tokens (prompt / completion); null when OpenRouter lists none. */
  promptPerM: number | null
  completionPerM: number | null
  contextLength: number | null
  /** Tool calling is how the voice platform ends calls and routes flows — without it some features break. */
  tools: boolean
  /** Reasoning models think before they speak: noticeably slower first words on a call. */
  reasoning: boolean
}

// OpenRouter ids look like 'vendor/model' with an optional ':variant' (e.g. ':free').
const OPENROUTER_ID = /^[a-z0-9][\w.-]*\/[\w.:-]+$/i

export const isOpenRouterChoice = (choice: string) => choice.startsWith(OPENROUTER_PREFIX)

/** The picker value for a stored config. */
export function modelChoiceOf(cfg: Pick<AgentConfig, 'llm' | 'customLlm'>, fallback: string): string {
  if (cfg.customLlm?.url === OPENROUTER_URL && cfg.customLlm.modelId) return OPENROUTER_PREFIX + cfg.customLlm.modelId
  return cfg.llm || fallback
}

/**
 * Apply a picker value to a config. OpenRouter → customLlm (needs the shared secret id);
 * a hosted id → llm, dropping an OpenRouter customLlm so the provider stops using it.
 * A custom_llm agent's own endpoint (not OpenRouter) is never touched here.
 */
export function applyModelChoice(cfg: AgentConfig, choice: string, openRouterSecretId?: string): AgentConfig {
  if (isOpenRouterChoice(choice)) {
    const modelId = choice.slice(OPENROUTER_PREFIX.length)
    if (!OPENROUTER_ID.test(modelId)) throw new Error(`Not an OpenRouter model id: ${modelId}`)
    if (!openRouterSecretId) throw new Error('OpenRouter is not configured on this server.')
    const { llm: _drop, ...rest } = cfg
    return { ...rest, customLlm: { url: OPENROUTER_URL, modelId, apiKeySecretId: openRouterSecretId } }
  }
  const { customLlm, ...rest } = cfg
  return { ...rest, llm: choice, ...(customLlm && customLlm.url !== OPENROUTER_URL && { customLlm }) }
}

/** Short label for a picker value: the hosted model's label, or the OpenRouter id. */
export function modelChoiceLabel(choice: string, hostedLabel: (id: string) => string): string {
  return isOpenRouterChoice(choice) ? choice.slice(OPENROUTER_PREFIX.length) : hostedLabel(choice)
}
