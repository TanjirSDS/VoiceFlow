import { describe, expect, it, vi } from 'vitest'
import fixture from '../../../packages/engine/fixtures/post-call-transcription.json'
import { buildMessages, classifierConfig, classifyCall, deriveOutcome, parseOutcome } from './outcome'

const transcript = fixture.data.transcript
const cfg = { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: 'sk-test' }

function fakeOpenAI(content: string) {
  return vi.fn(async () =>
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 })
  ) as unknown as typeof fetch
}

describe('outcome extraction', () => {
  it('builds one prompt line per spoken turn, labeled by speaker', () => {
    const [system, user] = buildMessages(transcript)
    expect(system.content).toContain('lead_captured')
    expect(user.content).toBe(
      [
        "Agent: Thanks for calling Joe's Plumbing, this is an AI assistant. How can I help?",
        'Caller: Hi, my kitchen sink is leaking.',
        'Agent: Sorry to hear that. Can I get your name and number so we can schedule a visit?',
      ].join('\n')
    )
  })

  it('classifies the fixture transcript from the model response', async () => {
    const fetchFn = fakeOpenAI('{"outcome":"lead_captured","summary":"Caller reported a leaking sink; contact details collected."}')
    const result = await classifyCall(transcript, cfg, fetchFn)
    expect(result).toMatchObject({
      outcome: 'lead_captured',
      summary: 'Caller reported a leaking sink; contact details collected.',
    })
    expect(fetchFn).toHaveBeenCalledOnce()
  })

  it('rejects outcomes outside the enum and non-JSON', () => {
    expect(parseOutcome('{"outcome":"sold_a_car","summary":"x"}')).toBeNull()
    expect(parseOutcome('The outcome is booked.')).toBeNull()
  })

  it('reads JSON a non-OpenAI model wrapped in fences or prose', () => {
    expect(parseOutcome('```json\n{"outcome":"booked","summary":"x"}\n```')).toMatchObject({ outcome: 'booked', summary: 'x' })
    expect(parseOutcome('Here you go: {"outcome":"spam","summary":"y"}')).toMatchObject({ outcome: 'spam', summary: 'y' })
  })

  it('sends to the configured endpoint and model', async () => {
    const fetchFn = fakeOpenAI('{"outcome":"booked","summary":"z"}')
    const custom = classifierConfig({
      CLASSIFIER_BASE_URL: 'http://vllm.internal:8000/v1/',
      CLASSIFIER_MODEL: 'acme/call-classifier',
      CLASSIFIER_API_KEY: 'local',
      OPENAI_API_KEY: 'sk-openai',
    })
    await classifyCall(transcript, custom, fetchFn)
    const [url, init] = (fetchFn as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('http://vllm.internal:8000/v1/chat/completions')
    expect(JSON.parse(init.body).model).toBe('acme/call-classifier')
    expect(init.headers.authorization).toBe('Bearer local')
  })

  it('falls back to OPENAI_API_KEY and is off with no key at all', () => {
    const base = { CLASSIFIER_BASE_URL: 'https://api.openai.com/v1', CLASSIFIER_MODEL: 'gpt-4o-mini' }
    expect(classifierConfig({ ...base, OPENAI_API_KEY: 'sk-openai' })?.apiKey).toBe('sk-openai')
    expect(classifierConfig(base)).toBeNull()
  })

  it('skips silently without an API key or transcript', async () => {
    const fetchFn = fakeOpenAI('unused')
    expect(await classifyCall(transcript, null, fetchFn)).toBeNull()
    expect(await classifyCall([], cfg, fetchFn)).toBeNull()
    expect(fetchFn).not.toHaveBeenCalled()
  })
})

describe('deriveOutcome — Phase 12 EL-vs-classifier precedence', () => {
  const booked = { outcome: 'booked' as const, summary: 'booked a visit' }
  const optOut = { outcome: 'opt_out' as const, summary: 'asked to be removed' }

  it('keeps the classifier label when there is no analysis', () => {
    expect(deriveOutcome(booked, null)).toEqual(booked)
    expect(deriveOutcome(booked, undefined)).toEqual(booked)
  })

  it('keeps the classifier label on an EL success (success has no 1:1 map)', () => {
    expect(deriveOutcome(booked, { success: true })).toEqual(booked)
  })

  it('overrides an optimistic classifier label to failed on an EL failure', () => {
    expect(deriveOutcome(booked, { success: false })).toEqual({ outcome: 'failed', summary: 'booked a visit' })
  })

  it('never lets an EL failure override opt_out (compliance is sacred)', () => {
    expect(deriveOutcome(optOut, { success: false })).toEqual(optOut)
  })

  it('sets failed from EL alone when there is no classifier', () => {
    expect(deriveOutcome(null, { success: false })).toEqual({ outcome: 'failed', summary: '' })
  })

  it('yields nothing when neither the classifier nor a decisive verdict exist', () => {
    expect(deriveOutcome(null, { success: true })).toBeNull()
    expect(deriveOutcome(null, null)).toBeNull()
  })
})
