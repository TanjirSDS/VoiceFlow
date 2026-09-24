import Link from 'next/link'
import { BrandingEditor } from '../../../components/branding-editor'
import { PLATFORM_PRODUCT_NAME } from '../../../lib/branding'
import { userClient } from '../../../lib/db'
import { recordingStore } from '../../../lib/object-store'
import { platformFromAddress } from '../../../lib/email'
import { requireResellerRead } from '../actions'

export const dynamic = 'force-dynamic'

/** The agency's OWN branding — inherited by every client that has none of its own. */
export default async function AgencyBrandingPage() {
  const org = await requireResellerRead()
  const db = await userClient()

  const { data } = await db
    .from('org_branding')
    .select('product_name, brand_color, support_email, custom_domain, email_sender_verified, logo_key')
    .eq('org_id', org.orgId)
    .maybeSingle()
  const row = data as {
    product_name: string | null
    brand_color: string | null
    support_email: string | null
    custom_domain: string | null
    email_sender_verified: boolean
    logo_key: string | null
  } | null

  return (
    <div className="space-y-6">
      <div>
        <Link href="/agency" className="text-sm text-muted-foreground hover:text-foreground">
          ← Agency
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">Your branding</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is what every client workspace shows unless you give it branding of its own. It
          replaces {PLATFORM_PRODUCT_NAME} on their screens and in their email.
        </p>
      </div>

      <BrandingEditor
        scopeLabel="your agency"
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
  )
}
