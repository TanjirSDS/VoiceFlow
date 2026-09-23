import { serviceClient } from '@voiceflow/db'
import { makeEngine } from '../../../lib/engine'
import { appProbes, runHealthChecks } from '../../../lib/health'
import { stripeClient } from '../../../lib/stripe'

export const dynamic = 'force-dynamic'

// DB + Stripe + ElevenLabs reachability. 503 when anything is down so uptime
// monitors and load balancers see it. Public route → booleans only; failure
// details go to provider_status/Sentry via the status-poll job instead.
export async function GET(req: Request) {
  const probes: Record<string, () => Promise<void>> = appProbes(serviceClient(), stripeClient(), makeEngine())
  // ?scope=db is Railway's deploy healthcheck (railway.json): this instance +
  // PostgREST + Postgres only — a provider outage must not block deploying a fix.
  const scoped = new URL(req.url).searchParams.get('scope') === 'db' ? { db: probes.db } : probes
  const { ok, checks } = await runHealthChecks(scoped)
  return Response.json(
    { ok, checks: Object.fromEntries(Object.entries(checks).map(([name, c]) => [name, c.ok])) },
    { status: ok ? 200 : 503 }
  )
}
