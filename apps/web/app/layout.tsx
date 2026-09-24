import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Manrope, Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppShell } from '../components/app-shell'
import { BrandLockup } from '../components/brand-mark'
import { BrandingProvider } from '../components/branding-provider'
import { Waveform } from '../components/icons'
import { ThemeProvider } from '../components/theme-provider'
import { Toaster } from '../components/ui/sonner'
import { exitViewAsAction } from './admin/actions'
import { graceDaysLeft } from '../lib/billing-math'
import { PLATFORM_BRAND_COLOR, PLATFORM_TAGLINE, pageBranding, type Branding } from '../lib/branding'
import { paletteCss } from '../lib/brand-palette'
import { activeOrg, currentUsage, listMemberships } from '../lib/org'
import { userClient } from '../lib/db'
import { currentUser, getAuth } from '../lib/auth'
import './globals.css'

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  weight: ['500', '600', '700'],
  display: 'swap',
})
const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

// Dynamic because the tab title is branding too: a sub-org whose dashboard says
// "VoiceFlow" in the browser tab is not white-labelled, however the page looks.
export async function generateMetadata(): Promise<Metadata> {
  const branding = await pageBranding((await headers()).get('host'))
  return { title: branding.productName, description: PLATFORM_TAGLINE }
}

async function signOut() {
  'use server'
  await getAuth().api.signOut({ headers: await headers() })
  redirect('/login')
}

// One shared strip style for every top-of-app alert.
function Banner({
  tone,
  children,
}: {
  tone: 'danger' | 'warn' | 'brand'
  children: ReactNode
}) {
  const tones = {
    danger: 'bg-danger-soft text-destructive',
    warn: 'bg-warn-soft text-warn',
    brand: 'bg-brand-soft text-brand',
  }
  return (
    <div className={`flex items-center justify-center gap-2 px-6 py-2 text-center text-sm font-medium ${tones[tone]}`}>
      {children}
    </div>
  )
}

async function DunningBanner() {
  const org = await activeOrg()
  if (!org?.paymentFailedAt) return null
  const left = graceDaysLeft(new Date(org.paymentFailedAt), new Date())
  return (
    <Banner tone="danger">
      {left > 0
        ? `Payment failed — update your payment method within ${left} day${left === 1 ? '' : 's'} or your agents will be paused.`
        : 'Payment failed — your agents are paused until payment succeeds.'}
      <Link href="/billing" className="underline underline-offset-2">
        Fix payment →
      </Link>
    </Banner>
  )
}

async function UsageBanner() {
  const org = await activeOrg()
  if (!org) return null
  const usage = await currentUsage(org.orgId)
  if (!usage || usage.minutes_used < usage.minutes_cap * 0.8) return null

  const over = usage.minutes_used >= usage.minutes_cap
  const text = !over
    ? `Heads up: ${Math.round(usage.minutes_used)} of ${usage.minutes_cap} minutes used this month.`
    : org.overagePolicy === 'pause'
      ? 'Minute cap reached — your agents are paused until next month or a plan upgrade.'
      : `Minute cap reached — overage billing active (${Math.round(usage.overage_minutes)} overage minutes so far).`
  return <Banner tone={over ? 'danger' : 'warn'}>{text}</Banner>
}

const PROVIDER_LABELS: Record<string, string> = {
  db: 'the dashboard database',
  stripe: 'billing (Stripe)',
  elevenlabs: 'the voice service (ElevenLabs)',
  elevenlabs_status: 'the voice service (ElevenLabs)',
  twilio_status: 'the phone network (Twilio)',
}

async function IncidentBanner() {
  const org = await activeOrg()
  if (!org) return null
  const db = await userClient()
  const cutoff = new Date(Date.now() - 3_600_000).toISOString()
  const { data } = await db
    .from('provider_status')
    .select('provider')
    .eq('ok', false)
    .gte('checked_at', cutoff)
  if (!data?.length) return null
  const names = [...new Set(data.map((r) => PROVIDER_LABELS[r.provider] ?? r.provider))]
  return (
    <Banner tone="warn">
      Service disruption affecting {names.join(' and ')} — calls or billing may be delayed while we
      recover.
    </Banner>
  )
}

