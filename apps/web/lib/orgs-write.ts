import { pool, serviceClient } from '@voiceflow/db'

// Create an org + owner membership for a user. Service-role writes: members
// can't insert orgs or memberships under RLS (Phase 4 kept membership
// management out of user reach). Shared by the signup funnel (createOrgAction)
// and the workspace switcher's "Create workspace" (createWorkspaceAction) so
// both provision identically. Not a 'use server' module — server-only, imported
// only by server actions, so `userId` is never client-supplied.
export async function provisionOrg(
  userId: string,
  name: string
): Promise<{ orgId?: string; error?: string }> {
  // An account made from an invite link has not proven its mailbox (0024). It
  // may join the workspaces it was invited to, but not found new ones: whoever
  // held the link could otherwise build a workspace "as" a stranger's address
  // that the stranger inherits — integrations and all — when they first sign in.
  const { rows } = await pool().query('select email_verified from auth.users where id = $1', [userId])
  if (!rows[0]?.email_verified) {
    return { error: 'Confirm your email first — sign in once with a magic link, then create your workspace.' }
  }
  const svc = serviceClient()
  const { data: starter } = await svc
    .from('plans')
    .select('included_minutes')
    .eq('id', 'starter')
    .single()
  const { data: org, error } = await svc
    .from('orgs')
    .insert({ name, minutes_cap: starter?.included_minutes ?? 750 })
    .select('id')
    .single()
  if (error || !org) return { error: error?.message ?? 'Could not create workspace.' }
  const { error: memberErr } = await svc
    .from('org_members')
    .insert({ org_id: org.id, user_id: userId, role: 'owner' })
  if (memberErr) return { error: memberErr.message }
  return { orgId: org.id }
}
