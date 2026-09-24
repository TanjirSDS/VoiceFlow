import Link from 'next/link'
import { BrandingEditor } from '../../../components/branding-editor'
import { SubOrgSettings } from '../../../components/sub-org-settings'
import { Card, CardContent } from '../../../components/ui/card'
import { currentPeriodStart } from '../../../lib/agency-db'
import { brandingFor } from '../../../lib/branding'
import { userClient } from '../../../lib/db'
import { recordingStore } from '../../../lib/object-store'
import { platformFromAddress } from '../../../lib/email'
import { loadSubOrg } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * One client workspace.
 *
 * loadSubOrg() is the gate and it 404s for any org that is not a child of the
 * caller's — so a guessed or copied id from another agency's console cannot
 * render this page, and the refusal looks the same as a workspace that does not
 * exist.
 */
export default async function SubOrgPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const { org, child } = await loadSubOrg(orgId)
  const db = await userClient()
  const period = currentPeriodStart()

  const [{ data: ownRow }, usageRes, agencyBranding] = await Promise.all([
    db
      .from('org_branding')
      .select('product_name, brand_color, support_email, custom_domain, email_sender_verified, logo_key')
      .eq('org_id', orgId)
      .maybeSingle(),
    db
      .from('usage_periods')
      .select('minutes_used')
      .eq('org_id', orgId)
      .eq('period_start', period)
      .maybeSingle(),
    brandingFor(db, org.orgId, null),
  ])
  const row = ownRow as {
    product_name: string | null
    brand_color: string | null
    support_email: string | null
    custom_domain: string | null
    email_sender_verified: boolean
    logo_key: string | null
  } | null
  const minutesUsed = (usageRes.data as { minutes_used: number } | null)?.minutes_used ?? 0

  return (
    <div className="space-y-8">
      <div>
        <Link href="/agency" className="text-sm text-muted-foreground hover:text-foreground">
          ← Agency
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">{child.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Client workspace · {Math.round(minutesUsed).toLocaleString()} of{' '}
          {child.minutes_cap.toLocaleString()} minutes this month
        </p>
      </div>

      <SubOrgSettings
        orgId={child.id}
        name={child.name}
        minutesCap={child.minutes_cap}
        maxMinutesCap={org.minutesCap}
      />

      <Card>
        <CardContent className="space-y-1 p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Billing</p>
          <p>
            This client has no subscription and is never charged by us. Their minutes draw on your
            pooled allowance and appear on your own invoice.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Branding for this client</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Leave a field blank and it inherits from your agency branding. Use this when one client
            needs their own name or colour.
          </p>
        </div>
        <BrandingEditor
          scopeLabel={child.name}
          targetOrgId={child.id}
          inheritedFrom={agencyBranding.productName}
          initial={{
            productName: row?.product_name ?? '',
            brandColor: row?.brand_color ?? '',
            supportEmail: row?.support_email ?? '',
            customDomain: row?.custom_domain ?? '',
          }}
          senderVerified={row?.email_sender_verified ?? false}
          platformFromAddress={platformFromAddress()}
          hasLogo={Boolean(row?.logo_key)}
          logoStorage={recordingStore() !== null}
        />
      </div>
    </div>
  )
}
