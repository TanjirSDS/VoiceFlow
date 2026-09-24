import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Text } from '@react-email/components'
import type { ReactElement, ReactNode } from 'react'

// All transactional emails in one file — they share one shell and are each a
// handful of lines. Sent via lib/email.ts (Resend renders the React tree).
// MagicLinkEmail is sent by Better Auth's magicLink plugin (lib/auth.ts).
//
// PHASE 27: every template now takes `brand`. An email is the one branded
// surface that leaves our control entirely — it sits in an inbox, gets
// forwarded, and is read months later by people who never open the app. A
// dashboard that says "Acme Voice" while its emails say "VoiceFlow" is not
// white-labelled, so the name is a required prop rather than an optional
// override: a new template cannot be written without deciding whose it is.

/** Everything a template needs to look like the tenant's own product. */
export interface EmailBrand {
  productName: string
  /** Links and headings. A literal hex — email clients have no CSS variables. */
  accent: string
  /** Where a recipient replies for help. The agency, never us, for a sub-org. */
  supportEmail: string | null
  appUrl: string
}

const body = { backgroundColor: '#f6f6f6', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }
const card = { backgroundColor: '#ffffff', borderRadius: 8, margin: '40px auto', padding: 32, maxWidth: 520 }
const muted = { color: '#666666', fontSize: 13 }

/**
 * The accent is used as link text on a WHITE card, which is exactly the pair
 * `palette.light.brandStrong` is derived and tested to hold above 4.5:1 — so
 * callers pass that, not the raw brand colour. Light palette only: dark-mode
 * email support is inconsistent enough across clients that a second set would
 * be guesswork, and a light card renders correctly everywhere.
 */
function Shell({ brand, preview, children }: { brand: EmailBrand; preview: string; children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={card}>
          {children}
          <Hr />
          <Text style={muted}>
            {brand.productName}
            {brand.supportEmail ? (
              <>
                {' — questions? '}
                <Link href={`mailto:${brand.supportEmail}`} style={{ color: brand.accent }}>
                  {brand.supportEmail}
                </Link>
              </>
            ) : null}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

/** Branded link, so no template hardcodes a colour. */
function A({ brand, href, children }: { brand: EmailBrand; href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ color: brand.accent }}>
      {children}
    </Link>
  )
}

export function MagicLinkEmail({ url, brand }: { url: string; brand: EmailBrand }): ReactElement {
  return (
    <Shell brand={brand} preview={`Your ${brand.productName} sign-in link`}>
      <Heading as="h2">Sign in to {brand.productName}</Heading>
      <Text>
        <A brand={brand} href={url}>
          Click here to sign in →
        </A>
      </Text>
      <Text>This link works once and expires in 15 minutes. If you didn&apos;t ask for it, ignore this email.</Text>
    </Shell>
  )
}

export function WelcomeEmail({ orgName, brand }: { orgName: string; brand: EmailBrand }): ReactElement {
  return (
    <Shell brand={brand} preview={`Your ${brand.productName} workspace is ready`}>
      <Heading as="h2">Welcome to {brand.productName}</Heading>
      <Text>
        Your workspace <strong>{orgName}</strong> is ready. Finish setup — pick a plan, create your
        agent, and get a phone number — and your AI receptionist starts answering calls today.
      </Text>
      <Text>
        <A brand={brand} href={`${brand.appUrl}/signup/plan`}>
          Continue setup →
        </A>
      </Text>
    </Shell>
  )
}

export function AlertEmail(props: {
  orgName: string
  alertName: string
  metricLabel: string
  operatorLabel: string
  value: number
  threshold: number
  brand: EmailBrand
}): ReactElement {
  const { brand } = props
  return (
    <Shell brand={brand} preview={`${brand.productName} alert: ${props.alertName}`}>
      <Heading as="h2">Alert: {props.alertName}</Heading>
      <Text>
        An alert on <strong>{props.orgName}</strong> just fired. {props.metricLabel} {props.operatorLabel}{' '}
        <strong>{props.threshold}</strong> — currently <strong>{Math.round(props.value * 100) / 100}</strong>.
      </Text>
      <Text>
        <A brand={brand} href={`${brand.appUrl}/alerts?tab=history`}>
          View alert history →
        </A>
      </Text>
    </Shell>
  )
}

export function UsageWarnEmail(props: {
  orgName: string
  minutesUsed: number
  capMinutes: number
  brand: EmailBrand
}): ReactElement {
  const { brand } = props
  return (
    <Shell brand={brand} preview={`You've used 80% of your ${brand.productName} minutes`}>
      <Heading as="h2">80% of your minutes used</Heading>
      <Text>
        <strong>{props.orgName}</strong> has used {Math.round(props.minutesUsed)} of its{' '}
        {props.capMinutes} included minutes this month. When the cap is reached your agents pause
        (or bill overage, per your settings).
      </Text>
      <Text>
        <A brand={brand} href={`${brand.appUrl}/billing`}>
          Review your plan →
        </A>
      </Text>
    </Shell>
  )
}

