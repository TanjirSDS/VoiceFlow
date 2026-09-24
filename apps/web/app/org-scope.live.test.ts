// Cross-workspace regression for the id-keyed server actions.
//
// RLS is not the boundary for these: is_org_member() admits EVERY workspace the
// caller belongs to, while each action authorized (and role/plan-gated) only the
// ACTIVE one. So a user who owns workspace A and is a plain member of workspace B
// could, from A, release B's phone numbers, delete B's agents and KB docs, kill
// B's campaigns, or point a campaign in A at B's agent. Phase 24 fixed this shape
// for api_keys and flagged the webhook endpoints; this covers every action that
// had it.
//
// The real actions run against a real Postgres + PostgREST (`npm run
// migrate:verify`); only the request context (active org, session client) and
// the provider/Next.js edges are stubbed. Skips without the stack.
import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pool } from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDb, type Db } from '@voiceflow/db'

const URL = process.env.POSTGREST_URL
const SECRET = process.env.POSTGREST_JWT_SECRET
const DATABASE_URL = process.env.DATABASE_URL
const live = !!(URL && SECRET && DATABASE_URL)

// Request context the actions read — set per test run in beforeAll.
const ctx = vi.hoisted(() => ({
  client: null as unknown as Db,
  org: null as unknown as Record<string, unknown>,
  email: 'scope@voiceflow.test',
}))
// Every provider call an action makes. A foreign id must never reach one.
const engine = vi.hoisted(() => {
  const calls: string[] = []
  const rec =
    (name: string, ret: unknown = undefined) =>
    async () => {
      calls.push(name)
      return ret
    }
  return {
    calls,
    stub: {
      attachNumber: rec('attachNumber'),
      detachNumber: rec('detachNumber'),
      deleteNumber: rec('deleteNumber'),
      deleteAgent: rec('deleteAgent'),
      removeKnowledge: rec('removeKnowledge'),
      attachKnowledge: rec('attachKnowledge'),
      detachKnowledge: rec('detachKnowledge'),
    },
  }
})

