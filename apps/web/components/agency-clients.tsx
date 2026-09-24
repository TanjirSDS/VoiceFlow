'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createSubOrgAction } from '../app/agency/actions'
import { AgencyIcon } from './icons'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { EmptyState } from './empty-state'
import { Input } from './ui/input'
import { Label } from './ui/label'

export interface ClientRow {
  orgId: string
  name: string
  minutesUsed: number
  minutesCap: number
  sharePct: number
  createdAt: string
  hasOwnBranding: boolean
}

/**
 * The client list — the agency's home screen.
 *
 * A table, not cards: an agency scans this for "who is near their cap" and
 * "who called nothing this month", which are column comparisons. Cards would
 * make every client equally prominent, which is the opposite of what scanning
 * needs.
 */
export function AgencyClients({
  clients,
  ownMinutes,
  ownName,
  headroom,
  maxSubOrgs,
  maxMinutesCap,
  agencyProductName,
}: {
  clients: ClientRow[]
  ownMinutes: number
  ownName: string
  headroom: number
  maxSubOrgs: number
  maxMinutesCap: number
  agencyProductName: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Client workspaces</h2>
          <p className="text-sm text-muted-foreground">
            {clients.length} of {maxSubOrgs} used
            {headroom === 0 && ' — your plan limit'}
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={headroom === 0}>
          Add client
        </Button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={<AgencyIcon />}
          title="No client workspaces yet"
          description={`Each client gets their own workspace, agents and phone numbers — branded as ${agencyProductName}, drawing on your shared pool of minutes.`}
          cta={
            <Button onClick={() => setOpen(true)} disabled={headroom === 0}>
              Add your first client
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Minutes</th>
                  <th className="px-4 py-3">Share of pool</th>
                  <th className="px-4 py-3">Branding</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const pct = c.minutesCap > 0 ? (c.minutesUsed / c.minutesCap) * 100 : 0
                  return (
                    <tr key={c.orgId} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link href={`/agency/${c.orgId}`} className="font-medium hover:text-brand">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="stat-num">{Math.round(c.minutesUsed).toLocaleString()}</span>
                        <span className="text-muted-foreground"> / {c.minutesCap.toLocaleString()}</span>
                        {/* Their own cap is a spend control, so "near it" is the
                            thing worth seeing at a glance — not the pool share. */}
                        {pct >= 80 && (
                          <span
                            className={
                              pct >= 100
                                ? 'ml-2 rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-semibold text-destructive'
                                : 'ml-2 rounded-md bg-warn-soft px-1.5 py-0.5 text-[11px] font-semibold text-warn'
                            }
                          >
                            {pct >= 100 ? 'At cap' : 'Near cap'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.sharePct.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.hasOwnBranding ? 'Custom' : `Inherits ${agencyProductName}`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/agency/${c.orgId}`} className="text-sm font-medium text-brand hover:text-brand-strong">
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                <tr className="bg-muted/20 text-muted-foreground">
                  <td className="px-4 py-3 font-medium">{ownName} (your own workspace)</td>
                  <td className="px-4 py-3">
                    <span className="stat-num">{Math.round(ownMinutes).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3" colSpan={3}>
                    Counts toward the same pool
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddClientDialog open={open} onOpenChange={setOpen} maxMinutesCap={maxMinutesCap} />
    </div>
  )
}

function AddClientDialog({
  open,
  onOpenChange,
  maxMinutesCap,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  maxMinutesCap: number
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a client workspace</DialogTitle>
          <DialogDescription>
            They get their own agents, numbers and call history, branded as yours. Their minutes
            come out of your shared pool.
          </DialogDescription>
        </DialogHeader>
        <form
          action={(fd) =>
            start(async () => {
              setError(null)
              const res = await createSubOrgAction(fd)
              if (res.error) {
                setError(res.error)
                return
              }
              toast.success('Client workspace created')
              onOpenChange(false)
            })
          }
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Client name</Label>
            <Input id="name" name="name" required maxLength={80} placeholder="Northside Dental" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minutesCap">Monthly minute cap</Label>
            <Input
              id="minutesCap"
              name="minutesCap"
              type="number"
              min={1}
              max={maxMinutesCap}
              defaultValue={500}
            />
            <p className="text-xs text-muted-foreground">
              A spend control for this client, not a price — their agents pause at the cap so one
              client cannot drain the whole pool. You can change it any time.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create workspace'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
