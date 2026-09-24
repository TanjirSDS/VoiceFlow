'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  connectCalcomAction,
  createWebhookEndpointAction,
  deleteWebhookEndpointAction,
  disconnectCalcomAction,
  disconnectCrmAction,
  setWebhookEndpointEnabledAction,
} from '../app/integrations/actions'
import { cn } from '../lib/utils'
import { Button, buttonVariants } from './ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

export interface EndpointRow {
  id: string
  url: string
  events: string[]
  enabled: boolean
  createdAt: string
  latestStatus: string | null
}

const EVENT_TYPES = ['call.completed', 'alert.fired'] as const
const STATUS_DOT: Record<string, string> = {
  ok: 'bg-emerald-500',
  pending: 'bg-muted-foreground/40',
  failed: 'bg-amber-500',
  dead: 'bg-destructive',
}
const CRM_DESC: Record<string, string> = {
  hubspot: 'Upsert the caller as a contact and log every call as an activity with its summary and outcome.',
  pipedrive: 'Upsert the caller as a person and log every call as a completed activity with its summary and outcome.',
}

export interface CrmRow {
  id: string
  name: string
  /** Whether this deployment has OAuth credentials for the provider at all. */
  configured: boolean
  status: 'active' | 'revoked' | null
  statusDetail: string | null
  updatedAt: string | null
}

export function IntegrationsManager({
  tab,
  isOwner,
  calcom,
  endpoints,
  crm,
  flash,
}: {
  tab: 'connected' | 'available'
  isOwner: boolean
  calcom: { connected: boolean; eventTypeId: number | null }
  endpoints: EndpointRow[]
  crm: CrmRow[]
  flash?: { connected?: string; error?: string }
}) {
  if (tab === 'available') return <CrmTab crm={crm} isOwner={isOwner} flash={flash} />
  return (
    <div className="space-y-8">
      <CalcomCard isOwner={isOwner} calcom={calcom} />
      <WebhooksSection endpoints={endpoints} />
    </div>
  )
}

function CalcomCard({ isOwner, calcom }: { isOwner: boolean; calcom: { connected: boolean; eventTypeId: number | null } }) {
  const [pending, startTransition] = useTransition()

  function connect(formData: FormData) {
    startTransition(async () => {
      const res = await connectCalcomAction(formData)
      if (res?.error) toast.error(res.error)
      else toast.success('Cal.com connected — enable booking per agent in the builder.')
    })
  }
  function disconnect() {
    startTransition(async () => {
      const res = await disconnectCalcomAction()
      if (res?.error) toast.error(res.error)
      else toast.success('Cal.com disconnected')
    })
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Calendar</h2>
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Cal.com</p>
            <p className="text-sm text-muted-foreground">
              {calcom.connected
                ? `Connected (event type ${calcom.eventTypeId}). Booking agents can book real slots.`
                : 'Connect a calendar so booking agents can schedule appointments live during a call.'}
            </p>
          </div>
          {calcom.connected && (
            <Button variant="outline" size="sm" onClick={disconnect} disabled={!isOwner || pending}>
              Disconnect
            </Button>
          )}
        </div>

        {!isOwner ? (
          <p className="mt-4 text-xs text-muted-foreground">Only the workspace owner can manage the calendar connection.</p>
        ) : (
          <form action={connect} className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
            <div className="space-y-1">
              <Label htmlFor="calcom-key">Cal.com API key</Label>
              <Input id="calcom-key" name="apiKey" type="password" placeholder="cal_live_…" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="calcom-event">Event type id</Label>
              <Input id="calcom-event" name="eventTypeId" type="number" min="1" required />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Connecting…' : calcom.connected ? 'Update' : 'Connect'}
            </Button>
          </form>
        )}
        {isOwner && (
          <p className="mt-2 text-xs text-muted-foreground">A wrong id lists your available event types in the error.</p>
        )}
      </div>
    </section>
  )
}

