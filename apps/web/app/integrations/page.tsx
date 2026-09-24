import Link from 'next/link'
import { ApiKeysManager, type ApiKeyRow } from '../../components/api-keys-manager'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { IntegrationsManager, type CrmRow, type EndpointRow } from '../../components/integrations-manager'
import { configuredProviders, OAUTH_SPECS } from '../../lib/crm/oauth'
import { CRM_PROVIDERS } from '../../lib/crm/types'
import { activeOrg } from '../../lib/org'
import { cn } from '../../lib/utils'
import { userClient } from '../../lib/db'
import { listApiKeys } from '../../lib/api-keys-db'

export const dynamic = 'force-dynamic'

const TABS = [
  { id: 'connected', label: 'Connected' },
  { id: 'available', label: 'Available' },
  { id: 'api', label: 'API keys' },
] as const

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; crm_connected?: string; crm_error?: string }>
}) {
  const { tab, crm_connected, crm_error } = await searchParams
  const active = tab === 'available' || tab === 'api' ? tab : 'connected'
  const db = await userClient()
  // Resolved first: the api_keys read below must be scoped to THIS workspace.
  // RLS only narrows to orgs the viewer is a member of, which is wider.
  const org = await activeOrg()

  const [{ data: orgRow }, { data: endpointRows }, { data: deliveries }, keys] = await Promise.all([
    // secret is never selected here — reveal-once at creation only.
    db.from('orgs').select('calcom_api_key, calcom_event_type_id').maybeSingle(),
    db.from('webhook_endpoints').select('id, url, events, enabled, created_at').order('created_at', { ascending: false }),
    db.from('webhook_deliveries').select('endpoint_id, status, created_at').order('created_at', { ascending: false }).limit(200),
    // Scoped to the active org by listApiKeys, not left to RLS. key_hash is not
    // selectable by members (0020 revokes the column) so no digest can reach the
    // page payload either way.
    active === 'api' && org ? listApiKeys(db, org.orgId) : Promise.resolve([]),
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

  const apiKeys: ApiKeyRow[] = keys.map((k) => ({
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
          <ApiKeysManager keys={apiKeys} isOwner={org?.role === 'owner'} />
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
          crm={crm}
          flash={{ connected: crm_connected, error: crm_error }}
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
