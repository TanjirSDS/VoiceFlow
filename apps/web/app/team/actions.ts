'use server'

import { createElement } from 'react'
import { revalidatePath } from 'next/cache'
import type { PoolClient } from 'pg'
import { pool } from '@voiceflow/db'
import { InviteEmail } from '../../emails'
import { currentUser, hashPassword } from '../../lib/auth'
import { emailBrandFor, sendEmail } from '../../lib/email'
import { INVITE_ROLES, newInviteToken, type InviteRole } from '../../lib/invites'
import { activeOrg } from '../../lib/org'

// User management for the ACTIVE workspace (hard rule 8). The client's idea of
// anyone's role is never trusted: each action opens a transaction, locks the
// workspace row, then re-reads the caller's role from org_members. The lock
// serialises every manager action in that workspace, so two owners removing
// each other cannot both pass the last-owner check.
//
// Rules: owner and admin manage users; an admin can never act on an owner or a
// reseller (who reaches every client sub-org), on an owner invite, or grant
// owner; the last owner cannot be removed or demoted.

export interface TeamResult {
  error?: string
  /** A freshly minted invite link — the only time it exists outside the email. */
  link?: string
  emailed?: boolean
}

type ManagerRole = 'owner' | 'admin'
interface Ctx {
  db: PoolClient
  orgId: string
  orgName: string
  actorId: string
  actorRole: ManagerRole
}

/** Thrown for a refusal the caller should read; anything else is logged and generic. */
class Refused extends Error {}

async function asManager(fn: (ctx: Ctx) => Promise<TeamResult>): Promise<TeamResult> {
  const [user, org] = await Promise.all([currentUser(), activeOrg()])
  if (!user || !org) return { error: 'Sign in again.' }
  const db = await pool().connect()
  try {
    await db.query('begin')
    // NO KEY UPDATE: serialises managers of this workspace with each other, but
    // not the FK inserts (calls, members joining) that take KEY SHARE on orgs.
    await db.query('select 1 from public.orgs where id = $1 for no key update', [org.orgId])
    const { rows } = await db.query('select role from public.org_members where org_id = $1 and user_id = $2', [
      org.orgId,
      user.id,
    ])
    const role = rows[0]?.role
    // Support staff in view-as have no membership row, so they fall out here too.
    if (role !== 'owner' && role !== 'admin') throw new Refused('Only owners and admins can manage users.')
    const result = await fn({ db, orgId: org.orgId, orgName: org.name, actorId: user.id, actorRole: role })
    await db.query('commit')
    revalidatePath('/team')
    return result
  } catch (e) {
    await db.query('rollback').catch(() => {})
    if (e instanceof Refused) return { error: e.message }
    console.error('[team] action failed', e)
    return { error: 'Something went wrong — nothing was changed.' }
  } finally {
    db.release()
  }
}

/** The target's membership in the active workspace, or a refusal. */
async function member(ctx: Ctx, userId: string): Promise<{ role: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Refused('That user is not in this workspace.')
  const { rows } = await ctx.db.query('select role from public.org_members where org_id = $1 and user_id = $2', [
    ctx.orgId,
    userId,
  ])
  if (!rows[0]) throw new Refused('That user is not in this workspace.')
  if (ctx.actorRole === 'admin' && (rows[0].role === 'owner' || rows[0].role === 'reseller')) {
    throw new Refused(`Admins cannot change ${rows[0].role === 'owner' ? 'an owner' : 'a reseller'}.`)
  }
  return rows[0]
}

async function assertNotLastOwner(ctx: Ctx, userId: string): Promise<void> {
  const { rows } = await ctx.db.query(
    `select count(*)::int as n from public.org_members where org_id = $1 and role = 'owner' and user_id <> $2`,
    [ctx.orgId, userId]
  )
  if (rows[0].n === 0) throw new Refused('A workspace needs at least one owner. Make someone else an owner first.')
}

function parseRole(raw: unknown, ctx: Ctx): InviteRole {
  const role = String(raw) as InviteRole
  if (!INVITE_ROLES.includes(role)) throw new Refused('Pick a role.')
  if (role === 'owner' && ctx.actorRole !== 'owner') throw new Refused('Only an owner can make someone an owner.')
  return role
}

