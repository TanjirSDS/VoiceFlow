import Link from 'next/link'
import { headers } from 'next/headers'
import { MagicLinkForm } from '../../components/magic-link-form'
import { PasswordForm } from '../../components/password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { pageBranding } from '../../lib/branding'

// Password (accounts made from an invite) or magic link. Login never creates
// users — new businesses go through /signup, team members through /invite.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // ?error=<CODE> from Better Auth when a link is invalid, expired or already used.
  const { error: code } = await searchParams
  // Resolved from the Host header, not a session — a reseller's customer reaches
  // this page signed out, so the vanity domain is the only thing that can say
  // whose product it is. Without it the sign-in page is where white-labelling
  // visibly fails.
  const branding = await pageBranding((await headers()).get('host'))
  const error = code ? 'That sign-in link is invalid or has expired — request a new one.' : undefined
  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-7">
        <CardHeader className="p-0">
          <CardTitle className="text-xl">Sign in to {branding.productName}</CardTitle>
          <CardDescription>Use the password you set from your invite, or get a magic link.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <PasswordForm />
          <p className="my-5 text-center text-xs uppercase tracking-wide text-muted-foreground">or email me a link</p>
          <MagicLinkForm mode="login" initialError={error} />
          <p className="mt-5 text-sm text-muted-foreground">
            New to {branding.productName}?{' '}
            <Link href="/signup" className="font-medium text-brand hover:text-brand-strong">
              Start your free setup →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