export function UsageCappedEmail(props: {
  orgName: string
  capMinutes: number
  policy: string
  brand: EmailBrand
}): ReactElement {
  const { brand } = props
  const paused = props.policy === 'pause'
  return (
    <Shell brand={brand} preview={`Your ${brand.productName} minute cap was reached`}>
      <Heading as="h2">Minute cap reached</Heading>
      <Text>
        <strong>{props.orgName}</strong> used all {props.capMinutes} included minutes this month.{' '}
        {paused
          ? 'Your agents are paused and stop answering calls until next month or a plan upgrade.'
          : 'Extra minutes now bill as overage at your plan rate.'}
      </Text>
      <Text>
        <A brand={brand} href={`${brand.appUrl}/billing`}>
          {paused ? 'Upgrade to resume →' : 'View usage →'}
        </A>
      </Text>
    </Shell>
  )
}

export function PaymentFailedEmail(props: {
  orgName: string
  graceDays: number
  brand: EmailBrand
}): ReactElement {
  const { brand } = props
  return (
    <Shell brand={brand} preview={`Action needed: ${brand.productName} payment failed`}>
      <Heading as="h2">Payment failed</Heading>
      <Text>
        We couldn&apos;t charge the card on file for <strong>{props.orgName}</strong>. Update your
        payment method within {props.graceDays} days or your agents will be paused.
      </Text>
      <Text>
        <A brand={brand} href={`${brand.appUrl}/billing`}>
          Fix payment →
        </A>
      </Text>
    </Shell>
  )
}

export interface WeeklySummaryProps {
  orgName: string
  calls: number
  minutes: number
  outcomes: { outcome: string; count: number }[]
  topQuestions: string[]
  brand: EmailBrand
}

export function WeeklySummaryEmail(p: WeeklySummaryProps): ReactElement {
  const { brand } = p
  return (
    <Shell brand={brand} preview={`${p.calls} calls, ${Math.round(p.minutes)} minutes this week`}>
      <Heading as="h2">Your week on {brand.productName}</Heading>
      <Text>
        <strong>{p.orgName}</strong> handled <strong>{p.calls}</strong> call{p.calls === 1 ? '' : 's'} (
        {Math.round(p.minutes)} minutes) in the last 7 days.
      </Text>
      {p.outcomes.length > 0 && (
        <>
          <Text style={{ marginBottom: 4 }}>
            <strong>Outcomes</strong>
          </Text>
          {p.outcomes.map((o) => (
            <Text key={o.outcome} style={{ margin: '2px 0' }}>
              {o.outcome.replace('_', ' ')}: {o.count}
            </Text>
          ))}
        </>
      )}
      {p.topQuestions.length > 0 && (
        <>
          <Text style={{ marginBottom: 4 }}>
            <strong>Callers asked about</strong>
          </Text>
          {p.topQuestions.map((q, i) => (
            <Text key={i} style={{ margin: '2px 0' }}>
              • {q}
            </Text>
          ))}
        </>
      )}
      <Text>
        <A brand={brand} href={`${brand.appUrl}/dashboard`}>
          Open your dashboard →
        </A>
      </Text>
    </Shell>
  )
}

export interface AgentLearningProps {
  orgName: string
  /** One entry per agent that got suggestions this week. */
  agents: { agentId: string; agentName: string; titles: string[] }[]
  totalSuggestions: number
  brand: EmailBrand
}

/** Phase 8: weekly "your agent learned" digest. Suggestions always start
 *  pending (there is no auto-apply), so the email lists them for review. */
export function AgentLearningEmail(p: AgentLearningProps): ReactElement {
  const { brand } = p
  return (
    <Shell brand={brand} preview={`${p.totalSuggestions} new suggestions from last week's calls`}>
      <Heading as="h2">
        Your agent learned {p.totalSuggestions} new thing{p.totalSuggestions === 1 ? '' : 's'} this week
      </Heading>
      <Text>
        From last week&apos;s calls for <strong>{p.orgName}</strong>, {brand.productName} drafted
        improvements to your agent{p.agents.length === 1 ? '' : 's'}. Nothing changes until you
        review and apply them.
      </Text>
      {p.agents.map((a) => (
        <div key={a.agentId}>
          <Text style={{ marginBottom: 4 }}>
            <strong>{a.agentName}</strong>
          </Text>
          {a.titles.slice(0, 5).map((t, i) => (
            <Text key={i} style={{ margin: '2px 0' }}>
              • {t}
            </Text>
          ))}
          <Text>
            <A brand={brand} href={`${brand.appUrl}/agents/${a.agentId}/learning`}>
              Review and apply →
            </A>
          </Text>
        </div>
      ))}
    </Shell>
  )
}