/** Rotates the invite's token and restarts its 7 days; the old link stops working. */
async function issueLink(ctx: Ctx, inviteId: string): Promise<{ token: string }> {
  const { token, hash } = newInviteToken()
  await ctx.db.query(
    `update public.org_invites set token_hash = $2, expires_at = now() + interval '7 days', invited_by = $3 where id = $1`,
    [inviteId, hash, ctx.actorId]
  )
  return { token }
}

async function deliver(orgId: string, orgName: string, email: string, token: string): Promise<TeamResult> {
  const { brand, from } = await emailBrandFor(orgId)
  const link = `${brand.appUrl}/invite/${token}`
  let emailed = false
  try {
    emailed = await sendEmail(
      [email],
      `You're invited to join ${brand.productName}`, // no org name: it is user-typed and this is a header
      createElement(InviteEmail, { url: link, orgName, brand }),
      from
    )
  } catch (e) {
    console.error('[team] invite email failed (link still shown)', e)
  }
  return { link, emailed }
}

export async function inviteUserAction(input: { email: string; role: string }): Promise<TeamResult> {
  const email = String(input.email ?? '')
    .trim()
    .toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }
  let token = ''
  let org = { id: '', name: '' }
  const res = await asManager(async (ctx) => {
    const role = parseRole(input.role, ctx)
    org = { id: ctx.orgId, name: ctx.orgName }
    const already = await ctx.db.query(
      `select 1 from public.org_members m join auth.users u on u.id = m.user_id where m.org_id = $1 and u.email = $2`,
      [ctx.orgId, email]
    )
    if (already.rowCount) throw new Refused(`${email} is already in this workspace.`)
    const pending = await ctx.db.query(
      `select id, role from public.org_invites
        where org_id = $1 and email = $2 and accepted_at is null and revoked_at is null`,
      [ctx.orgId, email]
    )
    let inviteId: string
    if (pending.rows[0]) {
      // Re-inviting rotates the live invite instead of leaving two links around.
      if (ctx.actorRole === 'admin' && pending.rows[0].role === 'owner') throw new Refused('Admins cannot change an owner invite.')
      inviteId = pending.rows[0].id
      await ctx.db.query('update public.org_invites set role = $2 where id = $1', [inviteId, role])
    } else {
      const { token: t, hash } = newInviteToken()
      const ins = await ctx.db.query(
        `insert into public.org_invites (org_id, email, role, token_hash, invited_by) values ($1, $2, $3, $4, $5) returning id`,
        [ctx.orgId, email, role, hash, ctx.actorId]
      )
      inviteId = ins.rows[0].id
      token = t
      return {}
    }
    token = (await issueLink(ctx, inviteId)).token
    return {}
  })
  if (res.error) return res
  return deliver(org.id, org.name, email, token)
}

export async function resendInviteAction(inviteId: string): Promise<TeamResult> {
  let sent = { token: '', email: '', orgId: '', orgName: '' }
  const res = await asManager(async (ctx) => {
    const { rows } = await ctx.db.query(
      `select id, email, role from public.org_invites
        where id = $1 and org_id = $2 and accepted_at is null and revoked_at is null`,
      [inviteId, ctx.orgId]
    )
    if (!rows[0]) throw new Refused('That invite is no longer pending.')
    if (ctx.actorRole === 'admin' && rows[0].role === 'owner') throw new Refused('Admins cannot change an owner invite.')
    const { token } = await issueLink(ctx, inviteId)
    sent = { token, email: rows[0].email, orgId: ctx.orgId, orgName: ctx.orgName }
    return {}
  })
  if (res.error) return res
  return deliver(sent.orgId, sent.orgName, sent.email, sent.token)
}

export async function revokeInviteAction(inviteId: string): Promise<TeamResult> {
  return asManager(async (ctx) => {
    const { rows } = await ctx.db.query(
      `select role from public.org_invites where id = $1 and org_id = $2 and accepted_at is null and revoked_at is null`,
      [inviteId, ctx.orgId]
    )
    if (!rows[0]) throw new Refused('That invite is no longer pending.')
    if (ctx.actorRole === 'admin' && rows[0].role === 'owner') throw new Refused('Admins cannot change an owner invite.')
    await ctx.db.query('update public.org_invites set revoked_at = now() where id = $1', [inviteId])
    return {}
  })
}

