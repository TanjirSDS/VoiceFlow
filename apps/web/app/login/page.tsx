import Link from 'next/link'
import { headers } from 'next/headers'
import { MagicLinkForm } from '../../components/magic-link-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { pageBranding } from '../../lib/branding'

// Magic-link only. Login never creates users (the action checks the email
// exists first) — new businesses go through /signup.
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
          <CardDescription>Enter your email and we&apos;ll send you a magic link.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
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
