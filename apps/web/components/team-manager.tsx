'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  changeRoleAction,
  inviteUserAction,
  removeMemberAction,
  resendInviteAction,
  revokeInviteAction,
  setMemberPasswordAction,
  type TeamResult,
} from '../app/team/actions'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'

export interface MemberRow {
  userId: string
  name: string
  email: string
  role: string
  joinedAt: string
}

export interface InviteRow {
  id: string
  email: string
  role: string
  expiresAt: string
  expired: boolean
  invitedBy: string | null
}

const fmt = (iso: string) => iso.slice(0, 10)

// UX only — every rule here is re-checked by app/team/actions.ts against the DB.
export function TeamManager({
  actorId,
  actorRole,
  members,
  invites,
}: {
  actorId: string
  actorRole: 'owner' | 'admin'
  members: MemberRow[]
  invites: InviteRow[]
}) {
  const [pending, start] = useTransition()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [link, setLink] = useState<{ email: string; url: string; emailed: boolean } | null>(null)
  const [pwTarget, setPwTarget] = useState<MemberRow | null>(null)
  const [pw, setPw] = useState({ password: '', confirm: '' })
  const [removeTarget, setRemoveTarget] = useState<MemberRow | null>(null)

  const canTouch = (role: string) => actorRole === 'owner' || role !== 'owner'
  const roleOptions = actorRole === 'owner' ? ['owner', 'admin', 'member'] : ['admin', 'member']

  function run(action: () => Promise<TeamResult>, onOk: (r: TeamResult) => void) {
    start(async () => {
      const res = await action()
      if (res.error) toast.error(res.error)
      else onOk(res)
    })
  }

  function showLink(email: string) {
    return (r: TeamResult) => setLink({ email, url: r.link ?? '', emailed: !!r.emailed })
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Invite link copied')
    } catch {
      toast.error('Could not copy — select the link and copy it by hand.')
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Members</h2>
          <Button onClick={() => setInviteOpen(true)}>Invite user</Button>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.userId} className="border-b last:border-0">
                  <td className="px-4 py-2.5">
                    {m.name || <span className="text-muted-foreground">—</span>}
                    {m.userId === actorId && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-2.5">
                    {canTouch(m.role) ? (
                      <Select
                        aria-label={`Role for ${m.email}`}
                        className="h-8 w-28"
                        value={m.role}
                        disabled={pending}
                        onChange={(e) =>
                          run(
                            () => changeRoleAction(m.userId, e.target.value),
                            () => toast.success(`${m.email} is now ${e.target.value}`)
                          )
                        }
                      >
                        {[...new Set([m.role, ...roleOptions])].map((r) => (
                          <option key={r} value={r} disabled={!roleOptions.includes(r)}>
                            {r}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <span className="capitalize">{m.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fmt(m.joinedAt)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    {canTouch(m.role) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setPwTarget(m)}>
                          Change password
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(m)}>
                          Remove
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Pending invites</h2>
        {invites.length === 0 ? (
          <div className="rounded-lg border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
            No pending invites.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Expires</th>
                  <th className="px-4 py-2 font-medium">Invited by</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {invites.map((i) => (
                  <tr key={i.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5">{i.email}</td>
                    <td className="px-4 py-2.5 capitalize">{i.role}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {i.expired ? <span className="text-destructive">expired</span> : fmt(i.expiresAt)}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{i.invitedBy ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      {canTouch(i.role) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            onClick={() => run(() => resendInviteAction(i.id), showLink(i.email))}
                          >
                            Resend / copy link
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            onClick={() => run(() => revokeInviteAction(i.id), () => toast.success('Invite revoked'))}
                          >
                            Revoke
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Invite */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@business.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="invite-role">Role</Label>
              <Select id="invite-role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              disabled={pending}
              onClick={() =>
                run(
                  () => inviteUserAction({ email: inviteEmail, role: inviteRole }),
                  (r) => {
                    setInviteOpen(false)
                    showLink(inviteEmail.trim().toLowerCase())(r)
                    setInviteEmail('')
                  }
                )
              }
            >
              {pending ? 'Inviting…' : 'Create invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* The link — shown once; only its hash is stored. */}
      <Dialog open={!!link} onOpenChange={(o) => !o && setLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite link for {link?.email}</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            {link?.emailed ? 'We emailed this link. ' : 'Email is not set up, so send this link yourself. '}
            It works once and expires in 7 days. It is shown only now — “Resend / copy link” makes a new one and
            the old one stops working.
          </p>
          <code className="block break-all rounded-md border bg-muted px-3 py-2 text-xs">{link?.url}</code>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLink(null)}>
              Done
            </Button>
            <Button onClick={() => link && copy(link.url)}>Copy link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change password */}
      <Dialog
        open={!!pwTarget}
        onOpenChange={(o) => {
          if (!o) {
            setPwTarget(null)
            setPw({ password: '', confirm: '' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password for {pwTarget?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                value={pw.password}
                onChange={(e) => setPw({ ...pw, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">At least 12 characters.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                maxLength={128}
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {pwTarget?.userId === actorId ? 'You' : 'They'} will be signed out on every device.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwTarget(null)} disabled={pending}>
              Cancel
            </Button>
            <Button
              disabled={pending}
              onClick={() =>
                pwTarget &&
                run(
                  () => setMemberPasswordAction({ userId: pwTarget.userId, ...pw }),
                  () => {
                    toast.success(`Password changed for ${pwTarget.email}`)
                    setPwTarget(null)
                    setPw({ password: '', confirm: '' })
                  }
                )
              }
            >
              {pending ? 'Saving…' : 'Set password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove */}
      <Dialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removeTarget?.email}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            They lose access to this workspace immediately. Their account and anything they created stay — you can
            invite them back later.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                removeTarget &&
                run(
                  () => removeMemberAction(removeTarget.userId),
                  () => {
                    toast.success(`${removeTarget.email} removed`)
                    setRemoveTarget(null)
                  }
                )
              }
            >
              {pending ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
