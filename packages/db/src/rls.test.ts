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
    const { error: agentErr } = await admin.from('agents').delete().in('org_id', orgs)
    if (agentErr) throw new Error(`cleanup agents: ${agentErr.message}`)

    // Phase 27: orgs.parent_org_id is ON DELETE RESTRICT (a parent with live
    // sub-orgs holds other people's phone numbers), so CHILDREN MUST GO FIRST.
    // Deleting the set in one statement leaves the order to Postgres and fails
    // the moment it happens to reach a parent before its child.
    const { error: childErr } = await admin.from('orgs').delete().in('parent_org_id', orgs)
    if (childErr) throw new Error(`cleanup sub-orgs: ${childErr.message}`)
    const { error: orgErr } = await admin.from('orgs').delete().in('id', orgs)
    if (orgErr) throw new Error(`cleanup orgs: ${orgErr.message}`)
    await sql.query('delete from auth.users where id = any($1)', [users])
    await sql.end()
  }, 60_000)

  /**
   * ── Phase 27: the parent/child boundary ──────────────────────────────────
   *
   * is_org_member() gained an arm this phase (is_parent_reseller), and every one
   * of the ~24 policies that call it inherited the new reach at once. That is a
   * lot of blast radius for one function, so what it must and must NOT reach is
   * proven here against a real database rather than argued in a comment.
   *
   * The shape being asserted: a reseller reaches DOWN into the orgs it created,
   * never sideways into another agency's, never UP into its own parent, and
   * never through a bearer key.
   */
  describe('agency parent/child boundary', () => {
    let agencyUser: string
    let agencyOrg: string
    let childOrg: string
    let rivalAgencyUser: string
    let rivalAgencyOrg: string
    let rivalChildOrg: string
    let childOwnerUser: string
    let resellerClient: Db
    let rivalClient: Db
    let childClient: Db

    beforeAll(async () => {
      // One agency with a client, and a RIVAL agency with its own client. The
      // rival is the case a single-tenant test would miss entirely: both
      // resellers hold a valid reseller role, so the question is not "does the
      // role work" but "is it scoped to the right family".
      const mk = async (tag: string) => {
        const { rows: [u] } = await sql.query<{ id: string }>(
          'insert into auth.users (email, email_verified) values ($1, true) returning id',
          [`${stamp}-${tag}@voiceflow.test`]
        )
        users.push(u.id)
        return u.id
      }
      const mkOrg = async (tag: string, parent: string | null) => {
        const { data, error } = await admin
          .from('orgs')
          .insert({
            name: `${stamp}-${tag}`,
            plan_id: parent ? 'starter' : 'agency',
            minutes_cap: 1000,
            parent_org_id: parent,
          })
          .select('id')
          .single()
        if (error) throw new Error(`${tag}: ${error.message}`)
        orgs.push(data.id)
        return data.id
      }

      agencyUser = await mk('agency-a')
      agencyOrg = await mkOrg('agency-a', null)
      await admin.from('org_members').insert({ org_id: agencyOrg, user_id: agencyUser, role: 'reseller' })
      childOrg = await mkOrg('client-a', agencyOrg)

      rivalAgencyUser = await mk('agency-b')
      rivalAgencyOrg = await mkOrg('agency-b', null)
      await admin.from('org_members').insert({ org_id: rivalAgencyOrg, user_id: rivalAgencyUser, role: 'reseller' })
      rivalChildOrg = await mkOrg('client-b', rivalAgencyOrg)

      // A person who works AT the client, with no relationship to the agency.
      childOwnerUser = await mk('client-a-owner')
      await admin.from('org_members').insert({ org_id: childOrg, user_id: childOwnerUser, role: 'owner' })

      await admin.from('agents').insert([
        { org_id: childOrg, name: `${stamp}-agent-client-a`, provider: 'elevenlabs' },
        { org_id: rivalChildOrg, name: `${stamp}-agent-client-b`, provider: 'elevenlabs' },
        { org_id: agencyOrg, name: `${stamp}-agent-agency-a`, provider: 'elevenlabs' },
      ])

      resellerClient = createDb(URL!, SECRET!, { role: 'authenticated', sub: agencyUser })
      rivalClient = createDb(URL!, SECRET!, { role: 'authenticated', sub: rivalAgencyUser })
      childClient = createDb(URL!, SECRET!, { role: 'authenticated', sub: childOwnerUser })
    }, 60_000)

    it('a reseller reaches DOWN into its own client', async () => {
      const { data } = await resellerClient.from('agents').select('name, org_id')
      expect(data!.some((r) => r.org_id === childOrg)).toBe(true)
      expect(data!.some((r) => r.name === `${stamp}-agent-client-a`)).toBe(true)
    }, 30_000)

    // THE CASE THAT MATTERS MOST. Both users are legitimate resellers, so a
    // policy that checks "is this caller a reseller anywhere" instead of "of
    // THIS org's parent" passes every other test here and fails this one.
    it('a reseller cannot reach SIDEWAYS into another agency\'s client', async () => {
      const { data } = await resellerClient.from('agents').select('name, org_id')
      expect(data!.some((r) => r.org_id === rivalChildOrg)).toBe(false)
      expect(data!.some((r) => r.name === `${stamp}-agent-client-b`)).toBe(false)

      const { data: rival } = await rivalClient.from('agents').select('org_id')
      expect(rival!.some((r) => r.org_id === childOrg)).toBe(false)
    }, 30_000)

    it('a client cannot reach UP into the agency that resells to it', async () => {
      const { data } = await childClient.from('agents').select('name, org_id')
      expect(data!.every((r) => r.org_id === childOrg)).toBe(true)
      expect(data!.some((r) => r.name === `${stamp}-agent-agency-a`)).toBe(false)
      // ...nor sideways into a sibling, which is the same hop in reverse.
      expect(data!.some((r) => r.org_id === rivalChildOrg)).toBe(false)

      const { data: parentRow } = await childClient.from('orgs').select('id').eq('id', agencyOrg)
      expect(parentRow).toHaveLength(0)
    }, 30_000)

    it("a client cannot edit the branding its reseller set", async () => {
      await admin.from('org_branding').insert({ org_id: childOrg, product_name: 'Agency A Voice' })
      // branding_update requires is_org_owner AND not-a-sub-org, or
      // is_parent_reseller. A sub-org's own owner satisfies neither, which is
      // what stops a white-labelled client renaming the product out from under
      // the agency reselling to them.
      const { error } = await childClient
        .from('org_branding')
        .update({ product_name: 'Renamed By Client' })
        .eq('org_id', childOrg)
      const { data: after } = await admin
        .from('org_branding')
        .select('product_name')
        .eq('org_id', childOrg)
        .single()
      // NOTE the assertion that matters is the VALUE, not `error`. A policy
      // that matches no rows makes this a zero-row update, which PostgREST
      // reports as success — so "no error" here would prove nothing at all.
      expect(after!.product_name).toBe('Agency A Voice')
      expect(error?.message ?? 'blocked by policy (zero rows)').toBeTruthy()

      // The reseller above it can.
      const { error: rErr } = await resellerClient
        .from('org_branding')
        .update({ product_name: 'Agency A Voice v2' })
        .eq('org_id', childOrg)
      expect(rErr).toBeNull()
      const { data: after2 } = await admin
        .from('org_branding')
        .select('product_name')
        .eq('org_id', childOrg)
        .single()
      expect(after2!.product_name).toBe('Agency A Voice v2')
    }, 30_000)

    it('nobody can mark their own sending domain verified', async () => {
      // The column grant is revoked, so this is refused by privilege, not policy
      // — a reseller who could set it would send mail as any domain they chose.
      const { error } = await resellerClient
        .from('org_branding')
        .update({ email_sender_verified: true })
        .eq('org_id', childOrg)
      expect(error).toBeTruthy()
      const { data } = await admin
        .from('org_branding')
        .select('email_sender_verified')
        .eq('org_id', childOrg)
        .single()
      expect(data!.email_sender_verified).toBe(false)
    }, 30_000)

    it('an API key cannot borrow the reseller reach of the person who made it', async () => {
      // auth.uid() is NULL for a key token, so the org_members join inside
      // is_parent_reseller matches nothing. The reseller's SESSION sees the
      // client; their KEY, scoped to the agency org, does not.
      const keyDb = createDb(URL!, SECRET!, { role: 'authenticated', org_id: agencyOrg })
      const { data } = await keyDb.from('agents').select('org_id')
      expect(data!.length).toBeGreaterThan(0)
      expect(data!.every((r) => r.org_id === agencyOrg)).toBe(true)
      expect(data!.some((r) => r.org_id === childOrg)).toBe(false)
    }, 30_000)

    // Finding F2 of the phase's security review. Branding resolves by HOST
    // before it resolves by session, so a tenant who could verify their own
    // claim would point a vanity host at our own domain and repaint the real
    // product for every visitor. The column is withheld by grant, not policy.
    it('a reseller cannot verify its own vanity host', async () => {
      await admin
        .from('org_branding')
        .upsert({ org_id: childOrg, custom_domain: `${stamp}-claimed.test` }, { onConflict: 'org_id' })
      const { error } = await resellerClient
        .from('org_branding')
        .update({ custom_domain_verified_at: new Date().toISOString() })
        .eq('org_id', childOrg)
      expect(error).toBeTruthy()
      const { data } = await admin
        .from('org_branding')
        .select('custom_domain_verified_at')
        .eq('org_id', childOrg)
        .single()
      expect(data!.custom_domain_verified_at).toBeNull()
    }, 30_000)

    // Finding F1. The value reaches a mail header; length was never the limit.
    it('the database refuses a product name carrying a CRLF', async () => {
      const { error } = await admin
        .from('org_branding')
        .upsert({ org_id: childOrg, product_name: 'Acme\r\nBcc: attacker@evil' }, { onConflict: 'org_id' })
      expect(error).toBeTruthy()
    }, 30_000)

    /**
     * THE TIER'S CORE PROMISE, as an assertion.
     *
     * "A sub-org sees zero VoiceFlow branding anywhere." Resolution is own row →
     * PARENT's row → platform, and a sub-org's member is NOT a member of the
     * parent — so without the branding_read_parent policy the parent's row is
     * invisible to them and every unbranded client falls back to "VoiceFlow".
     *
     * Found by the phase's security review, not by the build and not by the
     * signed-out custom-domain check (that path runs as service_role, which
     * bypasses RLS and therefore could never have shown this).
     */
    it('a client can READ the branding it inherits from its agency', async () => {
      await admin
        .from('org_branding')
        .upsert({ org_id: agencyOrg, product_name: 'Northwind Voice' }, { onConflict: 'org_id' })

      const { data } = await childClient
        .from('org_branding')
        .select('org_id, product_name')
        .eq('org_id', agencyOrg)
      expect(data).toHaveLength(1)
      expect(data![0].product_name).toBe('Northwind Voice')
    }, 30_000)

    it('...but reading the parent BRANDING grants nothing else about the parent', async () => {
      // The inverted-downward policy is deliberately narrow: the client sees the
      // name and colour it is already shown on every screen, and nothing more.
      const { data: parentOrg } = await childClient.from('orgs').select('id').eq('id', agencyOrg)
      expect(parentOrg).toHaveLength(0)
      const { data: parentAgents } = await childClient.from('agents').select('id').eq('org_id', agencyOrg)
      expect(parentAgents).toHaveLength(0)
    }, 30_000)

    it('a stranger still cannot read an agency\'s branding', async () => {
      // clientA and clientB from the outer suite are unrelated orgs.
      const { data } = await clientB.from('org_branding').select('org_id').eq('org_id', agencyOrg)
      expect(data).toHaveLength(0)
    }, 30_000)

    /**
     * Finding F3. The stamp is per-ROW; the claim it certifies is per-HOSTNAME.
     * Nothing re-armed it when the hostname changed, so a tenant whose first
     * host was verified could repoint the column at any other host — including
     * a rival's — and keep the verification.
     */
    it('changing the vanity host clears its verification', async () => {
      // TWO statements, and it has to be two: the trigger clears the stamp on
      // any write that changes the hostname, so setting both at once would
      // (correctly) verify nothing. That is also the real operational order —
      // a host is claimed first, then verified once its DNS checks out.
      await admin
        .from('org_branding')
        .upsert({ org_id: childOrg, custom_domain: `${stamp}-first.test` }, { onConflict: 'org_id' })
      await admin
        .from('org_branding')
        .update({ custom_domain_verified_at: new Date().toISOString() })
        .eq('org_id', childOrg)
      const { data: before } = await admin
        .from('org_branding')
        .select('custom_domain_verified_at')
        .eq('org_id', childOrg)
        .single()
      expect(before!.custom_domain_verified_at).not.toBeNull()

      // The reseller repoints the host — the one write they are allowed.
      const { error } = await resellerClient
        .from('org_branding')
        .update({ custom_domain: `${stamp}-second.test` })
        .eq('org_id', childOrg)
      expect(error).toBeNull()

      const { data: after } = await admin
        .from('org_branding')
        .select('custom_domain, custom_domain_verified_at')
        .eq('org_id', childOrg)
        .single()
      expect(after!.custom_domain).toBe(`${stamp}-second.test`)
      expect(after!.custom_domain_verified_at).toBeNull()
    }, 30_000)

    it('an unrelated edit does NOT clear a verification', async () => {
      // The trigger must re-arm on a hostname change and stay out of the way
      // otherwise — clearing on every save would make verification unusable.
      await admin
        .from('org_branding')
        .update({ custom_domain_verified_at: new Date().toISOString() })
        .eq('org_id', childOrg)
      await resellerClient.from('org_branding').update({ product_name: 'Renamed' }).eq('org_id', childOrg)
      const { data } = await admin
        .from('org_branding')
        .select('custom_domain_verified_at')
        .eq('org_id', childOrg)
        .single()
      expect(data!.custom_domain_verified_at).not.toBeNull()
    }, 30_000)

    it('a reseller cannot write the rollup it is billed from', async () => {
      const { error } = await resellerClient
        .from('agency_periods')
        .insert({ parent_org_id: agencyOrg, period_start: '2026-01-01', pooled_minutes: 999999 })
      expect(error).toBeTruthy()
    }, 30_000)

    it('tenancy stays exactly one level deep', async () => {
      // A grandchild would make every rule in this phase silently wrong rather
      // than loudly broken, so the database refuses all three ways to build one.
      const grand = await admin
        .from('orgs')
        .insert({ name: `${stamp}-grandchild`, minutes_cap: 10, parent_org_id: childOrg })
        .select('id')
      expect(grand.error).toBeTruthy()

      // ...and an existing parent cannot be demoted into a child.
      const demote = await admin.from('orgs').update({ parent_org_id: rivalAgencyOrg }).eq('id', agencyOrg)
      expect(demote.error).toBeTruthy()

      // ...nor can an org be its own parent.
      const selfRef = await admin.from('orgs').update({ parent_org_id: childOrg }).eq('id', childOrg)
      expect(selfRef.error).toBeTruthy()
    }, 30_000)

    it('losing the agency plan narrows the reseller\'s reach', async () => {
      // is_parent_reseller() reads the parent's plan flag, so entitlement and
      // reach cannot disagree. Asserted by flipping the plan and re-reading:
      // the sub-org's rows disappear, and come back when it is restored.
      await admin.from('orgs').update({ plan_id: 'pro' }).eq('id', agencyOrg)
      const { data: lapsed } = await resellerClient.from('agents').select('org_id')
      expect(lapsed!.some((r) => r.org_id === childOrg)).toBe(false)

      await admin.from('orgs').update({ plan_id: 'agency' }).eq('id', agencyOrg)
      const { data: restored } = await resellerClient.from('agents').select('org_id')
      expect(restored!.some((r) => r.org_id === childOrg)).toBe(true)
    }, 30_000)
  })

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

  it('a member can create and revoke a key through RLS (the settings UI path)', async () => {
    // The column grants in 0020 could easily block the very flow they protect:
    // a filtered UPDATE needs SELECT on the columns it filters on, and INSERT
    // must survive the table-level SELECT revoke. Proven here, not assumed.
    const { error: insErr } = await clientA.from('api_keys').insert({
      org_id: orgs[0],
      name: `${stamp}-ui`,
      key_hash: `${stamp}-hash-ui`,
      prefix: 'vf_uiuiui',
      created_by: 'a@voiceflow.test',
    })
    expect(insErr).toBeNull()

    const { data: mine } = await clientA.from('api_keys').select('id, revoked_at').eq('name', `${stamp}-ui`)
    expect(mine).toHaveLength(1)
    const id = mine![0].id

    const { error: revErr } = await clientA
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
      .is('revoked_at', null)
    expect(revErr).toBeNull()
    const { data: after } = await clientA.from('api_keys').select('revoked_at').eq('id', id).single()
    expect(after!.revoked_at).toBeTruthy()

    // ...but a member may not rewrite the hash, nor delete the row.
    const { error: rewriteErr } = await clientA
      .from('api_keys')
      .update({ key_hash: `${stamp}-hash-rewritten` })
      .eq('id', id)
    expect(rewriteErr).toBeTruthy()
    const { error: delErr } = await clientA.from('api_keys').delete().eq('id', id)
    expect(delErr).toBeTruthy()

    // ...and cannot mint one into another org (with-check rejects).
    const { error: crossErr } = await clientA.from('api_keys').insert({
      org_id: orgs[1],
      name: `${stamp}-ui-intruder`,
      key_hash: `${stamp}-hash-intruder`,
      prefix: 'vf_bad000',
    })
    expect(crossErr).toBeTruthy()
    const { data: leaked } = await admin.from('api_keys').select('id').eq('name', `${stamp}-ui-intruder`)
    expect(leaked).toHaveLength(0)
  }, 30_000)
})

it('rls live test env', () => {
  if (!live) console.warn('RLS tests skipped — set POSTGREST_URL, POSTGREST_JWT_SECRET, DATABASE_URL (or run npm run migrate:verify)')
  expect(true).toBe(true)
})
