'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { pool } from '@voiceflow/db'
import { currentUser, getAuth, hashPassword } from '../../lib/auth'
import { headerSafe } from '../../lib/brand-constants'
import { findInvite, hashInviteToken, INVITE_PROBLEM_TEXT } from '../../lib/invites'
import { switchWorkspaceAction } from '../actions'

// Claims the invite: only a pending, unexpired, unrevoked row matches, and the
// UPDATE takes its row lock — two tabs submitting the same link cannot both win.
// `email` is passed only by the existing-account path, where the signed-in
// address must be the invited one.
const CLAIM = `update public.org_invites set accepted_at = now()
  where token_hash = $1 and accepted_at is null and revoked_at is null and expires_at > now()
    and ($2::text is null or email = $2)
  returning org_id, email, role`

async function refusal(token: string): Promise<string> {
  const invite = await findInvite(token)
  return INVITE_PROBLEM_TEXT[invite?.problem ?? 'missing']
}

/**
 * A NEW account from an invite: name + password, email fixed by the invite.
 * Refuses when the email already has an account — setting a password there
 * would hand that account (and every workspace it belongs to) to whoever holds
 * this link, which includes the admin who copied it. That case goes through
 * acceptAsExistingUserAction instead.
 */
export async function acceptInviteAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const token = String(formData.get('token') ?? '')
  const name = headerSafe(String(formData.get('name') ?? '')) // no control characters in a display name
  const password = String(formData.get('password') ?? '')
  if (!name || name.length > 80) return { error: 'Enter your full name (up to 80 characters).' }
  if (password.length < 12 || password.length > 128) return { error: 'Use a password of 12 to 128 characters.' }
  if (password !== formData.get('confirm')) return { error: 'The two passwords do not match.' }

  const hash = await hashPassword(password) // before BEGIN: no locks held while scrypt runs
  const client = await pool().connect()
  let email: string
  try {
    await client.query('begin')
    const claimed = await client.query(CLAIM, [hashInviteToken(token), null])
    if (!claimed.rowCount) {
      await client.query('rollback')
      return { error: await refusal(token) }
    }
    const invite = claimed.rows[0]
    email = invite.email
    // email_verified stays false: holding a link proves nothing about the
    // mailbox. If the real owner of this address ever signs in by magic link,
    // Better Auth's revokeUnprovenAccountAccess then drops this password and
    // its sessions — so no one can claim a stranger's address in advance.
    const user = await client.query(
      `insert into auth.users (name, email, email_verified) values ($1, $2, false)
       on conflict (email) do nothing returning id`,
      [name, email]
    )
    if (!user.rowCount) {
      await client.query('rollback')
      return { error: `An account for ${email} already exists. Sign in as ${email}, then open this link again.` }
    }
    const userId = user.rows[0].id
    // Better Auth's credential row: provider 'credential', account_id = user id.
    await client.query(
      `insert into auth.accounts (user_id, account_id, provider_id, password) values ($1, $2, 'credential', $3)`,
      [userId, userId, hash]
    )
    await client.query(`insert into public.org_members (org_id, user_id, role) values ($1, $2, $3)`, [
      invite.org_id,
      userId,
      invite.role,
    ])
    await client.query('commit')
  } catch (e) {
    await client.query('rollback').catch(() => {})
    console.error('[invite] accept failed', e)
    return { error: 'Could not accept the invite — try again.' }
  } finally {
    client.release()
  }

  // Better Auth's own sign-in: verifies the hash we just stored and sets the cookie.
  try {
    await getAuth().api.signInEmail({ body: { email, password }, headers: await headers() })
  } catch (e) {
    console.error('[invite] sign-in after accept failed', e)
    redirect('/login')
  }
  redirect('/dashboard')
}

/** An EXISTING account accepting: only while signed in as the invited email,
 *  and it adds the membership — the account's password is never touched. */
export async function acceptAsExistingUserAction(token: string): Promise<{ error?: string }> {
  const user = await currentUser()
  if (!user) return { error: 'Sign in first.' }
  const email = user.email.toLowerCase()

  const client = await pool().connect()
  let orgId: string
  try {
    await client.query('begin')
    // Serialises with a concurrent owner/admin password change on this user
    // (app/team/actions.ts), whose cross-workspace check must see this membership.
    await client.query('select 1 from auth.users where id = $1 for no key update', [user.id])
    const claimed = await client.query(CLAIM, [hashInviteToken(token), email])
    if (!claimed.rowCount) {
      await client.query('rollback')
      const invite = await findInvite(token)
      if (invite && !invite.problem) return { error: `This invite is for ${invite.email}. Sign in as that account.` }
      return { error: await refusal(token) }
    }
    const invite = claimed.rows[0]
    orgId = invite.org_id
    // Already a member → keep their current role; the invite is spent either way.
    await client.query(
      `insert into public.org_members (org_id, user_id, role) values ($1, $2, $3) on conflict (org_id, user_id) do nothing`,
      [invite.org_id, user.id, invite.role]
    )
    await client.query('commit')
  } catch (e) {
    await client.query('rollback').catch(() => {})
    console.error('[invite] existing-user accept failed', e)
    return { error: 'Could not accept the invite — try again.' }
  } finally {
    client.release()
  }
  return (await switchWorkspaceAction(orgId)) ?? {} // redirects into the workspace
}
