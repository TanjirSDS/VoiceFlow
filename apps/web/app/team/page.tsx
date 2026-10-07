import { notFound } from 'next/navigation'
import { pool } from '@voiceflow/db'
import { TeamManager, type InviteRow, type MemberRow } from '../../components/team-manager'
import { currentUser } from '../../lib/auth'
import { activeOrg } from '../../lib/org'

export const dynamic = 'force-dynamic'

// User Management. Owner/admin only — the role is re-read here rather than
// taken from activeOrg(), which reports 'support' for staff in view-as.
// pool(), not the RLS client: members' emails live in auth.users (off
// PostgREST) and org_members' RLS shows each user only their own row.
export default async function TeamPage() {
  const [user, org] = await Promise.all([currentUser(), activeOrg()])
  if (!user || !org) notFound()
  const db = pool()
  const { rows: me } = await db.query('select role from public.org_members where org_id = $1 and user_id = $2', [
    org.orgId,
    user.id,
  ])
  const actorRole = me[0]?.role
  if (actorRole !== 'owner' && actorRole !== 'admin') notFound()

  const [members, invites] = await Promise.all([
    db.query(
      `select m.user_id, m.role, m.created_at, u.name, u.email
         from public.org_members m join auth.users u on u.id = m.user_id
        where m.org_id = $1 order by m.created_at`,
      [org.orgId]
    ),
    db.query(
      `select i.id, i.email, i.role, i.expires_at, i.created_at, u.email as invited_by
         from public.org_invites i left join auth.users u on u.id = i.invited_by
        where i.org_id = $1 and i.accepted_at is null and i.revoked_at is null
        order by i.created_at desc`,
      [org.orgId]
    ),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who can sign in to {org.name}. Owners and admins invite, remove and manage people here; only owners
          handle billing.
        </p>
      </div>
      <TeamManager
        actorId={user.id}
        actorRole={actorRole}
        members={members.rows.map(
          (r): MemberRow => ({
            userId: r.user_id,
            name: r.name,
            email: r.email,
            role: r.role,
            joinedAt: r.created_at.toISOString(),
          })
        )}
        invites={invites.rows.map(
          (r): InviteRow => ({
            id: r.id,
            email: r.email,
            role: r.role,
            expiresAt: r.expires_at.toISOString(),
            expired: r.expires_at <= new Date(),
            invitedBy: r.invited_by,
          })
        )}
      />
    </div>
  )
}
