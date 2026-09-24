'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateSubOrgAction } from '../app/agency/actions'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

/** Name and minute cap for one client workspace. */
export function SubOrgSettings({
  orgId,
  name,
  minutesCap,
  maxMinutesCap,
}: {
  orgId: string
  name: string
  minutesCap: number
  maxMinutesCap: number
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <Card>
      <CardContent className="p-5">
        <form
          action={(fd) =>
            start(async () => {
              setError(null)
              const res = await updateSubOrgAction(fd)
              if (res.error) {
                setError(res.error)
                return
              }
              toast.success('Saved')
            })
          }
          className="space-y-4"
        >
          <input type="hidden" name="orgId" value={orgId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Workspace name</Label>
              <Input id="name" name="name" defaultValue={name} maxLength={80} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minutesCap">Monthly minute cap</Label>
              <Input
                id="minutesCap"
                name="minutesCap"
                type="number"
                min={1}
                max={maxMinutesCap}
                defaultValue={minutesCap}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            At the cap this client&apos;s agents pause and stop answering, which is what keeps one
            client from spending your whole pool. Raising it takes effect immediately.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
