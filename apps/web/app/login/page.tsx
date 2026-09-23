import Link from 'next/link'
import { MagicLinkForm } from '../../components/magic-link-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

// Magic-link only. Login never creates users (the action checks the email
// exists first) — new businesses go through /signup.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // ?error=<CODE> from Better Auth when a link is invalid, expired or already used.
  const { error: code } = await searchParams
  const error = code ? 'That sign-in link is invalid or has expired — request a new one.' : undefined
  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-7">
        <CardHeader className="p-0">
          <CardTitle className="text-xl">Sign in to VoiceFlow</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a magic link.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <MagicLinkForm mode="login" initialError={error} />
          <p className="mt-5 text-sm text-muted-foreground">
            New to VoiceFlow?{' '}
            <Link href="/signup" className="font-medium text-brand hover:text-brand-strong">
              Start your free setup →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
