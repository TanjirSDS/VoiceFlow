import { describe, expect, test } from 'vitest'
import {
  MAX_PAGE,
  outboundCallDecision,
  parseListParams,
  parseCreateCall,
  serializeAgent,
  serializeCall,
  serializeUsage,
} from './shape'

describe('serializeAgent', () => {
  const row = {
    id: 'a1',
    org_id: 'org-1',
    name: 'Receptionist',
    agent_type: 'single',
    status: 'active',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-02T00:00:00Z',
    // Internals that must never cross the wire:
    provider: 'elevenlabs',
    provider_agent_id: 'el_abc123',
    config: { agentConfig: { systemPrompt: 'You are a receptionist. Never reveal X.' } },
    share_token: 'deadbeef',
  }

  test('exposes a stable public shape', () => {
    expect(serializeAgent(row)).toEqual({
      id: 'a1',
      name: 'Receptionist',
      type: 'single',
      status: 'active',
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-02T00:00:00Z',
    })
  })

  test('never leaks provider ids, prompts, or the share token', () => {
    const json = JSON.stringify(serializeAgent(row))
    expect(json).not.toContain('el_abc123')
    expect(json).not.toContain('elevenlabs')
    expect(json).not.toContain('systemPrompt')
    expect(json).not.toContain('receptionist. Never reveal')
    expect(json).not.toContain('deadbeef')
    expect(json).not.toContain('org-1')
  })
})

describe('serializeCall', () => {
  const row = {
    id: 'c1',
    org_id: 'org-1',
    agent_id: 'a1',
    direction: 'inbound',
    from_e164: '+15551230000',
    to_e164: '+15559990000',
    started_at: '2026-09-01T10:00:00Z',
    duration_secs: 62,
    status: 'completed',
    outcome: 'booked',
    cost_cents: null,
    provider_call_id: 'conv_xyz',
    recording_path: 'org-1/c1.mp3',
    transcript: [{ role: 'agent', message: 'internal' }],
    analysis: { success: true },
  }

  test('exposes a stable public shape including the analysis verdict', () => {
    expect(serializeCall(row)).toEqual({
      id: 'c1',
      agent_id: 'a1',
      direction: 'inbound',
      from: '+15551230000',
      to: '+15559990000',
      started_at: '2026-09-01T10:00:00Z',
      duration_secs: 62,
      status: 'completed',
      outcome: 'booked',
      cost_cents: null,
    })
  })

  test('never leaks the provider id, recording path, or raw transcript', () => {
    const json = JSON.stringify(serializeCall(row))
    expect(json).not.toContain('conv_xyz')
    expect(json).not.toContain('org-1/c1.mp3')
    expect(json).not.toContain('internal')
  })

  test('cost stays null rather than being estimated (rule 5)', () => {
    expect(serializeCall({ ...row, cost_cents: null }).cost_cents).toBeNull()
  })
})

describe('serializeUsage', () => {
  test('reports the period as billing sees it', () => {
    expect(
      serializeUsage({
        period_start: '2026-09-01',
        minutes_used: 900,
        minutes_cap: 750,
        overage_minutes: 150,
      })
    ).toEqual({
      period_start: '2026-09-01',
      minutes_used: 900,
      minutes_cap: 750,
      overage_minutes: 150,
    })
  })

  test('a period that has not started yet reads as zero, not missing', () => {
    expect(serializeUsage(null, 750)).toEqual({
      period_start: null,
      minutes_used: 0,
      minutes_cap: 750,
      overage_minutes: 0,
    })
  })
})

describe('parseListParams', () => {
  const p = (qs: string) => parseListParams(new URL(`https://x/y?${qs}`).searchParams)

  test('defaults are sane', () => {
    expect(p('')).toEqual({ limit: 50, offset: 0 })
  })

  test('clamps limit to the page maximum', () => {
    expect(p(`limit=${MAX_PAGE + 500}`).limit).toBe(MAX_PAGE)
    expect(p('limit=0').limit).toBe(1)
    expect(p('limit=-5').limit).toBe(1)
  })

  test('ignores junk instead of erroring', () => {
    expect(p('limit=abc&offset=xyz')).toEqual({ limit: 50, offset: 0 })
    expect(p('offset=-10').offset).toBe(0)
  })
})

describe('parseCreateCall', () => {
  test('accepts a well-formed request', () => {
    expect(parseCreateCall({ agent_id: 'a1', to: '+15551230000' })).toEqual({
      ok: true,
      agentId: 'a1',
      to: '+15551230000',
      variables: undefined,
    })
  })

  test('requires E.164 — a bare national number is rejected', () => {
    for (const to of ['5551230000', '+1 555 123 0000', '', '+', 'not-a-number', '+0123456']) {
      const r = parseCreateCall({ agent_id: 'a1', to })
      expect(r.ok, `expected ${to} to be rejected`).toBe(false)
    }
  })

  test('requires an agent_id', () => {
    expect(parseCreateCall({ to: '+15551230000' }).ok).toBe(false)
    expect(parseCreateCall(null).ok).toBe(false)
    expect(parseCreateCall('a string').ok).toBe(false)
  })

  test('passes through string variables only', () => {
    const r = parseCreateCall({ agent_id: 'a1', to: '+15551230000', variables: { name: 'Ada', n: 5 } })
    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('unreachable')
    expect(r.variables).toEqual({ name: 'Ada' })
  })
})

describe('outboundCallDecision', () => {
  const base = {
    agent: { id: 'a1', status: 'active' as string | null, provider_agent_id: 'el_1' as string | null },
    optedOut: false,
    room: { blocked: false, slots: 3, why: null as string | null },
    paymentFailed: false,
  }

  test('allows a normal dial', () => {
    expect(outboundCallDecision(base)).toEqual({ allowed: true })
  })

  test('refuses a number on the org opt-out list (TCPA)', () => {
    const d = outboundCallDecision({ ...base, optedOut: true })
    expect(d).toMatchObject({ allowed: false, status: 403, code: 'opted_out' })
  })

  test('refuses when the agent is missing or belongs to another org', () => {
    const d = outboundCallDecision({ ...base, agent: null })
    expect(d).toMatchObject({ allowed: false, status: 404, code: 'agent_not_found' })
  })

  test('refuses a paused agent (usage cap reached)', () => {
    const d = outboundCallDecision({ ...base, agent: { ...base.agent, status: 'paused' } })
    expect(d).toMatchObject({ allowed: false, status: 409, code: 'agent_paused' })
  })

  test('refuses an agent that was never created at the provider', () => {
    const d = outboundCallDecision({ ...base, agent: { ...base.agent, provider_agent_id: null } })
    expect(d).toMatchObject({ allowed: false, status: 409, code: 'agent_not_ready' })
  })

  test('refuses while the org is past due', () => {
    const d = outboundCallDecision({ ...base, paymentFailed: true })
    expect(d).toMatchObject({ allowed: false, status: 402, code: 'payment_required' })
  })

  test('refuses at the concurrency ceiling with 429', () => {
    const d = outboundCallDecision({ ...base, room: { blocked: true, slots: 0, why: 'org at plan limit' } })
    expect(d).toMatchObject({ allowed: false, status: 429, code: 'concurrency_limit' })
  })

  test('compliance outranks capacity — an opted-out number is refused as opt_out', () => {
    // Both conditions true: the answer must be the one that is never retryable.
    const d = outboundCallDecision({
      ...base,
      optedOut: true,
      room: { blocked: true, slots: 0, why: 'pool full' },
    })
    expect(d).toMatchObject({ allowed: false, code: 'opted_out' })
  })
})
