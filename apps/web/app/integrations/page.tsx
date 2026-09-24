import Link from 'next/link'
import { IntegrationsManager, type CrmRow, type EndpointRow } from '../../components/integrations-manager'
import { configuredProviders, OAUTH_SPECS } from '../../lib/crm/oauth'
import { CRM_PROVIDERS } from '../../lib/crm/types'
import { activeOrg } from '../../lib/org'
import { cn } from '../../lib/utils'
import { userClient } from '../../lib/db'

export const dynamic = 'force-dynamic'

const TABS = [
  { id: 'connected', label: 'Connected' },
  { id: 'available', label: 'Available' },
] as const

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; crm_connected?: string; crm_error?: string }>
}) {
  const { tab, crm_connected, crm_error } = await searchParams
  const active = tab === 'available' ? 'available' : 'connected'
  const db = await userClient()

  const [org, { data: orgRow }, { data: endpointRows }, { data: deliveries }] = await Promise.all([
    activeOrg(),
    // secret is never selected here — reveal-once at creation only.
    db.from('orgs').select('calcom_api_key, calcom_event_type_id').maybeSingle(),
    db.from('webhook_endpoints').select('id, url, events, enabled, created_at').order('created_at', { ascending: false }),
    db.from('webhook_deliveries').select('endpoint_id, status, created_at').order('created_at', { ascending: false }).limit(200),
  ])

  // The secret-free projection (migration 0021) — never org_crm_connections
  // itself, which holds the sealed tokens and is service-role only.
  const { data: crmRows } = await db
    .from('org_crm_connection_status')
    .select('provider, status, status_detail, updated_at')

  // Which providers this deployment can actually offer: a card with no client
  // id behind it is a Connect button that leads to a broken consent screen.
  const available = new Set(configuredProviders())
  const crm: CrmRow[] = CRM_PROVIDERS.map((id) => {
    const row = (crmRows ?? []).find((r) => r.provider === id)
    return {
      id,
      name: OAUTH_SPECS[id].label,
      configured: available.has(id),
      status: (row?.status as 'active' | 'revoked' | undefined) ?? null,
      statusDetail: row?.status_detail ?? null,
      updatedAt: row?.updated_at ?? null,
    }
  })

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

      <IntegrationsManager
        tab={active}
        isOwner={org?.role === 'owner'}
        calcom={{
          connected: !!orgRow?.calcom_api_key && !!orgRow?.calcom_event_type_id,
          eventTypeId: orgRow?.calcom_event_type_id ?? null,
        }}
        endpoints={endpoints}
        crm={crm}
        flash={{ connected: crm_connected, error: crm_error }}
      />
    </div>
  )
}