function WebhooksSection({ endpoints }: { endpoints: EndpointRow[] }) {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<string[]>(['call.completed'])
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EndpointRow | null>(null)

  function reset() {
    setUrl('')
    setEvents(['call.completed'])
    setNewSecret(null)
  }

  function create() {
    startTransition(async () => {
      const res = await createWebhookEndpointAction({ url, events })
      if (res?.error) toast.error(res.error)
      else {
        setNewSecret(res.secret ?? '')
        toast.success('Endpoint added')
      }
    })
  }
  function toggle(ep: EndpointRow, enabled: boolean) {
    startTransition(async () => {
      const res = await setWebhookEndpointEnabledAction(ep.id, enabled)
      if (res?.error) toast.error(res.error)
      else toast.success(enabled ? 'Endpoint enabled' : 'Endpoint disabled — deliveries stopped')
    })
  }
  function confirmDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const res = await deleteWebhookEndpointAction(deleteTarget.id)
      if (res?.error) toast.error(res.error)
      else toast.success('Endpoint deleted')
      setDeleteTarget(null)
    })
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Webhook endpoints</h2>
        <Button
          onClick={() => {
            reset()
            setOpen(true)
          }}
        >
          Add Integration
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Events</th>
              <th className="px-4 py-3">Last delivery</th>
              <th className="px-4 py-3">Enabled</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                <td className="max-w-[280px] truncate px-4 py-3 font-medium">{ep.url}</td>
                <td className="px-4 py-3 text-muted-foreground">{ep.events.join(', ')}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[ep.latestStatus ?? ''] ?? 'bg-muted-foreground/30'}`} />
                    {ep.latestStatus ?? 'none'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Switch checked={ep.enabled} disabled={pending} onCheckedChange={(v) => toggle(ep, v)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setDeleteTarget(ep)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {endpoints.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No endpoints yet. Add one to receive call.completed and alert.fired events.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create dialog (also shows the reveal-once secret after creation) */}
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add webhook endpoint</DialogTitle>
          </DialogHeader>
          {newSecret === null ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="ep-url">Endpoint URL (https)</Label>
                <Input id="ep-url" placeholder="https://example.com/hooks/voiceflow" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Events to send</Label>
                {EVENT_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={events.includes(t)}
                      onChange={(e) => setEvents(e.target.checked ? [...events, t] : events.filter((x) => x !== t))}
                    />
                    <span className="font-mono text-muted-foreground">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                Copy your signing secret now — it&apos;s shown once. Verify deliveries with the{' '}
                <code className="rounded bg-muted px-1">voiceflow-signature</code> header.
              </p>
              <code className="block break-all rounded-md border bg-muted px-3 py-2 text-xs">{newSecret}</code>
            </div>
          )}
          <DialogFooter>
            {newSecret === null ? (
              <>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button onClick={create} disabled={pending}>
                  {pending ? 'Adding…' : 'Add endpoint'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setOpen(false)}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this endpoint?</DialogTitle>
          </DialogHeader>
          <p className="break-all text-sm text-muted-foreground">{deleteTarget?.url}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              {pending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function CrmTab({
  crm,
  isOwner,
  flash,
}: {
  crm: CrmRow[]
  isOwner: boolean
  flash?: { connected?: string; error?: string }
}) {
  const [pending, startTransition] = useTransition()

  function disconnect(row: CrmRow) {
    if (!confirm(`Disconnect ${row.name}? Calls will stop syncing until you reconnect.`)) return
    startTransition(async () => {
      const res = await disconnectCrmAction(row.id)
      if (res?.error) toast.error(res.error)
      else toast.success(`${row.name} disconnected`)
    })
  }

  return (
    <div className="space-y-4">
      {/* The OAuth callback redirects back here with its verdict; without this
          the user lands on an unchanged page and cannot tell what happened. */}
      {flash?.connected && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
          Connected to {flash.connected}. New calls will sync from now on.
        </p>
      )}
      {flash?.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          Could not connect: {flash.error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {crm.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl border bg-card p-5">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                {c.name}
                {c.status === 'active' && (
                  <span className="inline-block size-2 rounded-full bg-emerald-500" aria-label="connected" />
                )}
                {c.status === 'revoked' && (
                  <span className="inline-block size-2 rounded-full bg-amber-500" aria-label="needs reconnecting" />
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{CRM_DESC[c.id]}</p>
              {/* A revoked connection is an ordinary end state (a Pipedrive
                  refresh token unused for 60 days does it), so it explains
                  itself rather than just going quiet. */}
              {c.status === 'revoked' && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                  Disconnected by the provider — reconnect to resume syncing.
                  {c.statusDetail ? ` (${c.statusDetail.slice(0, 120)})` : ''}
                </p>
              )}
              {!c.configured && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Not available on this deployment — no {c.name} app credentials are configured.
                </p>
              )}
            </div>

            <div className="shrink-0">
              {!c.configured ? (
                <Button variant="outline" size="sm" disabled>
                  Unavailable
                </Button>
              ) : c.status === 'active' ? (
                <Button variant="outline" size="sm" disabled={!isOwner || pending} onClick={() => disconnect(c)}>
                  Disconnect
                </Button>
              ) : (
                // A link, not an action: OAuth needs a top-level navigation to
                // the provider, which fetch() from a server action cannot do.
                <a
                  href={isOwner ? `/api/integrations/crm/${c.id}/connect` : undefined}
                  aria-disabled={!isOwner}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    !isOwner && 'pointer-events-none opacity-50'
                  )}
                >
                  {c.status === 'revoked' ? 'Reconnect' : 'Connect'}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isOwner && (
        <p className="text-xs text-muted-foreground">
          Only the workspace owner can connect or disconnect a CRM.
        </p>
      )}
    </div>
  )
}
