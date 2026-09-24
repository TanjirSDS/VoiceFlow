'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createApiKeyAction, revokeApiKeyAction } from '../app/integrations/actions'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

export interface ApiKeyRow {
  id: string
  name: string
  prefix: string
  lastUsedAt: string | null
  revokedAt: string | null
  createdBy: string | null
  createdAt: string
}

const fmt = (iso: string | null) => (iso ? iso.slice(0, 10) : '—')

export function ApiKeysManager({ keys, isOwner }: { keys: ApiKeyRow[]; isOwner: boolean }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  // Non-null only between creation and closing the dialog: the key is never
  // re-fetchable, so this is the single moment it exists in the browser.
  const [newKey, setNewKey] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRow | null>(null)
  const [pending, start] = useTransition()

  const active = keys.filter((k) => !k.revokedAt)

  function create() {
    start(async () => {
      const res = await createApiKeyAction({ name })
      if (res.error) {
        toast.error(res.error)
        return
      }
      setNewKey(res.key ?? '')
      setName('')
    })
  }

  function confirmRevoke() {
    const target = revokeTarget
    if (!target) return
    start(async () => {
      const res = await revokeApiKeyAction(target.id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      setRevokeTarget(null)
      toast.success(`${target.name} revoked`)
    })
  }

  function closeCreate() {
    setOpen(false)
    setNewKey(null)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">API keys</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Authenticate requests to the VoiceFlow API with{' '}
            <code className="rounded bg-muted px-1">Authorization: Bearer &lt;key&gt;</code>. Keys
            are scoped to this workspace.
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setOpen(true)} className="shrink-0">
            Create key
          </Button>
        )}
      </div>

      {!isOwner && (
        <p className="text-sm text-muted-foreground">
          Only the workspace owner can create or revoke API keys.
        </p>
      )}

      {keys.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No API keys yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Key</th>
                <th className="px-4 py-2 font-medium">Last used</th>
                <th className="px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5">
                    <span className={k.revokedAt ? 'text-muted-foreground line-through' : ''}>{k.name}</span>
                    {k.revokedAt && (
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        revoked {fmt(k.revokedAt)}
                      </span>
                    )}
                  </td>
                  {/* Only the display prefix is stored in the clear; the rest of
                      the key exists nowhere after creation. */}
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{k.prefix}…</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fmt(k.lastUsedAt)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {fmt(k.createdAt)}
                    {k.createdBy && <span className="ml-1 text-xs">by {k.createdBy}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {isOwner && !k.revokedAt && (
                      <Button variant="ghost" size="sm" onClick={() => setRevokeTarget(k)}>
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create dialog — also the one and only showing of the key itself. */}
      <Dialog open={open} onOpenChange={(o) => !o && closeCreate()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newKey === null ? 'Create API key' : 'Copy your API key'}</DialogTitle>
          </DialogHeader>
          {newKey === null ? (
            <div className="space-y-1">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="CI pipeline"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="pt-1 text-xs text-muted-foreground">
                A label so you can tell your keys apart when revoking one.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                Copy this key now — it is shown once and cannot be retrieved again. We store only a
                hash of it.
              </p>
              <code className="block break-all rounded-md border bg-muted px-3 py-2 text-xs">{newKey}</code>
            </div>
          )}
          <DialogFooter>
            {newKey === null ? (
              <>
                <Button variant="outline" onClick={closeCreate} disabled={pending}>
                  Cancel
                </Button>
                <Button onClick={create} disabled={pending}>
                  {pending ? 'Creating…' : 'Create key'}
                </Button>
              </>
            ) : (
              <Button onClick={closeCreate}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm */}
      <Dialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke this key?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{revokeTarget?.name}</span> (
            <span className="font-mono text-xs">{revokeTarget?.prefix}…</span>) stops working
            immediately. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRevoke} disabled={pending}>
              {pending ? 'Revoking…' : 'Revoke key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {active.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Base URL <code className="rounded bg-muted px-1">/api/v1</code> — agents, calls and usage
          reads, plus outbound-call create.
        </p>
      )}
    </section>
  )
}
