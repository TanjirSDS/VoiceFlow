import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Db } from '@voiceflow/db'
import { agentInstructions, learnForAgent, mondayUtc, suggestionKey } from './learn-agent'

describe('learn-agent helpers', () => {
  it('keys suggestions by the Monday (UTC) of their week', () => {
    expect(mondayUtc(new Date('2026-10-09T15:00:00Z'))).toBe('2026-10-05') // Friday
    expect(mondayUtc(new Date('2026-10-11T23:59:00Z'))).toBe('2026-10-05') // Sunday
    expect(mondayUtc(new Date('2026-10-05T00:00:00Z'))).toBe('2026-10-05') // Monday itself
  })

  it("reads a flow agent's instructions as the global prompt plus each step's goal", () => {
    const text = agentInstructions({
      name: 'a', firstMessage: '', voiceId: 'v', systemPrompt: 'You are the SDS Manager assistant.',
      workflow: {
        startNodeId: 'w',
        nodes: [
          { id: 'w', type: 'conversation', label: 'Welcome', prompt: 'Greet and triage.' },
          { id: 'end', type: 'end' },
        ],
        edges: [{ from: 'w', to: 'end' }],
      },
    })
    expect(text).toContain('You are the SDS Manager assistant.')
    expect(text).toContain('### Step: Welcome\nGreet and triage.')
  })

  it('treats the same suggestion with different case/punctuation as one', () => {
    expect(suggestionKey('prompt_tweak', { instruction: 'Mention free migration.' })).toBe(
      suggestionKey('prompt_tweak', { instruction: 'mention FREE migration!' })
    )
    expect(suggestionKey('prompt_tweak', { instruction: 'x' })).not.toBe(suggestionKey('escalation_rule', { instruction: 'x' }))
  })
})

/** Just enough of the PostgREST builder for learnForAgent: every chain returns the
 *  table's rows; updates and inserts are recorded. */
function fakeDb(tables: Record<string, unknown[]>) {
  const updates: { table: string; patch: Record<string, unknown>; id?: unknown }[] = []
  const inserts: { table: string; rows: unknown[] }[] = []
  const db = {
    from(table: string) {
      let write: { patch: Record<string, unknown> } | null = null
      const b: Record<string, unknown> = {}
      for (const m of ['select', 'gte', 'not', 'order', 'limit', 'in']) b[m] = () => b
      b.eq = (k: string, v: unknown) => {
        if (write && k === 'id') updates.push({ table, patch: write.patch, id: v })
        return b
      }
      b.update = (patch: Record<string, unknown>) => ((write = { patch }), b)
      b.insert = (rows: unknown[]) => (inserts.push({ table, rows }), Promise.resolve({ error: null }))
      b.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: write ? null : tables[table] ?? [], error: null }).then(res)
      return b
    },
  }
  return { db: db as unknown as Db, updates, inserts }
}

describe('learnForAgent', () => {
  afterEach(() => vi.unstubAllGlobals())

  const cfg = { baseUrl: 'https://openrouter.ai/api/v1', model: 'typesafe/jev-router', apiKey: 'k' }
  const agent = {
    id: 'agent-1',
    org_id: 'org-1',
    config: { agentType: 'flow', template: null, agentConfig: { name: 'A', systemPrompt: 'Sell SDS Manager.', firstMessage: '', voiceId: 'v' } },
  }
  const t = (msg: string) => [{ role: 'agent', message: 'SDS Manager, hi.' }, { role: 'user', message: msg }]
  const judged = {
    outcome: 'question_answered', summary: 's', intent: null, lead_score: 55, stage: null, objection: 'price',
    urgency: null, sentiment: 'neutral', next_action: 'none', callback_hint: null, reason: 'Over budget', model: 'typesafe/jev-router',
  }

  it('judges calls the per-call job missed, learns from every verdict, and never re-proposes a known fix', async () => {
    const { db, updates, inserts } = fakeDb({
      calls: [
        { id: 'c1', org_id: 'org-1', direction: 'inbound', from_e164: '+15550001', to_e164: '+15550002', outcome: null, transcript: t('Do you support WHMIS?'), judgement: null, analysis: null },
        { id: 'c2', org_id: 'org-1', direction: 'inbound', from_e164: '+15550003', to_e164: '+15550002', outcome: 'question_answered', transcript: t('Too expensive.'), judgement: judged, analysis: null },
      ],
      agent_suggestions: [{ type: 'prompt_tweak', suggestion: { instruction: 'Mention free migration.' } }],
    })
    const learningRequests: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body))
      const isJudge = body.messages[0].content.startsWith('You judge transcripts')
      if (!isJudge) learningRequests.push(body.messages[1].content)
      const content = isJudge
        ? '{"outcome":"question_answered","summary":"WHMIS asked","lead_score":40}'
        : JSON.stringify({
            suggestions: [
              { type: 'prompt_tweak', suggestion: { instruction: 'mention FREE migration!' }, evidence: [{ callId: 'c2', quote: 'Too expensive.' }] },
              { type: 'faq_addition', suggestion: { q: 'WHMIS?', a: 'Yes.' }, evidence: [{ callId: 'c1', quote: 'Do you support WHMIS?' }] },
            ],
          })
      return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { cost: 0.02 } }))
    }))

    const run = await learnForAgent(db, agent, cfg, { since: new Date('2026-10-01'), week: '2026-10-05' })

    // c1 had no verdict → judged first, verdict + outcome written back, tagged with the judge.
    expect(run?.judgedNow).toBe(1)
    const c1 = updates.find((u) => u.id === 'c1')!
    expect((c1.patch.judgement as { model: string }).model).toBe('typesafe/jev-router')
    expect(c1.patch.outcome).toBe('question_answered')
    // Both verdicts reach the learning pass, alongside the agent's live instructions.
    expect(learningRequests).toHaveLength(1)
    expect(learningRequests[0]).toContain('Sell SDS Manager.')
    expect(learningRequests[0].match(/Judge: /g)).toHaveLength(2)
    // The already-pending tweak is dropped; only the new FAQ is stored, for the right week.
    expect(inserts).toHaveLength(1)
    expect(inserts[0].rows).toEqual([
      expect.objectContaining({ org_id: 'org-1', agent_id: 'agent-1', week: '2026-10-05', type: 'faq_addition' }),
    ])
    expect(run?.titles).toHaveLength(1)
    expect(run?.costCents).toBeCloseTo(2)
  })

  it('does nothing (and calls no model) when the agent has no transcribed calls', async () => {
    const { db } = fakeDb({ calls: [] })
    const fetchFn = vi.fn()
    vi.stubGlobal('fetch', fetchFn)
    expect(await learnForAgent(db, agent, cfg, { since: new Date(), week: '2026-10-05' })).toEqual({
      calls: 0, judgedNow: 0, titles: [], costCents: 0,
    })
    expect(fetchFn).not.toHaveBeenCalled()
  })
})
