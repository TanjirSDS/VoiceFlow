import type { Db } from '@voiceflow/db'

// Phase 24. The api_keys reads and writes the settings UI makes, each taking the
// org EXPLICITLY.
//
// Why that is not redundant with RLS: is_org_member() answers "is this user a
// member of that org?", which spans EVERY workspace they belong to. The settings
// page authorized exactly one — the active workspace, where it checked the
// caller is an owner on a Pro plan. Leaving the statement unscoped lets RLS
// silently widen it back out to all of them, so someone who is a plain member of
// another workspace could list and revoke ITS keys from their own. RLS stays as
// defence in depth; the org filter is the actual boundary.

export interface StoredApiKey {
  id: string
  name: string
  prefix: string
  last_used_at: string | null
  revoked_at: string | null
  created_by: string | null
  created_at: string
}

// key_hash is deliberately absent — 0020 revokes the column from members, so
// naming it here would fail the query outright.
const COLS = 'id, name, prefix, last_used_at, revoked_at, created_by, created_at'

export async function listApiKeys(db: Db, orgId: string): Promise<StoredApiKey[]> {
  const { data, error } = await db
    .from('api_keys')
    .select(COLS)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as StoredApiKey[]
}

/** Returns how many rows were revoked: 1 on success, 0 if the id belongs to
 *  another workspace or was already revoked. Callers treat 0 as a failure —
 *  a revoke that silently did nothing must not report success. */
export async function revokeApiKey(db: Db, orgId: string, id: string): Promise<number> {
  const { data, error } = await db
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', orgId)
    // Keeps the first revocation's timestamp if this runs twice.
    .is('revoked_at', null)
    .select('id')
  if (error) throw new Error(error.message)
  return (data ?? []).length
}
