import type { BusinessProfile } from '@voiceflow/engine/templates'
import { describe, expect, it, vi } from 'vitest'
import {
  batchCalls,
  buildLearningMessages,
  extractSuggestions,
  MAX_BATCH_CHARS,
  MAX_SUGGESTIONS,
  parseSuggestions,
  type CallForLearning,
  type LearningContext,
} from './learning'
import type { ClassifierConfig, Judgement } from './outcome'

const profile: BusinessProfile = {
  businessName: "Joe's Plumbing",
  industry: 'plumbing',
  hours: 'Mon–Fri 8–6',
  services: ['drain cleaning'],
  faqs: [{ q: 'Saturday hours?', a: '9–1.' }],
  greetingStyle: 'friendly',
  voiceId: 'v1',
}

const ctx: LearningContext = { instructions: 'You answer calls for Joe. Always confirm the address.', profile }
const cfg: ClassifierConfig = { baseUrl: 'https://openrouter.ai/api/v1', model: 'typesafe/jev-router', apiKey: 'k' }

const verdict: Judgement = {
  outcome: 'question_answered', summary: 's', intent: 'price check', lead_score: 55, stage: 'considering',
  objection: 'price', urgency: 'low', sentiment: 'neutral', next_action: 'none', callback_hint: null,
  reason: 'Caller said it was over budget', model: 'typesafe/jev-router',
}

function call(id: string, msg: string): CallForLearning {
  return {
    id,
    outcome: 'escalated',
    transcript: [
      { role: 'agent', message: 'How can I help?' },
      { role: 'user', message: msg },
    ],
  }
}

describe('transcript batching (token cap)', () => {
  it('stops at the batch budget and reports what was dropped', () => {
    const calls = Array.from({ length: 200 }, (_, i) => call(`c${i}`, 'x'.repeat(1_000)))
    const { rendered, skipped } = batchCalls(calls)
    expect(rendered.length + skipped).toBe(200)
    expect(skipped).toBeGreaterThan(0)
    expect(rendered.join('\n\n').length).toBeLessThanOrEqual(MAX_BATCH_CHARS + 2 * rendered.length)
  })

  it("puts the agent's live instructions, business facts and call headers in the prompt", () => {
    const { messages } = buildLearningMessages(ctx, [call('abc-123', 'Do you do gutters?')])
    expect(messages[1].content).toContain('Always confirm the address.')
    expect(messages[1].content).toContain("Joe's Plumbing")
    expect(messages[1].content).toContain('Q: Saturday hours?')
    expect(messages[1].content).toContain('### Call abc-123')
    expect(messages[1].content).toContain('Caller: Do you do gutters?')
  })
})

describe("learning from the judge's verdicts", () => {
  it("renders the judge's verdict under the call header, before the transcript", () => {
    const { messages } = buildLearningMessages(ctx, [{ ...call('c9', 'Too pricey'), judgement: verdict }])
    const body = messages[1].content
    expect(body).toContain('### Call c9')
    expect(body).toContain('Judge: outcome=question_answered; lead score=55;')
    expect(body).toContain('objection=price')
    expect(body).toContain('reason="Caller said it was over budget"')
    expect(body.indexOf('Judge:')).toBeLessThan(body.indexOf('Caller: Too pricey'))
  })

  it('works for an agent with no seed profile (freeform / flow agents)', () => {
    const { messages } = buildLearningMessages({ instructions: 'Be brief.' }, [call('c1', 'hi')])
    expect(messages[1].content).toContain('Be brief.')
    expect(messages[1].content).not.toContain('## Business facts')
  })

  it('tells the model to use the verdicts and to confirm them in the transcript', () => {
    const { messages } = buildLearningMessages(ctx, [call('c1', 'hi')])
    expect(messages[0].content).toContain('"Judge:" line')
    expect(messages[0].content).toContain('confirm the problem in the transcript')
  })
})

describe('parseSuggestions', () => {
  const valid = new Set(['c1', 'c2'])

  it('keeps well-formed suggestions with verifiable evidence', () => {
    const out = parseSuggestions(
      JSON.stringify({
        suggestions: [
          {
            type: 'faq_addition',
            suggestion: { q: 'Gutters?', a: 'Yes.', frequency: 3 },
            evidence: [{ callId: 'c1', quote: 'do you do gutters' }],
          },
        ],
      }),
      valid
    )
    expect(out).toHaveLength(1)
    expect(out[0].suggestion.frequency).toBe(3)
  })

  it('drops unknown types, empty evidence, and hallucinated call ids', () => {
    const out = parseSuggestions(
      JSON.stringify({
        suggestions: [
          { type: 'rewrite_everything', suggestion: {}, evidence: [{ callId: 'c1', quote: 'q' }] },
          { type: 'prompt_tweak', suggestion: { instruction: 'x' }, evidence: [] },
          {
            type: 'kb_gap',
            suggestion: { topic: 'y' },
            evidence: [{ callId: 'not-in-batch', quote: 'q' }],
          },
        ],
      }),
      valid
    )
    expect(out).toHaveLength(0)
  })

  it('caps the count and survives non-JSON', () => {
    const many = Array.from({ length: 20 }, () => ({
      type: 'prompt_tweak',
      suggestion: { instruction: 'x' },
      evidence: [{ callId: 'c1', quote: 'q' }],
    }))
    expect(parseSuggestions(JSON.stringify({ suggestions: many }), valid)).toHaveLength(MAX_SUGGESTIONS)
    expect(parseSuggestions('the model rambled', valid)).toEqual([])
  })

  it('reads the object after reasoning prose that itself contains braces (Jev)', () => {
    const json = JSON.stringify({
      suggestions: [{ type: 'prompt_tweak', suggestion: { instruction: 'x' }, evidence: [{ callId: 'c1', quote: 'q' }] }],
    })
    expect(parseSuggestions(`Let me think. The shape is {"suggestions": [...]} so:\n${json}`, valid)).toHaveLength(1)
  })
})

describe('extractSuggestions', () => {
  it("sends to the judge's endpoint and model, and logs the billed cost", async () => {
    const content = JSON.stringify({
      suggestions: [
        {
          type: 'faq_addition',
          suggestion: { q: 'Sundays?', a: 'Emergencies only.' },
          evidence: [{ callId: 'c1', quote: 'are you open sundays' }],
        },
      ],
    })
    const fetchFn = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content } }],
            usage: { prompt_tokens: 10_000, completion_tokens: 500, cost: 0.0042 },
          }),
          { status: 200 }
        )
    ) as unknown as typeof fetch
    const res = await extractSuggestions(ctx, [call('c1', 'Are you open Sundays?')], cfg, fetchFn)
    expect(res?.suggestions).toHaveLength(1)
    expect(res?.costCents).toBeCloseTo(0.42, 5) // OpenRouter usage.cost is dollars
    const [url, init] = (fetchFn as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    const body = JSON.parse(String(init.body))
    expect(body.model).toBe('typesafe/jev-router')
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(body.max_tokens).toBeGreaterThanOrEqual(4000) // room for Jev to reason before the JSON
  })

  it('returns null on API failure and empty input', async () => {
    const fail = vi.fn(async () => new Response('nope', { status: 500 })) as unknown as typeof fetch
    expect(await extractSuggestions(ctx, [call('c1', 'hi')], cfg, fail)).toBeNull()
    expect(await extractSuggestions(ctx, [], cfg, fail)).toBeNull()
  })
})
