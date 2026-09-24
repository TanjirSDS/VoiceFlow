import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createDb, type Db } from '@voiceflow/db'
import { countSubOrgs, getSubOrg, listSubOrgs, parentUsage, currentPeriodStart } from './agency-db'

/**
 * Live tests for the agency console's data layer, through real PostgREST.
 *
 * TWO reasons this exists rather than a mock.
 *
 * 1. The /agency list is one query with THREE embeds (plans, usage_periods,
 *    org_branding). An embed PostgREST cannot resolve is a runtime error, not a
 *    type error — nothing in the unit suite or `next build` would catch a
 *    mistyped relationship on the feature's main screen.
 *
 * 2. THE BOUNDARY IS THE `parent_org_id` FILTER, NOT RLS. This is the Phase 24
 *    lesson: is_org_member() answers "is this user a member of that org?", which
 *    now ALSO returns true for every org they resell — so an unscoped query in
 *    an agency screen would return another agency's clients to someone who
 *    works at both. These cases fail if the filters are removed, which is what
 *    makes them a regression test rather than a smoke test.
 *
 * Runs under `npm run migrate:verify`; skips without a live stack.
 */

const URL_ = process.env.POSTGREST_URL
const SECRET = process.env.POSTGREST_JWT_SECRET
const DATABASE_URL = process.env.DATABASE_URL
const live = !!(URL_ && SECRET && DATABASE_URL)

describe.skipIf(!live)('agency-db (live)', () => {
  const admin = live ? createDb(URL_!, SECRET!, { role: 'service_role' }) : null!
  const sql = live ? new Pool({ connectionString: DATABASE_URL }) : null!
  const stamp = `agency-db-${Date.now()}`
  const orgs: string[] = []
  const users: string[] = []
  let agencyA = ''
  let agencyB = ''
  let clientA1 = ''
  let clientA2 = ''
  let clientB1 = ''
  let dual: Db // a user who works at BOTH agencies — the interesting caller

  const mkOrg = async (name: string, parent: string | null, plan: string) => {
    const { data, error } = await admin
      .from('orgs')
      .insert({ name, plan_id: plan, minutes_cap: 1000, parent_org_id: parent })
      .select('id')
      .single()
    if (error) throw new Error(`${name}: ${error.message}`)
    orgs.push(data.id)
    return data.id as string
  }

  beforeAll(async () => {
    agencyA = await mkOrg(`${stamp}-agencyA`, null, 'agency')
    agencyB = await mkOrg(`${stamp}-agencyB`, null, 'agency')
    clientA1 = await mkOrg(`${stamp}-clientA1`, agencyA, 'starter')
    clientA2 = await mkOrg(`${stamp}-clientA2`, agencyA, 'starter')
    clientB1 = await mkOrg(`${stamp}-clientB1`, agencyB, 'starter')

    const {
      rows: [u],
    } = await sql.query<{ id: string }>(
      'insert into auth.users (email, email_verified) values ($1, true) returning id',
      [`${stamp}-dual@voiceflow.test`]
    )
    users.push(u.id)
    // Reseller at BOTH agencies. Every query below is legitimately allowed to
    // see some of these orgs — which is exactly why "allowed" is not "scoped".
    await admin.from('org_members').insert([
      { org_id: agencyA, user_id: u.id, role: 'reseller' },
      { org_id: agencyB, user_id: u.id, role: 'reseller' },
    ])

    const period = currentPeriodStart()
    await admin.from('usage_periods').insert([
      { org_id: clientA1, period_start: period, minutes_used: 120, minutes_cap: 1000 },
      { org_id: clientB1, period_start: period, minutes_used: 999, minutes_cap: 1000 },
      { org_id: agencyA, period_start: period, minutes_used: 40, minutes_cap: 1000 },
    ])
    await admin.from('org_branding').insert({ org_id: clientA2, product_name: 'Client A2 Voice' })

    dual = createDb(URL_!, SECRET!, { role: 'authenticated', sub: u.id })
  }, 60_000)

  afterAll(async () => {
    if (!admin) return
    // parent_org_id is ON DELETE RESTRICT: children first, or this throws.
    const { error: cErr } = await admin.from('orgs').delete().in('parent_org_id', orgs)
    if (cErr) throw new Error(`cleanup sub-orgs: ${cErr.message}`)
    const { error: oErr } = await admin.from('orgs').delete().in('id', orgs)
    if (oErr) throw new Error(`cleanup orgs: ${oErr.message}`)
    await sql.query('delete from auth.users where id = any($1)', [users])
    await sql.end()
  }, 60_000)

  it('the three embeds resolve — this is the whole /agency screen in one query', async () => {
    const rows = await listSubOrgs(dual, agencyA)
    expect(rows).toHaveLength(2)
    const a1 = rows.find((r) => r.orgId === clientA1)!
    expect(a1.name).toBe(`${stamp}-clientA1`)
    expect(a1.planName).toBe('Starter') // plans embed
    expect(a1.minutesUsed).toBe(120) // usage_periods embed, filtered to this period
    expect(a1.hasOwnBranding).toBe(false) // org_branding embed
    expect(rows.find((r) => r.orgId === clientA2)!.hasOwnBranding).toBe(true)
  }, 30_000)

  // THE REGRESSION TEST. The caller is a legitimate reseller at BOTH agencies, so
  // RLS lets them see every org here. Only the parent_org_id filter separates
  // them — delete it and this is the only case that fails.
  it('lists ONE agency\'s clients, not every client the caller can reach', async () => {
    const a = await listSubOrgs(dual, agencyA)
    const b = await listSubOrgs(dual, agencyB)
    expect(a.map((r) => r.orgId).sort()).toEqual([clientA1, clientA2].sort())
    expect(b.map((r) => r.orgId)).toEqual([clientB1])
    expect(a.some((r) => r.orgId === clientB1)).toBe(false)
  }, 30_000)

  it('getSubOrg refuses another agency\'s client even for a caller RLS allows', async () => {
    expect(await getSubOrg(dual, agencyA, clientA1)).not.toBeNull()
    // clientB1 is readable to this user through agencyB — but not as agencyA's.
    expect(await getSubOrg(dual, agencyA, clientB1)).toBeNull()
  }, 30_000)

  it('countSubOrgs counts one family, which is what the plan ceiling is checked against', async () => {
    expect(await countSubOrgs(dual, agencyA)).toBe(2)
    expect(await countSubOrgs(dual, agencyB)).toBe(1)
  }, 30_000)

  it("parentUsage reads the agency's own workspace, not the family", async () => {
    expect(await parentUsage(dual, agencyA)).toBe(40)
  }, 30_000)

  it('a period with no usage row reads as zero, not as a crash', async () => {
    expect(await parentUsage(dual, agencyB)).toBe(0)
    const rows = await listSubOrgs(dual, agencyA, '1999-01-01')
    expect(rows.every((r) => r.minutesUsed === 0)).toBe(true)
  }, 30_000)
})

it('agency-db live test env', () => {
  if (!live) console.warn('agency-db live tests skipped — run npm run migrate:verify')
  expect(true).toBe(true)
})
