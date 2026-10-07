'use client'

import { useActionState, useTransition, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { acceptAsExistingUserAction, acceptInviteAction } from '../actions'

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const [state, formAction, pending] = useActionState(acceptInviteAction, null)
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        {/* Display only: the server takes the email from the invite, never the form. */}
        <Input id="email" type="email" value={email} readOnly disabled autoComplete="username" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required maxLength={80} autoComplete="name" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">At least 12 characters.</p>
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={12} maxLength={128} autoComplete="new-password" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Joining…' : 'Create account and join'}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  )
}

export function JoinButton({ token }: { token: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string>()
  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        disabled={pending}
        onClick={() => start(async () => setError((await acceptAsExistingUserAction(token))?.error))}
      >
        {pending ? 'Joining…' : 'Join workspace'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
