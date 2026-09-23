import { describe, expect, test, vi } from 'vitest'
import { makeCreateCall } from './handlers'
import type { ApiContext } from './wrapper'

// A minimal chainable stand-in for the PostgREST builder: enough to answer the
// three reads the handler makes, keyed by table. RLS is proven live in
// rls.test.ts — what matters here is the ORDER of the guards and, above all,
// that a refusal never reaches the provider.
function fakeDb(rows: Record<string, unknown>) {
  return {
    from(table: string) {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({ data: rows[table] ?? null, error: null }),
      }
      return chain
    },
  } as never
}

function ctx(body: unknown, rows: Record<string, unknown>): ApiContext {
  return {
    orgId: 'org-1',
    keyId: 'key-1',
    db: fakeDb(rows),
    req: new Request('https://api.voiceflow.test/api/v1/calls', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
    params: {},
  }
}

const ACTIVE_AGENT = { agents: { id: 'a1', status: 'active', provider_agent_id: 'el_1' } }
const OPEN = { blocked: false, slots: 3, why: null }

function deps(over: Partial<Parameters<typeof makeCreateCall>[0]> = {}) {
  const startOutboundCall = vi.fn(async () => ({ providerCallId: 'conv_new' }))
  return {
    startOutboundCall,
    deps: {
      engine: () => ({ startOutboundCall }) as never,
      room: async () => OPEN,
      ...over,
    },
  }
}

describe('POST /api/v1/calls', () => {
  test('dials and answers 202 with the provider call id', async () => {
    const { deps: d, startOutboundCall } = deps()
    const res = await makeCreateCall(d)(ctx({ agent_id: 'a1', to: '+15551230000' }, ACTIVE_AGENT))

    expect(res.status).toBe(202)
    await expect(res.json()).resolves.toMatchObject({
      status: 'queued',
      to: '+15551230000',
      provider_call_id: 'conv_new',
    })
    expect(startOutboundCall).toHaveBeenCalledWith('el_1', '+15551230000', undefined)
  })

  test('passes dynamic variables through to the agent', async () => {
    const { deps: d, startOutboundCall } = deps()
    await makeCreateCall(d)(
      ctx({ agent_id: 'a1', to: '+15551230000', variables: { first_name: 'Ada' } }, ACTIVE_AGENT)
    )
    expect(startOutboundCall).toHaveBeenCalledWith('el_1', '+15551230000', { first_name: 'Ada' })
  })

  test('NEVER dials a number on the opt-out list', async () => {
    const { deps: d, startOutboundCall } = deps()
    const res = await makeCreateCall(d)(
      ctx({ agent_id: 'a1', to: '+15551230000' }, { ...ACTIVE_AGENT, opt_outs: { e164: '+15551230000' } })
    )
    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toMatchObject({ error: { code: 'opted_out' } })
    expect(startOutboundCall).not.toHaveBeenCalled()
  })

  test('never dials for an agent outside the key’s org', async () => {
    // RLS returns no row for another org's agent, so the read comes back null.
    const { deps: d, startOutboundCall } = deps()
    const res = await makeCreateCall(d)(ctx({ agent_id: 'someone-elses', to: '+15551230000' }, {}))
    expect(res.status).toBe(404)
    expect(startOutboundCall).not.toHaveBeenCalled()
  })

  test('never dials at the concurrency ceiling', async () => {
    const { deps: d, startOutboundCall } = deps({
      room: async () => ({ blocked: true, slots: 0, why: 'org at plan limit' }),
    })
    const res = await makeCreateCall(d)(ctx({ agent_id: 'a1', to: '+15551230000' }, ACTIVE_AGENT))
    expect(res.status).toBe(429)
    expect(startOutboundCall).not.toHaveBeenCalled()
  })

  test('never dials while the org is past due', async () => {
    const { deps: d, startOutboundCall } = deps()
    const res = await makeCreateCall(d)(
      ctx({ agent_id: 'a1', to: '+15551230000' }, { ...ACTIVE_AGENT, orgs: { payment_failed_at: '2026-09-01' } })
    )
    expect(res.status).toBe(402)
    expect(startOutboundCall).not.toHaveBeenCalled()
  })

  test('rejects a bad number before doing any work', async () => {
    const { deps: d, startOutboundCall } = deps()
    const res = await makeCreateCall(d)(ctx({ agent_id: 'a1', to: '5551230000' }, ACTIVE_AGENT))
    expect(res.status).toBe(400)
    expect(startOutboundCall).not.toHaveBeenCalled()
  })

  test('rejects a non-JSON body without a 500', async () => {
    const { deps: d, startOutboundCall } = deps()
    const res = await makeCreateCall(d)(ctx('not json at all', ACTIVE_AGENT))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: { code: 'invalid_body' } })
    expect(startOutboundCall).not.toHaveBeenCalled()
  })
})
