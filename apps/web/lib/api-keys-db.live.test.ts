// Phase 24 regression: RLS scopes api_keys to every org the user is a MEMBER
// of, which is wider than the org the settings page authorized. A user who is
// owner of their own workspace and a plain member of someone else's could
// therefore list — and revoke — the other workspace's keys. These run against a
// real Postgres + PostgREST (`npm run migrate:verify`) and skip without it.
import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createDb, type Db } from '@voiceflow/db'
import { listApiKeys, revokeApiKey } from './api-keys-db'

const URL = process.env.POSTGREST_URL
const SECRET = process.env.POSTGREST_JWT_SECRET
const DATABASE_URL = process.env.DATABASE_URL
const live = !!(URL && SECRET && DATABASE_URL)

describe.skipIf(!live)('api_keys are scoped to one org, not to membership (live)', () => {
  const admin = live ? createDb(URL!, SECRET!, { role: 'service_role' }) : null!
  const sql = live ? new Pool({ connectionString: DATABASE_URL }) : null!
  const stamp = `keyscope-${Date.now()}`
  let userId: string
  let orgMine: string
  let orgTheirs: string
  let keyMine: string
  let keyTheirs: string
  let client: Db

  beforeAll(async () => {
    const {
      rows: [u],
    } = await sql.query<{ id: string }>(
      'insert into auth.users (email, email_verified) values ($1, true) returning id',
      [`${stamp}@voiceflow.test`]
    )
    userId = u.id

    const mkOrg = async (tag: string, role: string) => {
      const { data, error } = await admin
        .from('orgs')
        .insert({ name: `${stamp}-${tag}`, plan_id: 'pro', minutes_cap: 100 })
        .select('id')
        .single()
      if (error) throw new Error(error.message)
      // The user is OWNER of their own workspace and a plain MEMBER of the other.
      await admin.from('org_members').insert({ org_id: data.id, user_id: userId, role })
      const { data: key } = await admin
        .from('api_keys')
        .insert({ org_id: data.id, key_hash: `${stamp}-${tag}-hash`, prefix: 'vf_scope', name: `${stamp}-${tag}` })
        .select('id')
        .single()
      return [data.id as string, key!.id as string] as const
    }

    ;[orgMine, keyMine] = await mkOrg('mine', 'owner')
    ;[orgTheirs, keyTheirs] = await mkOrg('theirs', 'member')
    client = createDb(URL!, SECRET!, { role: 'authenticated', sub: userId })
  }, 60_000)

  afterAll(async () => {
    if (!admin) return
    const { error } = await admin.from('orgs').delete().in('id', [orgMine, orgTheirs])
    if (error) throw new Error(`cleanup orgs: ${error.message}`)
    await sql.query('delete from auth.users where id = $1', [userId])
    await sql.end()
  }, 60_000)

  it('RLS alone spans BOTH workspaces — this is why the org filter is required', async () => {
    // Documents the hazard: the unfiltered read the settings page used to do.
    const { data } = await client.from('api_keys').select('id, org_id')
    const orgIds = new Set((data ?? []).map((r) => r.org_id))
    expect(orgIds.has(orgMine)).toBe(true)
    expect(orgIds.has(orgTheirs)).toBe(true)
  }, 30_000)

  it('listApiKeys returns only the named org', async () => {
    const mine = await listApiKeys(client, orgMine)
    expect(mine.map((k) => k.id)).toEqual([keyMine])

    const theirs = await listApiKeys(client, orgTheirs)
    expect(theirs.map((k) => k.id)).toEqual([keyTheirs])
  }, 30_000)

  it('revokeApiKey cannot touch a key outside the named org', async () => {
    const n = await revokeApiKey(client, orgMine, keyTheirs)
    expect(n).toBe(0)

    const { data } = await admin.from('api_keys').select('revoked_at').eq('id', keyTheirs).single()
    expect(data!.revoked_at).toBeNull() // the other workspace's key still works
  }, 30_000)

  it('revokeApiKey revokes its own org’s key exactly once', async () => {
    expect(await revokeApiKey(client, orgMine, keyMine)).toBe(1)
    const { data } = await admin.from('api_keys').select('revoked_at').eq('id', keyMine).single()
    const first = data!.revoked_at
    expect(first).toBeTruthy()

    // A second revoke is a no-op and must not move the original timestamp.
    expect(await revokeApiKey(client, orgMine, keyMine)).toBe(0)
    const { data: again } = await admin.from('api_keys').select('revoked_at').eq('id', keyMine).single()
    expect(again!.revoked_at).toBe(first)
  }, 30_000)
})

it('api key scope live test env', () => {
  if (!live) console.warn('api-keys-db live tests skipped — run npm run migrate:verify')
  expect(true).toBe(true)
})
