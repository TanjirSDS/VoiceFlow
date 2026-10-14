// A builder Save sends its own call settings, which don't include the filler phrases the
// agent learned from its calls. Replacing `call` wholesale wiped them on every Save.
import { describe, expect, it, vi } from 'vitest'

const sent: { cfg?: any } = {}
const row = {
  id: 'a1',
  provider: 'elevenlabs',
  provider_agent_id: 'agent_x',
  config: {
    agentType: 'single',
    template: null,
    agentConfig: { name: 'A', systemPrompt: 'p', firstMessage: '', voiceId: 'v', call: { fillers: true, fillerPhrases: ['Oh, gotcha.'] } },
  },
}
// Any PostgREST chain resolves to the agent row; the version read finds no number → version 1.
const chain: any = new Proxy(() => {}, {
  get: (_t, k) =>
    k === 'then'
      ? (resolve: (v: unknown) => void) => resolve({ data: row, error: null })
      : k === 'maybeSingle' || k === 'single'
        ? async () => ({ data: row, error: null })
        : () => chain,
})

vi.mock('next/cache', () => ({ revalidatePath: () => {} }))
vi.mock('next/navigation', () => ({ redirect: () => {}, notFound: () => {} }))
vi.mock('../../lib/org', () => ({ activeOrg: async () => ({ orgId: 'o1', role: 'owner', plan: {} }) }))
vi.mock('../../lib/db', () => ({ userClient: async () => ({ from: () => chain }) }))
vi.mock('../../lib/auth', () => ({ currentUser: async () => ({ email: 'o@x.co' }) }))
vi.mock('../../lib/engine', () => ({
  makeEngine: () => ({ updateAgent: async (_id: string, cfg: unknown) => void (sent.cfg = cfg) }),
}))

import { updateAgentAction } from './actions'

describe('updateAgentAction call settings', () => {
  it('keeps the learned filler phrases when the builder saves its call settings', async () => {
    const res = await updateAgentAction('a1', {
      name: 'A',
      systemPrompt: 'p2',
      firstMessage: '',
      voiceId: 'v',
      call: { maxDurationSecs: 600, endOnSilenceSecs: -1, patience: 'normal', fillers: true },
    })
    expect(res).toEqual({ version: 1 })
    expect(sent.cfg.call).toEqual({
      maxDurationSecs: 600,
      endOnSilenceSecs: -1,
      patience: 'normal',
      fillers: true,
      fillerPhrases: ['Oh, gotcha.'],
    })
  })
})
