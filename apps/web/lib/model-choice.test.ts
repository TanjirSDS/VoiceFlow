import { describe, expect, it } from 'vitest'
import type { AgentConfig } from '@voiceflow/engine'
import { applyModelChoice, modelChoiceLabel, modelChoiceOf, OPENROUTER_URL } from './model-choice'
import { openRouterKey, toOpenRouterModels } from './openrouter-models'

const base: AgentConfig = { name: 'a', systemPrompt: 'p', firstMessage: '', voiceId: 'v', llm: 'gemini-2.5-flash' }

describe('model choice', () => {
  it('an OpenRouter pick routes the agent through OpenRouter with the shared secret', () => {
    const cfg = applyModelChoice(base, 'openrouter:anthropic/claude-haiku-4.5', 'sec_1')
    expect(cfg.customLlm).toEqual({ url: OPENROUTER_URL, modelId: 'anthropic/claude-haiku-4.5', apiKeySecretId: 'sec_1' })
    expect(cfg.llm).toBeUndefined()
    expect(modelChoiceOf(cfg, 'gemini-2.5-flash')).toBe('openrouter:anthropic/claude-haiku-4.5')
  })

  it('picking a hosted model again drops the OpenRouter route', () => {
    const onOpenRouter = applyModelChoice(base, 'openrouter:openai/gpt-4.1-mini', 'sec_1')
    const back = applyModelChoice(onOpenRouter, 'gpt-4o')
    expect(back.llm).toBe('gpt-4o')
    expect(back.customLlm).toBeUndefined()
    expect(modelChoiceOf(back, 'x')).toBe('gpt-4o')
  })

  it("never touches a custom-LLM agent's own endpoint", () => {
    const own = { ...base, customLlm: { url: 'https://llm.acme.dev/v1', modelId: 'acme-1' } }
    expect(applyModelChoice(own, 'gpt-4o').customLlm).toEqual(own.customLlm)
    expect(modelChoiceOf({ customLlm: own.customLlm }, 'gemini-2.5-flash')).toBe('gemini-2.5-flash')
  })

  it('accepts any OpenRouter id shape (variants too) but refuses junk, and needs the key', () => {
    expect(() => applyModelChoice(base, 'openrouter:meta-llama/llama-3.3-70b-instruct:free', 's')).not.toThrow()
    expect(() => applyModelChoice(base, 'openrouter:typesafe/jev-router', 's')).not.toThrow()
    expect(() => applyModelChoice(base, 'openrouter:not a model', 's')).toThrow(/Not an OpenRouter model id/)
    expect(() => applyModelChoice(base, 'openrouter:openai/gpt-4.1-mini', undefined)).toThrow(/not configured/)
  })

  it('labels OpenRouter picks by id and hosted ones by their label', () => {
    expect(modelChoiceLabel('openrouter:openai/gpt-4.1-mini', () => 'x')).toBe('openai/gpt-4.1-mini')
    expect(modelChoiceLabel('gpt-4o', (id) => `L:${id}`)).toBe('L:gpt-4o')
  })
})

describe('OpenRouter catalogue', () => {
  it('maps price per million tokens, tool support and reasoning, sorted by name', () => {
    const models = toOpenRouterModels({
      data: [
        { id: 'z/slow', name: 'Zeta', pricing: { prompt: '0.000003', completion: '0.000015' }, supported_parameters: ['tools', 'reasoning'] },
        { id: 'a/free', name: 'Alpha', pricing: { prompt: '0', completion: '0' }, supported_parameters: [] },
        { name: 'no id' },
      ],
    })
    expect(models.map((m) => m.id)).toEqual(['a/free', 'z/slow'])
    expect(models[1]).toMatchObject({ promptPerM: 3, completionPerM: 15, tools: true, reasoning: true })
    expect(models[0]).toMatchObject({ promptPerM: 0, tools: false, reasoning: false })
    expect(toOpenRouterModels(null)).toEqual([])
  })

  it('uses its own key, else the classifier key only when that already points at OpenRouter', () => {
    const base = { CLASSIFIER_API_KEY: 'ck', CLASSIFIER_BASE_URL: 'https://openrouter.ai/api/v1' }
    expect(openRouterKey({ ...base, OPENROUTER_API_KEY: 'ok' })).toBe('ok')
    expect(openRouterKey(base)).toBe('ck')
    expect(openRouterKey({ ...base, CLASSIFIER_BASE_URL: 'https://api.openai.com/v1' })).toBeUndefined()
  })
})