async function AdminViewBanner() {
  const jar = await cookies()
  if (!jar.get('admin-view-org')) return null
  const org = await activeOrg()
  if (org?.role !== 'admin') return null
  return (
    <div className="flex items-center justify-center gap-3 bg-foreground px-6 py-2 text-center text-sm font-medium text-background">
      Admin view: {org.name}
      <form action={exitViewAsAction}>
        <button type="submit" className="underline underline-offset-2">
          Exit
        </button>
      </form>
    </div>
  )
}

function Banners() {
  return (
    <>
      <AdminViewBanner />
      <IncidentBanner />
      <DunningBanner />
      <UsageBanner />
    </>
  )
}

/**
 * The tenant palette, as a <style> element.
 *
 * Placed in <body> deliberately. React only hoists a <style> into <head> when it
 * carries a `precedence` prop; without one it renders where it sits, which puts
 * it after the stylesheet <link> in document order. That matters because
 * Tailwind v4 compiles `@theme` into `:root` and globals.css redefines the same
 * names under `.dark` — `:root` and `.dark` have EQUAL specificity, so the
 * cascade is decided by order alone. Anywhere earlier and the tenant's colours
 * would lose to the defaults they are meant to replace.
 *
 * Emitted only when the org actually has a colour: an unbranded customer's HTML
 * stays byte-identical to what it was before this phase.
 *
 * The content is safe by construction, not by escaping — paletteCss() emits only
 * values that came out of its own hex formatter, and the colour reaching it was
 * validated against /^#[0-9a-f]{6}$/i twice (on write, and again on read in
 * lib/branding.ts). There is no path by which a tenant string reaches this tag.
 */
function BrandPaletteStyle({ branding }: { branding: Branding }) {
  if (branding.brandColor === PLATFORM_BRAND_COLOR) return null
  return <style dangerouslySetInnerHTML={{ __html: paletteCss(branding.palette) }} />
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const org = await activeOrg()
  const branding = await pageBranding((await headers()).get('host'))

  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">
        <BrandPaletteStyle branding={branding} />
        <BrandingProvider productName={branding.productName}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {org ? (
            <AppShell data={await shellData(org, branding)} banner={<Banners />} signOut={signOut}>
              {children}
            </AppShell>
          ) : (
            // Signed-out (login / signup): a clean centered brand canvas.
            <div className="flex min-h-screen flex-col">
              <div className="flex items-center gap-3 px-6 py-5">
                <BrandLockup
                  productName={branding.productName}
                  logoUrl={branding.logoUrl}
                  whiteLabelled={branding.whiteLabelled}
                />
                <Waveform className="ml-1 text-live" bars={4} />
              </div>
              <main className="flex flex-1 items-center justify-center px-6 pb-24">
                <div className="w-full">{children}</div>
              </main>
            </div>
          )}
          <Toaster />
        </ThemeProvider>
        </BrandingProvider>
      </body>
    </html>
  )
}

// Assemble everything the sidebar shell needs in one place.
async function shellData(
  org: NonNullable<Awaited<ReturnType<typeof activeOrg>>>,
  branding: Branding
) {
  const [usage, memberships, jar, user] = await Promise.all([
    currentUsage(org.orgId),
    listMemberships(),
    cookies(),
    currentUser(),
  ])
  const now = new Date()
  return {
    activeOrgId: org.orgId,
    orgName: org.name,
    planName: org.plan.name,
    role: org.role,
    productName: branding.productName,
    logoUrl: branding.logoUrl,
    whiteLabelled: branding.whiteLabelled,
    // The Agency nav item only exists for an org that can actually resell, and
    // never for a sub-org — a white-labelled client seeing "Agency" in the
    // sidebar is the tier leaking through the label it is sold to hide.
    showAgency: org.plan.agencyEnabled && org.parentOrgId === null,
    isSubOrg: org.parentOrgId !== null,
    memberships,
    userEmail: user?.email ?? null,
    initialCollapsed: jar.get('sidebar-collapsed')?.value === '1',
    usage: {
      minutesUsed: usage?.minutes_used ?? 0,
      minutesCap: usage?.minutes_cap ?? org.minutesCap,
      overageMinutes: usage?.overage_minutes ?? 0,
      overagePolicy: org.overagePolicy,
      planName: org.plan.name,
      periodLabel: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    },
  }
}
