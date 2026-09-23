// Phase 4 acceptance: org A cannot see org B's data — proven with two member
// clients against a real Postgres + PostgREST (RLS lives in Postgres; it cannot
// be unit tested). Skips when that env is absent; `npm run migrate:verify` runs
// it against a throwaway stack. Also exercises record_call_usage math live.

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createDb, type Db } from './client'

const URL = process.env.POSTGREST_URL
const SECRET = process.env.POSTGREST_JWT_SECRET
const DATABASE_URL = process.env.DATABASE_URL
const live = !!(URL && SECRET && DATABASE_URL)

describe.skipIf(!live)('RLS org isolation (live)', () => {
  const admin = live ? createDb(URL!, SECRET!, { role: 'service_role' }) : null!
  const sql = live ? new Pool({ connectionString: DATABASE_URL }) : null!
  const stamp = `rls-test-${Date.now()}`
  const users: string[] = []
  const orgs: string[] = []
  let clientA: Db
  let clientB: Db

  async function makeUserAndOrg(tag: 'a' | 'b') {
    const email = `${stamp}-${tag}@voiceflow.test`
    const {
      rows: [u],
    } = await sql.query<{ id: string }>('insert into auth.users (email, email_verified) values ($1, true) returning id', [
      email,
    ])
    users.push(u.id)

    const { data: org, error: oErr } = await admin
      .from('orgs')
      .insert({ name: `${stamp}-org-${tag}`, plan_id: 'starter', minutes_cap: 100 })
      .select('id')
      .single()
    if (oErr) throw new Error(oErr.message)
    orgs.push(org.id)

    await admin.from('org_members').insert({ org_id: org.id, user_id: u.id, role: 'owner' })
    const { data: agentRow } = await admin
      .from('agents')
      .insert({ org_id: org.id, name: `${stamp}-agent-${tag}`, provider: 'elevenlabs' })
      .select('id')
      .single()
    await admin.from('agent_test_cases').insert({
      org_id: org.id,
      agent_id: agentRow!.id,
      name: `${stamp}-tc-${tag}`,
      user_prompt: 'a scripted caller',
      success_criteria: 'the agent booked an appointment',
    })
    await admin.from('kb_documents').insert({
      org_id: org.id,
      provider_kb_id: `${stamp}-kb-${tag}`,
      name: `${stamp}-kb-${tag}`,
      source_type: 'text',
    })
    await admin.from('contacts').insert({
      org_id: org.id,
      e164: `+1555${tag === 'a' ? '0000001' : '0000002'}`,
      first_name: `${stamp}-${tag}`,
    })

    // Exactly the token lib/db.ts userClient() signs for a signed-in member.
    return createDb(URL!, SECRET!, { role: 'authenticated', sub: u.id })
  }

  beforeAll(async () => {
    clientA = await makeUserAndOrg('a')
    clientB = await makeUserAndOrg('b')
  }, 60_000)

  afterAll(async () => {
    if (!admin) return
    // agents.org_id deliberately doesn't cascade (0004), so clear them first;
    // everything else we inserted cascades from orgs. Loud, not silent — the
    // old version never checked and would have leaked orgs on every run.
    for (const table of ['agents', 'orgs'] as const) {
      const { error } = await admin.from(table).delete().in(table === 'orgs' ? 'id' : 'org_id', orgs)
      if (error) throw new Error(`cleanup ${table}: ${error.message}`)
    }
    await sql.query('delete from auth.users where id = any($1)', [users])
    await sql.end()
  }, 60_000)

  it('a request with no token is rejected, not answered', async () => {
    const { data, error } = await createDb(URL!, SECRET!, null).from('orgs').select('id')
    expect(data).toBeNull()
    expect(error).toBeTruthy()
  }, 30_000)

  it('a token signed with the wrong secret is rejected', async () => {
    const forged = createDb(URL!, 'x'.repeat(40), { role: 'service_role' })
    const { error } = await forged.from('orgs').select('id')
    expect(error).toBeTruthy()
  }, 30_000)

  it('each member sees only their own org rows', async () => {
    const { data: aAgents } = await clientA.from('agents').select('name, org_id')
    const { data: bAgents } = await clientB.from('agents').select('name, org_id')
    expect(aAgents!.every((r) => r.org_id === orgs[0])).toBe(true)
    expect(bAgents!.every((r) => r.org_id === orgs[1])).toBe(true)
    expect(aAgents!.some((r) => r.name === `${stamp}-agent-a`)).toBe(true)
    expect(aAgents!.some((r) => r.name === `${stamp}-agent-b`)).toBe(false)
    expect(bAgents!.some((r) => r.name === `${stamp}-agent-a`)).toBe(false)
  }, 30_000)

  it('kb_documents are org-isolated (read + write)', async () => {
    const { data: aDocs } = await clientA.from('kb_documents').select('name, org_id')
    const { data: bDocs } = await clientB.from('kb_documents').select('name, org_id')
    expect(aDocs!.every((r) => r.org_id === orgs[0])).toBe(true)
    expect(aDocs!.some((r) => r.name === `${stamp}-kb-a`)).toBe(true)
    expect(aDocs!.some((r) => r.name === `${stamp}-kb-b`)).toBe(false)
    expect(bDocs!.some((r) => r.name === `${stamp}-kb-a`)).toBe(false)

    // A member cannot register a doc into another org (with-check rejects).
    const { error } = await clientA.from('kb_documents').insert({
      org_id: orgs[1],
      provider_kb_id: `${stamp}-kb-intruder`,
      name: `${stamp}-kb-intruder`,
      source_type: 'text',
    })
    expect(error).toBeTruthy()
    const { data } = await admin
      .from('kb_documents')
      .select('id')
      .eq('provider_kb_id', `${stamp}-kb-intruder`)
    expect(data).toHaveLength(0)
  }, 30_000)

  it('contacts are org-isolated (read + write)', async () => {
    const { data: aC } = await clientA.from('contacts').select('first_name, org_id')
    const { data: bC } = await clientB.from('contacts').select('first_name, org_id')
    expect(aC!.every((r) => r.org_id === orgs[0])).toBe(true)
    expect(aC!.some((r) => r.first_name === `${stamp}-a`)).toBe(true)
    expect(aC!.some((r) => r.first_name === `${stamp}-b`)).toBe(false)
    expect(bC!.some((r) => r.first_name === `${stamp}-a`)).toBe(false)

    // A member cannot create a contact in another org (with-check rejects).
    const { error } = await clientA
      .from('contacts')
      .insert({ org_id: orgs[1], e164: `+1555${'9999999'}`, first_name: `${stamp}-intruder` })
    expect(error).toBeTruthy()
    const { data } = await admin.from('contacts').select('id').eq('first_name', `${stamp}-intruder`)
    expect(data).toHaveLength(0)
  }, 30_000)

  it('agent_test_cases are org-isolated (read + write)', async () => {
    const { data: aT } = await clientA.from('agent_test_cases').select('name, org_id, agent_id')
    const { data: bT } = await clientB.from('agent_test_cases').select('name, org_id')
    expect(aT!.every((r) => r.org_id === orgs[0])).toBe(true)
    expect(aT!.some((r) => r.name === `${stamp}-tc-a`)).toBe(true)
    expect(aT!.some((r) => r.name === `${stamp}-tc-b`)).toBe(false)
    expect(bT!.some((r) => r.name === `${stamp}-tc-a`)).toBe(false)

    // A member cannot write a test case into another org (with-check rejects).
    const { error } = await clientA.from('agent_test_cases').insert({
      org_id: orgs[1],
      agent_id: aT![0].agent_id,
      name: `${stamp}-tc-intruder`,
      user_prompt: 'x',
      success_criteria: '',
    })
    expect(error).toBeTruthy()
    const { data } = await admin.from('agent_test_cases').select('id').eq('name', `${stamp}-tc-intruder`)
    expect(data).toHaveLength(0)
  }, 30_000)

  it('cannot write into another org', async () => {
    const { error } = await clientA
      .from('agents')
      .insert({ org_id: orgs[1], name: `${stamp}-intruder`, provider: 'elevenlabs' })
    expect(error).toBeTruthy() // RLS with-check rejects
    const { data } = await admin.from('agents').select('id').eq('name', `${stamp}-intruder`)
    expect(data).toHaveLength(0)
  }, 30_000)

  it('members cannot call the usage functions', async () => {
    const { error } = await clientA.rpc('record_call_usage', { p_org_id: orgs[0], p_secs: 60 })
    expect(error).toBeTruthy() // execute revoked from authenticated
  }, 30_000)

  it('record_call_usage increments atomically and accumulates overage', async () => {
    // cap is 100 min; 90 min then 20 min → 110 used, 10 overage
    const r1 = await admin.rpc('record_call_usage', { p_org_id: orgs[0], p_secs: 90 * 60 })
    expect(r1.error).toBeNull()
    expect(Number(r1.data![0].prev_minutes)).toBe(0)
    expect(Number(r1.data![0].new_minutes)).toBe(90)

    const r2 = await admin.rpc('record_call_usage', { p_org_id: orgs[0], p_secs: 20 * 60 })
    expect(Number(r2.data![0].prev_minutes)).toBe(90)
    expect(Number(r2.data![0].new_minutes)).toBe(110)

    const { data: period } = await admin
      .from('usage_periods')
      .select('minutes_used, overage_minutes, minutes_cap')
      .eq('org_id', orgs[0])
      .single()
    expect(Number(period!.minutes_used)).toBe(110)
    expect(Number(period!.overage_minutes)).toBe(10)
    expect(period!.minutes_cap).toBe(100)

    // member can read their own usage, not the other org's
    const { data: mine } = await clientA.from('usage_periods').select('org_id')
    expect(mine!.every((r) => r.org_id === orgs[0])).toBe(true)
    const { data: theirs } = await clientB.from('usage_periods').select('org_id').eq('org_id', orgs[0])
    expect(theirs).toHaveLength(0)
  }, 30_000)

  // ---- Phase 24: API-key scoping. A key resolves to an ORG, not a user, so it
  // carries an org_id claim and NO sub. These prove the claim grants exactly one
  // org and nothing else — in particular that it can never reach admin powers.

  it('an API-key client (org_id claim) sees only its own org', async () => {
    const keyA = createDb(URL!, SECRET!, { role: 'authenticated', org_id: orgs[0] })
    const { data, error } = await keyA.from('agents').select('name, org_id')
    expect(error).toBeNull()
    expect(data!.length).toBeGreaterThan(0)
    expect(data!.every((r) => r.org_id === orgs[0])).toBe(true)
    expect(data!.some((r) => r.name === `${stamp}-agent-b`)).toBe(false)

    // ...and cannot reach across even when it names the other org explicitly.
    const { data: cross } = await keyA.from('agents').select('id').eq('org_id', orgs[1])
    expect(cross).toHaveLength(0)
  }, 30_000)

  it('an API-key client cannot write into another org', async () => {
    const keyA = createDb(URL!, SECRET!, { role: 'authenticated', org_id: orgs[0] })
    const { error } = await keyA
      .from('contacts')
      .insert({ org_id: orgs[1], e164: '+15550000911', first_name: `${stamp}-key-intruder` })
    expect(error).toBeTruthy()
    const { data } = await admin.from('contacts').select('id').eq('first_name', `${stamp}-key-intruder`)
    expect(data).toHaveLength(0)
  }, 30_000)

  it('an API key never inherits admin powers, even when its creator is an admin', async () => {
    // Make org A's owner a platform admin. A SESSION for that user now sees
    // every org (is_org_member ORs is_admin); the org A API KEY must not.
    await admin.from('admin_users').insert({ user_id: users[0] })
    try {
      const adminSession = createDb(URL!, SECRET!, { role: 'authenticated', sub: users[0] })
      const { data: asAdmin } = await adminSession.from('agents').select('id').eq('org_id', orgs[1])
      expect(asAdmin!.length).toBeGreaterThan(0) // the admin path still works

      const keyA = createDb(URL!, SECRET!, { role: 'authenticated', org_id: orgs[0] })
      const { data: asKey } = await keyA.from('agents').select('id').eq('org_id', orgs[1])
      expect(asKey).toHaveLength(0) // the key is still confined to org A

      // auth.uid() is null for a key, so it matches no admin row at all.
      const { data: adminRows } = await keyA.from('admin_users').select('user_id')
      expect(adminRows ?? []).toHaveLength(0)
    } finally {
      await admin.from('admin_users').delete().eq('user_id', users[0])
    }
  }, 30_000)

  it('api_keys rows are org-isolated and never expose the hash to a member', async () => {
    const { data: created, error: cErr } = await admin
      .from('api_keys')
      .insert({ org_id: orgs[0], key_hash: `${stamp}-hash-a`, prefix: 'vf_aaaaaa', created_by: 'a@voiceflow.test' })
      .select('id')
      .single()
    expect(cErr).toBeNull()

    // Member of org A sees it; member of org B does not.
    const { data: aKeys } = await clientA.from('api_keys').select('id, org_id')
    expect(aKeys!.some((r) => r.id === created!.id)).toBe(true)
    const { data: bKeys } = await clientB.from('api_keys').select('id').eq('id', created!.id)
    expect(bKeys).toHaveLength(0)

    // key_hash is revoked from authenticated: selecting it must error, so a
    // compromised session cannot read back a credential digest.
    const { error: hashErr } = await clientA.from('api_keys').select('key_hash').eq('id', created!.id)
    expect(hashErr).toBeTruthy()
  }, 30_000)
})

it('rls live test env', () => {
  if (!live) console.warn('RLS tests skipped — set POSTGREST_URL, POSTGREST_JWT_SECRET, DATABASE_URL (or run npm run migrate:verify)')
  expect(true).toBe(true)
})
