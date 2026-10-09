'use client'

import { useState, useTransition } from 'react'
import { callNumberAction } from '../app/agents/actions'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Label } from './ui/label'

/** Test panel: the agent calls a real phone from its own number (an outbound call). */
export function CallNumberForm({ agentId }: { agentId: string }) {
  const [to, setTo] = useState('')
  const [consent, setConsent] = useState(false)
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ error?: string; message?: string } | null>(null)
  return (
    <form
      className="space-y-2 rounded-lg border p-3"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => setResult(await callNumberAction(agentId, to, consent)))
      }}
    >
      <Label htmlFor="call-to" className="block">
        Call a number
      </Label>
      <p className="text-xs text-muted-foreground">
        The agent rings this phone from its own number, as an outbound call.
      </p>
      <div className="flex gap-2">
        <Input
          id="call-to"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+14155550123"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Button type="submit" disabled={pending || !to.trim() || !consent}>
          {pending ? 'Calling…' : 'Call'}
        </Button>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
        This person agreed to be called.
      </label>
      {result && (
        <p role="status" className={`text-xs ${result.error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {result.error ?? result.message}
        </p>
      )}
    </form>
  )
}