vi.mock('next/cache', () => ({ revalidatePath: () => {} }))
vi.mock('next/navigation', () => ({
  redirect: () => {
    throw new Error('NEXT_REDIRECT')
  },
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
vi.mock('../lib/org', () => ({ activeOrg: async () => ctx.org, ACTIVE_ORG_COOKIE: 'active-org' }))
vi.mock('../lib/db', () => ({ userClient: async () => ctx.client }))
vi.mock('../lib/auth', () => ({ currentUser: async () => ({ email: ctx.email }) }))
vi.mock('../lib/engine', () => ({ makeEngine: () => engine.stub }))
vi.mock('../lib/events', () => ({ emit: async () => true }))
vi.mock('../lib/numbers', async (orig) => ({
  ...(await orig<object>()),
  releaseNumber: async () => {
    engine.calls.push('twilio.releaseNumber')
  },
}))
vi.mock('../lib/twilio-subaccounts', () => ({
  credsForNumber: async () => ({}),
  orgTwilioCreds: async () => ({}),
}))

import { setWebhookEndpointEnabledAction, deleteWebhookEndpointAction } from './integrations/actions'
import { updateAlertAction, setAlertEnabledAction, deleteAlertAction, type AlertInput } from './alerts/actions'
import { updateContactAction, getContactCallsAction } from './contacts/actions'
import { deleteKbDocAction, setKbAttachmentAction } from './knowledge/actions'
import {
  createCampaignAction,
  killCampaignAction,
  pauseCampaignAction,
  startCampaignAction,
} from './campaigns/actions'
import { assignNumberAction, releaseNumberAction } from './numbers/actions'
import {
  deleteAgentAction,
  deleteTestCaseAction,
  dismissSuggestionAction,
  renameVersionAction,
  saveTestCaseAction,
} from './agents/actions'

/** Run an action for its side effects only; the DB is the verdict. */
const attempt = (p: Promise<unknown>) => p.catch(() => undefined)

describe.skipIf(!live)('id-keyed actions are confined to the active org (live)', () => {
  const admin = live ? createDb(URL!, SECRET!, { role: 'service_role' }) : null!
  const sql = live ? new Pool({ connectionString: DATABASE_URL }) : null!
  const stamp = `orgscope-${Date.now()}`
  let userId: string
  // Per-org fixture ids.
  type Seed = {
    org: string
    agent: string
    endpoint: string
    alert: string
    contact: string
    kb: string
    campaign: string
    number: string
    testCase: string
    suggestion: string
  }
  let A: Seed // active — the caller is OWNER
  let B: Seed // foreign — the caller is a plain MEMBER

  const ins = async (table: string, row: Record<string, unknown>): Promise<string> => {
    const { data, error } = await admin.from(table).insert(row).select('id').single()
    if (error) throw new Error(`seed ${table}: ${error.message}`)
    return data.id as string
  }
  const one = async (table: string, id: string, cols: string) => {
    const { data, error } = await admin.from(table).select(cols).eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data as Record<string, unknown> | null
  }

  async function seed(tag: string, role: string): Promise<Seed> {
    const org = await ins('orgs', { name: `${stamp}-${tag}`, plan_id: 'pro', minutes_cap: 100 })
    const { error } = await admin.from('org_members').insert({ org_id: org, user_id: userId, role })
    if (error) throw new Error(error.message)
    const agent = await ins('agents', {
      org_id: org,
      name: `${stamp}-${tag}`,
      provider_agent_id: `${stamp}-${tag}-pa`,
      config: {},
    })
    await admin.from('agent_config_versions').insert({ agent_id: agent, version: 1, config: {} })
    return {
      org,
      agent,
      endpoint: await ins('webhook_endpoints', {
        org_id: org,
        url: 'https://example.test/hook',
        secret: `whsec_${tag}`,
        events: ['call.completed'],
      }),
      alert: await ins('alerts', {
        org_id: org,
        name: `${tag}-alert`,
        metric: 'call_count',
        operator: 'gt',
        threshold: 1,
        window_mins: 60,
        channels: { emails: ['a@b.test'], endpointIds: [] },
      }),
      contact: await ins('contacts', { org_id: org, e164: `+1555${tag === 'a' ? '1' : '2'}000001`, notes: 'original' }),
      kb: await ins('kb_documents', {
        org_id: org,
        provider_kb_id: `${stamp}-${tag}-kb`,
        name: `${tag}-doc`,
        source_type: 'text',
      }),
      campaign: await ins('campaigns', {
        org_id: org,
        agent_id: agent,
        name: `${tag}-camp`,
        status: 'running',
        spend_cap_cents: 100,
        consent_attested_at: new Date().toISOString(),
        created_by: userId,
      }),
      number: await ins('phone_numbers', {
        org_id: org,
        e164: `+1555${tag === 'a' ? '3' : '4'}${String(Date.now()).slice(-6)}`,
        provider_number_id: `${stamp}-${tag}-pn`,
        status: 'active',
      }),
      testCase: await ins('agent_test_cases', {
        org_id: org,
        agent_id: agent,
        name: `${tag}-case`,
        user_prompt: 'hi',
        success_criteria: '',
      }),
      suggestion: await ins('agent_suggestions', {
        org_id: org,
        agent_id: agent,
        week: '2026-09-21',
        type: 'faq_addition',
        suggestion: { q: 'q', a: 'a' },
        evidence: [],
        status: 'pending',
      }),
    }
  }

  beforeAll(async () => {
    const {
      rows: [u],
    } = await sql.query<{ id: string }>(
      'insert into auth.users (email, email_verified) values ($1, true) returning id',
      [`${stamp}@voiceflow.test`]
    )
    userId = u.id
    A = await seed('a', 'owner')
    B = await seed('b', 'member')
    ctx.client = createDb(URL!, SECRET!, { role: 'authenticated', sub: userId })
    ctx.org = {
      orgId: A.org,
      role: 'owner',
      name: `${stamp}-a`,
      minutesCap: 100,
      overagePolicy: 'pause',
      paymentFailedAt: null,
      pendingPlanId: null,
      parentOrgId: null,
      plan: {
        id: 'pro',
        name: 'Pro',
        maxAgents: 5,
        maxNumbers: 5,
        kbEnabled: true,
        adaptiveEnabled: true,
        qaEnabled: true,
        maxConcurrent: 5,
        apiEnabled: true,
        agencyEnabled: false,
        agencyRateCentsPerMin: 0,
        maxSubOrgs: 0,
      },
    }
  }, 60_000)

  beforeEach(() => {
    engine.calls.length = 0
  })

  afterAll(async () => {
    if (!admin) return
    const orgs = [A?.org, B?.org].filter(Boolean)
    // campaigns → agents is not ON DELETE CASCADE, and agents.org_id doesn't
    // cascade either, so children go first; every step checks its error.
    for (const [table, col] of [
      ['campaigns', 'org_id'],
      ['phone_numbers', 'org_id'],
      ['agents', 'org_id'],
      ['orgs', 'id'],
    ] as const) {
      const { error } = await admin.from(table).delete().in(col, orgs)
      if (error) throw new Error(`cleanup ${table}: ${error.message}`)
    }
    await sql.query('delete from auth.users where id = $1', [userId])
    await sql.end()
  }, 60_000)

  it('RLS alone lets this user write workspace B — why the org filter is required', async () => {
    const { data } = await ctx.client.from('alerts').select('id, org_id')
    const orgs = new Set((data ?? []).map((r) => r.org_id))
    expect(orgs.has(A.org)).toBe(true)
    expect(orgs.has(B.org)).toBe(true)
  }, 30_000)

  it('webhook endpoints: B cannot be toggled or deleted from A; A still can', async () => {
    expect((await setWebhookEndpointEnabledAction(B.endpoint, false)).error).toBeTruthy()
    expect((await deleteWebhookEndpointAction(B.endpoint)).error).toBeTruthy()
    expect(await one('webhook_endpoints', B.endpoint, 'enabled')).toEqual({ enabled: true })

    expect(await setWebhookEndpointEnabledAction(A.endpoint, false)).toEqual({})
    expect(await one('webhook_endpoints', A.endpoint, 'enabled')).toEqual({ enabled: false })
  }, 30_000)

  it('alerts: B cannot be edited, disabled or deleted from A; A still can', async () => {
    const input: AlertInput = {
      name: 'hijacked',
      metric: 'call_count',
      operator: 'gt',
      threshold: 999,
      windowMins: 60,
      agentId: null,
      channels: { emails: ['x@y.test'], endpointIds: [] },
      cooldownMins: 0,
    }
    expect((await updateAlertAction(B.alert, input)).error).toBeTruthy()
    expect((await setAlertEnabledAction(B.alert, false)).error).toBeTruthy()
    expect((await deleteAlertAction(B.alert)).error).toBeTruthy()
    expect(await one('alerts', B.alert, 'name, enabled')).toEqual({ name: 'b-alert', enabled: true })

    expect(await setAlertEnabledAction(A.alert, false)).toEqual({})
    expect(await one('alerts', A.alert, 'enabled')).toEqual({ enabled: false })
  }, 30_000)

  it('contacts: B cannot be edited, nor its calls listed, from A', async () => {
    expect((await updateContactAction(B.contact, { notes: 'hijacked' })).error).toBeTruthy()
    expect(await one('contacts', B.contact, 'notes')).toEqual({ notes: 'original' })
    expect(await getContactCallsAction(B.contact)).toEqual([])

    expect(await updateContactAction(A.contact, { notes: 'edited' })).toEqual({})
    expect(await one('contacts', A.contact, 'notes')).toEqual({ notes: 'edited' })
  }, 30_000)

  it('knowledge base: B docs cannot be deleted, nor cross-attached, from A', async () => {
    expect((await deleteKbDocAction(B.kb)).error).toBeTruthy()
    expect(await one('kb_documents', B.kb, 'id')).toEqual({ id: B.kb })
    // Either half foreign → refused before the provider is touched.
    expect((await setKbAttachmentAction(A.kb, B.agent, true)).error).toBeTruthy()
    expect((await setKbAttachmentAction(B.kb, A.agent, true)).error).toBeTruthy()
    expect(engine.calls).toEqual([])

    expect(await setKbAttachmentAction(A.kb, A.agent, true)).toEqual({})
    expect(engine.calls).toEqual(['attachKnowledge'])
  }, 30_000)

  it('campaigns: B cannot be paused, killed or restarted from A, nor dial through B’s agent', async () => {
    await attempt(pauseCampaignAction(B.campaign))
    await attempt(killCampaignAction(B.campaign))
    expect(await one('campaigns', B.campaign, 'status')).toEqual({ status: 'running' })
    await admin.from('campaigns').update({ status: 'paused' }).eq('id', B.campaign)
    await attempt(startCampaignAction(B.campaign))
    expect(await one('campaigns', B.campaign, 'status')).toEqual({ status: 'paused' })

    const res = await attempt(
      createCampaignAction({
        name: `${stamp}-cross`,
        agentId: B.agent,
        window: { startHour: 9, endHour: 17 } as never,
        spendCapCents: 100,
        consent: true,
        contacts: [{ phone: '+15550009999', vars: {} }],
      })
    )
    expect((res as { error?: string } | undefined)?.error).toBe('Agent not found')
    const { data: stray } = await admin.from('campaigns').select('id').eq('name', `${stamp}-cross`)
    expect(stray).toEqual([])

    await attempt(killCampaignAction(A.campaign))
    expect(await one('campaigns', A.campaign, 'status')).toEqual({ status: 'killed' })
  }, 30_000)

  it('numbers: an owner of A cannot release or reassign B’s numbers', async () => {
    expect((await releaseNumberAction(B.number)).error).toBeTruthy()
    expect(await one('phone_numbers', B.number, 'status')).toEqual({ status: 'active' })
    expect((await assignNumberAction(B.number, A.agent)).error).toBeTruthy()
    expect((await assignNumberAction(A.number, B.agent)).error).toBeTruthy()
    expect(await one('phone_numbers', B.number, 'agent_id')).toEqual({ agent_id: null })
    expect(await one('phone_numbers', A.number, 'agent_id')).toEqual({ agent_id: null })
    expect(engine.calls).toEqual([])

    expect(await assignNumberAction(A.number, A.agent)).toEqual({})
    expect(await one('phone_numbers', A.number, 'agent_id')).toEqual({ agent_id: A.agent })
  }, 30_000)

  it('agents: B’s agent, versions, suggestions and test cases are out of reach from A', async () => {
    await attempt(renameVersionAction(B.agent, 1, 'hijacked'))
    const { data: v } = await admin.from('agent_config_versions').select('label').eq('agent_id', B.agent).single()
    expect(v).toEqual({ label: null })

    await attempt(dismissSuggestionAction(B.agent, B.suggestion))
    expect(await one('agent_suggestions', B.suggestion, 'status')).toEqual({ status: 'pending' })

    // Would have written a row stamped org A pointing at org B's agent.
    await attempt(saveTestCaseAction(B.agent, { name: `${stamp}-x`, userPrompt: 'x', successCriteria: '' }))
    const { data: cross } = await admin.from('agent_test_cases').select('id').eq('name', `${stamp}-x`)
    expect(cross).toEqual([])
    await attempt(deleteTestCaseAction(B.agent, B.testCase))
    expect(await one('agent_test_cases', B.testCase, 'id')).toEqual({ id: B.testCase })

    await attempt(deleteAgentAction(B.agent))
    expect(await one('agents', B.agent, 'id')).toEqual({ id: B.agent })
    expect(engine.calls).toEqual([])

    await attempt(dismissSuggestionAction(A.agent, A.suggestion))
    expect(await one('agent_suggestions', A.suggestion, 'status')).toEqual({ status: 'dismissed' })
  }, 30_000)
})
