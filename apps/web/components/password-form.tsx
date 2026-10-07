'use client'

import { useActionState } from 'react'
import { signInPasswordAction } from '../app/auth/actions'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(signInPasswordAction, null)
  return (
    <form action={formAction} className="space-y-3">
      <Input type="email" name="email" required autoComplete="email" placeholder="you@business.com" />
      <Input type="password" name="password" required autoComplete="current-password" placeholder="Password" />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  )
}
