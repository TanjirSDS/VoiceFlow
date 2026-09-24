import { headers } from 'next/headers'
import { serviceClient } from '@voiceflow/db'
import { ALLOWED_LOGO_TYPES, type LogoType } from '../../../../lib/brand-logo'
import { resolveBrandingForHost } from '../../../../lib/branding'
import { recordingStore } from '../../../../lib/object-store'
import { activeOrg } from '../../../../lib/org'

export const dynamic = 'force-dynamic'

/**
 * Serves the current tenant's logo from OUR origin.
 *
 * Why a proxy rather than a URL in the database: the app's CSP is
 * `img-src 'self'`, and widening it to https: — so one reseller can host a PNG
 * on their own CDN — would let every page load an image from anywhere, which is
 * a tracking and exfiltration surface for every tenant, not just the one who
 * wanted the convenience. It also means the logo cannot vanish because someone
 * else's bucket went private.
 *
 * THERE IS NO ORG ID IN THIS URL, ON PURPOSE. The org is resolved from the
 * session or the vanity host, exactly as the page around it is, so the request
 * cannot be pointed at another tenant's logo by editing a query string. That
 * also makes one URL correct for every tenant, which is why the caching below
 * has to be right.
 */
export async function GET() {
  const host = (await headers()).get('host')

  // Same precedence as pageBranding(): the vanity host wins, because a signed-
  // out visitor on a reseller's domain must still see their mark.
  const byHost = await resolveBrandingForHost(host)
  let orgId: string | null = byHost?.orgId ?? null
  if (!orgId) {
    const org = await activeOrg()
    orgId = org?.orgId ?? null
    // A sub-org with no logo of its own inherits its parent's, matching the
    // field-by-field chain in lib/branding — otherwise the wordmark and the
    // logo could disagree about whose product this is.
    if (org && orgId) {
      const own = await logoRow(orgId)
      if (!own && org.parentOrgId) orgId = org.parentOrgId
    }
  }
  if (!orgId) return new Response('not found', { status: 404 })

  const row = await logoRow(orgId)
  if (!row) return new Response('not found', { status: 404 })

  const store = recordingStore()
  // No object store configured (local dev): the wordmark fallback in BrandMark
  // is already correct, so answer 404 rather than erroring the page's <img>.
  if (!store) return new Response('not found', { status: 404 })

  const signed = await store.signedUrl(row.logo_key, 60)
  if (!signed) return new Response('not found', { status: 404 })
  const upstream = await fetch(signed)
  if (!upstream.ok) return new Response('not found', { status: 404 })

  // Never echo the stored content type straight back: it is a column a tenant
  // can write. Compare it against the allow-list and fall back to PNG, so a row
  // edited to text/html cannot turn this route into an HTML server on our own
  // origin. (nosniff is already set globally in next.config.mjs.)
  const declared = row.logo_content_type as LogoType | null
  const contentType =
    declared && (ALLOWED_LOGO_TYPES as readonly string[]).includes(declared) ? declared : 'image/png'

  return new Response(upstream.body, {
    headers: {
      'content-type': contentType,
      'content-disposition': 'inline',
      // PRIVATE, not public. This URL is identical for every tenant, so a
      // shared cache keyed on the path alone would serve one agency's logo to
      // another's customers — the same failure the Phase 24 wrapper's no-store
      // header exists to prevent. `private` confines it to the one browser, and
      // Vary: Cookie re-keys it when someone switches workspace.
      'cache-control': 'private, max-age=300',
      vary: 'Cookie',
    },
  })
}

async function logoRow(orgId: string) {
  // service_role: this runs for signed-out visitors on a vanity host, where
  // there is no session for RLS to scope by. It reads two columns of one row,
  // both of which are public-by-intent — the logo is shown to anyone who opens
  // the page.
  const { data } = await serviceClient()
    .from('org_branding')
    .select('logo_key, logo_content_type')
    .eq('org_id', orgId)
    .maybeSingle()
  const row = data as { logo_key: string | null; logo_content_type: string | null } | null
  return row?.logo_key ? { logo_key: row.logo_key, logo_content_type: row.logo_content_type } : null
}
