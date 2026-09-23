import Link from 'next/link'
import { ApiKeysManager, type ApiKeyRow } from '../../components/api-keys-manager'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { IntegrationsManager, type EndpointRow } from '../../components/integrations-manager'
import { activeOrg } from '../../lib/org'
import { cn } from '../../lib/utils'
import { userClient } from '../../lib/db'

export const dynamic = 'force-dynamic'

const TABS = [
  { id: 'connected', label: 'Connected' },
  { id: 'available', label: 'Available' },
  { id: 'api', label: 'API keys' },
] as const

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const active = tab === 'available' || tab === 'api' ? tab : 'connected'
  const db = await userClient()

  const [org, { data: orgRow }, { data: endpointRows }, { data: deliveries }, apiKeys] = await Promise.all([
    activeOrg(),
    // secret is never selected here — reveal-once at creation only.
    db.from('orgs').select('calcom_api_key, calcom_event_type_id, integration_interest').maybeSingle(),
    db.from('webhook_endpoints').select('id, url, events, enabled, created_at').order('created_at', { ascending: false }),
    db.from('webhook_deliveries').select('endpoint_id, status, created_at').order('created_at', { ascending: false }).limit(200),
    // key_hash is not selectable by members (0020 revokes the column), so this
    // cannot accidentally pull a digest into the page payload.
    active === 'api'
      ? db
          .from('api_keys')
          .select('id, name, prefix, last_used_at, revoked_at, created_by, created_at')
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as Record<string, any>[] }),
  ])

  // Latest delivery status per endpoint → the status dot.
  const latestStatus: Record<string, string> = {}
  for (const d of deliveries ?? []) if (!(d.endpoint_id in latestStatus)) latestStatus[d.endpoint_id] = d.status

  const endpoints: EndpointRow[] = (endpointRows ?? []).map((e) => ({
    id: e.id,
    url: e.url,
    events: Array.isArray(e.events) ? e.events : [],
    enabled: e.enabled,
    createdAt: e.created_at,
    latestStatus: latestStatus[e.id] ?? null,
  }))

  const keys: ApiKeyRow[] = (apiKeys.data ?? []).map((k: Record<string, any>) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    lastUsedAt: k.last_used_at,
    revokedAt: k.revoked_at,
    createdBy: k.created_by,
    createdAt: k.created_at,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your calendar and CRM, and forward call &amp; alert events to your own systems.
        </p>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/integrations?tab=${t.id}`}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              active === t.id
                ? 'border-brand text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {active === 'api' ? (
        org?.plan.apiEnabled ? (
          <ApiKeysManager keys={keys} isOwner={org?.role === 'owner'} />
        ) : (
          <ApiUpsell />
        )
      ) : (
        <IntegrationsManager
          tab={active}
          isOwner={org?.role === 'owner'}
          calcom={{
            connected: !!orgRow?.calcom_api_key && !!orgRow?.calcom_event_type_id,
            eventTypeId: orgRow?.calcom_event_type_id ?? null,
          }}
          endpoints={endpoints}
          interest={Array.isArray(orgRow?.integration_interest) ? orgRow.integration_interest : []}
        />
      )}
    </div>
  )
}

/** Shown to Starter/Growth workspaces. Mirrors the /knowledge and /qa upsells;
 *  createApiKeyAction re-checks the plan, so this is UX, not the gate. */
function ApiUpsell() {
  return (
    <div className="mx-auto max-w-xl">
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-4 bg-brand-soft px-8 py-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-brand">
            <KeyIcon className="h-7 w-7" />
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand">Pro feature</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Build on the VoiceFlow API</h2>
          </div>
        </div>
        <CardContent className="space-y-5 p-8 text-sm text-muted-foreground">
          <p>
            Read your agents, calls and usage from your own systems, and place outbound calls
            programmatically. Authenticate with a workspace API key over{' '}
            <code className="rounded bg-muted px-1">/api/v1</code>. Available on the Pro plan.
          </p>
          <Link href="/billing" className="block">
            <Button size="lg" className="w-full">
              Upgrade plan
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9M18 12v3M15.5 12v2" strokeLinecap="round" />
    </svg>
  )
}
