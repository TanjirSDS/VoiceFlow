import { createHash, randomBytes } from 'node:crypto'
import { pool } from '@voiceflow/db'

// Invite links (0024). The link carries 32 random bytes; the database holds
// only their sha256, so neither a DB leak nor this server can re-show a link —
// "copy link" always means a freshly minted one.

export const INVITE_ROLES = ['owner', 'admin', 'member'] as const
export type InviteRole = (typeof INVITE_ROLES)[number]

export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function newInviteToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashInviteToken(token) }
}

export interface InviteView {
  email: string
  role: InviteRole
  orgId: string
  orgName: string
  /** Null when the link can still be accepted. */
  problem: 'used' | 'revoked' | 'expired' | null
  /** An account already exists for this email — accepting must not touch its password. */
  hasAccount: boolean
}

/** What a link points at, or null when it points at nothing (malformed, or
 *  rotated by a resend). Read-only: claiming happens in the accept actions. */
export async function findInvite(token: string): Promise<InviteView | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  const { rows } = await pool().query(
    `select i.email, i.role, i.org_id, o.name as org_name,
            i.accepted_at is not null as used, i.revoked_at is not null as revoked,
            i.expires_at <= now() as expired,
            exists (select 1 from auth.users u where u.email = i.email) as has_account
       from public.org_invites i join public.orgs o on o.id = i.org_id
      where i.token_hash = $1`,
    [hashInviteToken(token)]
  )
  const r = rows[0]
  if (!r) return null
  return {
    email: r.email,
    role: r.role,
    orgId: r.org_id,
    orgName: r.org_name,
    problem: r.used ? 'used' : r.revoked ? 'revoked' : r.expired ? 'expired' : null,
    hasAccount: r.has_account,
  }
}

export const INVITE_PROBLEM_TEXT = {
  missing: 'This invite link is not valid. It may have been replaced by a newer one — ask for a new invite.',
  used: 'This invite has already been used. Sign in instead.',
  revoked: 'This invite was revoked. Ask the workspace owner or an admin for a new one.',
  expired: 'This invite has expired. Ask the workspace owner or an admin to send a new one.',
} as const
