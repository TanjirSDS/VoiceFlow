import Link from 'next/link'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { currentUser } from '../../../lib/auth'
import { pageBranding } from '../../../lib/branding'
import { findInvite, INVITE_PROBLEM_TEXT } from '../../../lib/invites'
import { AcceptInviteForm, JoinButton } from './accept-form'

export const dynamic = 'force-dynamic'

// Public (middleware): the invitee arrives signed out. The token in the URL is
// the only credential; the page never reveals more than the invite's own email,
// role and workspace name.
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const [invite, user, branding] = await Promise.all([
    findInvite(token),
    currentUser(),
    (async () => pageBranding((await headers()).get('host')))(),
  ])

  let body: ReactNode
  if (!invite || invite.problem) {
    body = (
      <>
        <p className="text-sm text-destructive">{INVITE_PROBLEM_TEXT[invite?.problem ?? 'missing']}</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-brand hover:text-brand-strong">
          Go to sign in →
        </Link>
      </>
    )
  } else if (invite.hasAccount) {
    const signedInAsInvitee = user?.email.toLowerCase() === invite.email
    body = signedInAsInvitee ? (
      <JoinButton token={token} />
    ) : (
      <p className="text-sm">
        An account already exists for <strong>{invite.email}</strong>.{' '}
        {user ? `You are signed in as ${user.email}. Sign out, then sign` : 'Sign'} in as {invite.email} and open
        this link again to join.{' '}
        {!user && (
          <Link href="/login" className="font-medium text-brand hover:text-brand-strong">
            Sign in →
          </Link>
        )}
      </p>
    )
  } else {
    body = <AcceptInviteForm token={token} email={invite.email} />
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-7">
        <CardHeader className="p-0">
          <CardTitle className="text-xl">
            {invite && !invite.problem ? `Join ${invite.orgName}` : `${branding.productName} invite`}
          </CardTitle>
          {invite && !invite.problem && (
            <CardDescription>
              You&apos;ve been invited to {branding.productName} as {invite.role === 'admin' ? 'an' : 'a'}{' '}
              {invite.role}.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0 pt-6">{body}</CardContent>
      </Card>
    </div>
  )
}