/** Removes the MEMBERSHIP only. The account, its sessions and everything it
 *  created stay — they may belong to other workspaces, and history must survive. */
export async function removeMemberAction(userId: string): Promise<TeamResult> {
  return asManager(async (ctx) => {
    const target = await member(ctx, userId)
    if (target.role === 'owner') await assertNotLastOwner(ctx, userId)
    await ctx.db.query('delete from public.org_members where org_id = $1 and user_id = $2', [ctx.orgId, userId])
    return {}
  })
}

export async function changeRoleAction(userId: string, newRole: string): Promise<TeamResult> {
  return asManager(async (ctx) => {
    const role = parseRole(newRole, ctx)
    const target = await member(ctx, userId)
    if (target.role === role) return {}
    if (target.role === 'owner') await assertNotLastOwner(ctx, userId)
    await ctx.db.query('update public.org_members set role = $3 where org_id = $1 and user_id = $2', [
      ctx.orgId,
      userId,
      role,
    ])
    return {}
  })
}

/**
 * Sets a member's password and signs them out everywhere.
 *
 * A password opens the whole ACCOUNT, not one workspace. So this is allowed
 * only when the caller manages EVERY workspace the target belongs to (and is
 * an owner wherever the target is an owner or reseller) — otherwise an admin
 * of a small workspace could take over someone who also owns a bigger one —
 * and it keeps being enforced afterwards (org_password_grants). Platform
 * support accounts are never settable from here.
 */
export async function setMemberPasswordAction(input: {
  userId: string
  password: string
  confirm: string
}): Promise<TeamResult> {
  const password = String(input.password ?? '')
  if (password.length < 12 || password.length > 128) return { error: 'Use a password of 12 to 128 characters.' }
  if (password !== input.confirm) return { error: 'The two passwords do not match.' }
  const hash = await hashPassword(password) // before BEGIN: no locks held while scrypt runs

  return asManager(async (ctx) => {
    await member(ctx, input.userId)
    // Serialises with an invite being accepted by this account elsewhere, so
    // the membership list below cannot grow between the check and the write.
    await ctx.db.query('select 1 from auth.users where id = $1 for no key update', [input.userId])
    const support = await ctx.db.query('select 1 from public.admin_users where user_id = $1', [input.userId])
    if (support.rowCount) throw new Refused('This account has platform access; its password cannot be set here.')
    // One definition of the rule, shared with the trigger that keeps enforcing
    // it after today (0024 password_grant_holds / enforce_password_grants).
    const { rows } = await ctx.db.query('select public.password_grant_holds($1, $2) as ok', [input.userId, ctx.actorId])
    if (!rows[0].ok) {
      throw new Refused(
        'This person also belongs to a workspace you do not manage, so you cannot set their password — it would give you access there too.'
      )
    }
    const updated = await ctx.db.query(
      `update auth.accounts set password = $3, updated_at = now()
        where user_id = $1 and provider_id = 'credential' and account_id = $2`,
      [input.userId, input.userId, hash]
    )
    if (!updated.rowCount) {
      await ctx.db.query(
        `insert into auth.accounts (user_id, account_id, provider_id, password) values ($1, $2, 'credential', $3)`,
        [input.userId, input.userId, hash]
      )
    }
    // The setter knows this password, so record it: the 0024 trigger deletes it
    // the moment the rule above stops holding (they join a workspace the setter
    // doesn't manage, or the setter loses their role). Your own password is yours.
    if (input.userId === ctx.actorId) {
      await ctx.db.query('delete from public.org_password_grants where user_id = $1', [input.userId])
    } else {
      await ctx.db.query(
        `insert into public.org_password_grants (user_id, set_by, password_hash) values ($1, $2, $3)
         on conflict (user_id) do update set set_by = excluded.set_by, password_hash = excluded.password_hash, created_at = now()`,
        [input.userId, ctx.actorId, hash]
      )
    }
    // Every session, this device included if they changed their own: the old
    // password's sessions must not outlive it. (No secondary storage or cookie
    // cache is configured, so the sessions table is the whole truth.)
    await ctx.db.query('delete from auth.sessions where user_id = $1', [input.userId])
    return {}
  })
}
