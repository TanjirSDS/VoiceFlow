// Server-only side of the model picker (2026-10-09): OpenRouter's live model catalogue,
// and the shared provider secret that lets agents talk through it.
import type { Env } from '@voiceflow/db'
import type { VoiceEngine } from '@voiceflow/engine'
import { OPENROUTER_SECRET_NAME, type OpenRouterModel } from './model-choice'

interface RawModel {
  id: string
  name?: string
  context_length?: number | null
  pricing?: { prompt?: string; completion?: string }
  supported_parameters?: string[]
}

const perMillion = (v?: string) => {
  const n = Number(v)
  return v !== undefined && Number.isFinite(n) && n >= 0 ? Math.round(n * 1_000_000 * 100) / 100 : null
}

/** Pure mapping from OpenRouter's /models payload, sorted by name. Tested. */
export function toOpenRouterModels(raw: unknown): OpenRouterModel[] {
  const data = (raw as { data?: RawModel[] } | null)?.data
  if (!Array.isArray(data)) return []
  return data
    .filter((m) => typeof m?.id === 'string')
    .map((m) => ({
      id: m.id,
      name: m.name ?? m.id,
      promptPerM: perMillion(m.pricing?.prompt),
      completionPerM: perMillion(m.pricing?.completion),
      contextLength: m.context_length ?? null,
      tools: !!m.supported_parameters?.includes('tools'),
      reasoning: !!m.supported_parameters?.includes('reasoning'),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** The public catalogue (no key needed), cached an hour; [] if OpenRouter is unreachable. */
export async function listOpenRouterModels(): Promise<OpenRouterModel[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5_000),
    })
    return res.ok ? toOpenRouterModels(await res.json()) : []
  } catch {
    return []
  }
}

export function openRouterKey(
  env: Pick<Env, 'OPENROUTER_API_KEY' | 'CLASSIFIER_API_KEY' | 'CLASSIFIER_BASE_URL'>
): string | undefined {
  if (env.OPENROUTER_API_KEY) return env.OPENROUTER_API_KEY
  return env.CLASSIFIER_BASE_URL.includes('openrouter.ai') ? env.CLASSIFIER_API_KEY : undefined
}

/** The provider-side secret every OpenRouter agent references (created once, then reused). */
export async function openRouterSecretId(engine: VoiceEngine, key: string | undefined) {
  if (!key) return undefined
  return (await engine.ensureSecret(OPENROUTER_SECRET_NAME, key)).secretId
}
