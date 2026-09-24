import { cache } from 'react'
import type { Db } from '@voiceflow/db'
import { serviceClient } from '@voiceflow/db'
import { derivePalette, isBrandColor, type BrandPalette } from './brand-palette'
import { PLATFORM_BRAND_COLOR, PLATFORM_PRODUCT_NAME } from './brand-constants'
import { userClient } from './db'
import { activeOrg } from './org'

/**
 * Phase 27 — who the product says it is, per org.
 *
 * Resolution is a chain, FIELD BY FIELD: this org's own row, then its parent's,
 * then the platform default. Per field rather than per row on purpose — a
 * reseller who renames one client's portal ("Acme Voice" → "Northside Dental
 * Line") must not thereby lose their own colour, logo and support address for
 * that client and fall all the way back to ours. Inheriting the row as a unit
 * would do exactly that, and the failure is invisible until a customer sees it.
 */

// Re-exported so server callers have a single import. The values live in a
// dependency-free module because client components need them too — see the
// note in lib/brand-constants.ts.
export { PLATFORM_BRAND_COLOR, PLATFORM_PRODUCT_NAME, PLATFORM_TAGLINE } from './brand-constants'

export interface Branding {
  /** The org this branding was resolved FOR (not necessarily where it came from). */
  orgId: string
  productName: string
  brandColor: string
  palette: BrandPalette
  /** Same-origin path, never a third-party URL — the CSP is img-src 'self'. */
  logoUrl: string | null
  supportEmail: string | null
  customDomain: string | null
  /** Envelope From, present ONLY when we have verified the sending domain. */
  emailFrom: string | null
  /**
   * False means this org is showing platform branding. The agency acceptance
   * criterion — "a sub-org sees zero VoiceFlow branding anywhere" — is this
   * flag being true for every sub-org, so it is computed rather than inferred
   * at each call site.
   */
  whiteLabelled: boolean
}

/** The unbranded product, used for signed-out pages and as the end of every chain. */
export function platformBranding(orgId = ''): Branding {
  return {
    orgId,
    productName: PLATFORM_PRODUCT_NAME,
    brandColor: PLATFORM_BRAND_COLOR,
    palette: derivePalette(PLATFORM_BRAND_COLOR)!,
    logoUrl: null,
    supportEmail: null,
    customDomain: null,
    emailFrom: null,
    whiteLabelled: false,
  }
}

/** The subset of org_branding this module reads. */
interface BrandingRow {
  org_id: string
  product_name: string | null
  logo_key: string | null
  brand_color: string | null
  custom_domain: string | null
  custom_domain_verified_at: string | null
  support_email: string | null
  email_from_address: string | null
  email_sender_verified: boolean
}

const BRANDING_COLUMNS =
  'org_id, product_name, logo_key, brand_color, custom_domain, custom_domain_verified_at, support_email, email_from_address, email_sender_verified'

/**
 * Fold the chain into one Branding. `rows` may contain the org's own row, its
 * parent's, both, or neither, in any order.
 */
function fold(orgId: string, parentOrgId: string | null, rows: BrandingRow[]): Branding {
  const own = rows.find((r) => r.org_id === orgId) ?? null
  const inherited = parentOrgId ? (rows.find((r) => r.org_id === parentOrgId) ?? null) : null

  // Only the nullable text columns inherit. An empty string falls through to the
  // parent exactly like a NULL does — "" is what a cleared form field posts, and
  // it means "I have not set this", not "I have set this to nothing".
  type TextKey = 'product_name' | 'logo_key' | 'brand_color' | 'support_email' | 'email_from_address'
  const pick = (k: TextKey): string | null => own?.[k] || inherited?.[k] || null

  const productName = pick('product_name')?.trim() || PLATFORM_PRODUCT_NAME

  // Validate on READ as well as on write. The column has a check constraint, but
  // this value is interpolated into a <style> block, and a value that arrived by
  // any path other than our own writer — a migration, a restored dump, a console
  // — must still be unable to reach the stylesheet. Anything that fails falls
  // back to the platform colour rather than rendering a page with no palette.
  const rawColor = pick('brand_color')
  const brandColor = isBrandColor(rawColor) ? rawColor : PLATFORM_BRAND_COLOR

  // The logo is served from OUR origin (see app/api/branding/logo/route.ts). The
  // stored value is an object key and is never placed in the URL — the route
  // resolves the key itself from the session or the host, so a key cannot be
  // swapped by editing a query string.
  const hasLogo = Boolean(pick('logo_key'))

  const fromAddress = own?.email_sender_verified
    ? own.email_from_address
    : inherited?.email_sender_verified
      ? inherited.email_from_address
      : null

  return {
    orgId,
    productName,
    brandColor,
    palette: derivePalette(brandColor) ?? derivePalette(PLATFORM_BRAND_COLOR)!,
    logoUrl: hasLogo ? '/api/branding/logo' : null,
    supportEmail: pick('support_email'),
    // A custom domain is never inherited: it names ONE host, and two orgs
    // cannot both answer on it. Only the org's own row can carry it — and only
    // once verified, because brandedAppUrl() turns this into the origin of
    // every link in that tenant's email.
    customDomain: own?.custom_domain_verified_at ? (own.custom_domain ?? null) : null,
    emailFrom: fromAddress,
    whiteLabelled: productName !== PLATFORM_PRODUCT_NAME || brandColor !== PLATFORM_BRAND_COLOR || hasLogo,
  }
}

/**
 * Branding for one org, given a client. Two indexed reads at most, and one when
 * the org has no parent.
 *
 * Never throws: branding wraps every page and every email, so a database hiccup
 * here must degrade to the platform look, not blank the app.
 */
export async function brandingFor(db: Db, orgId: string, parentOrgId: string | null): Promise<Branding> {
  const ids = parentOrgId ? [orgId, parentOrgId] : [orgId]
  try {
    const { data } = await db.from('org_branding').select(BRANDING_COLUMNS).in('org_id', ids)
    return fold(orgId, parentOrgId, (data ?? []) as BrandingRow[])
  } catch {
    return platformBranding(orgId)
  }
}

/**
 * Just the product name for an org, given a client that can read it.
 *
 * For callers that need the name and nothing else — the CRM sync writes it into
 * a customer's own records — so they do not have to resolve a whole palette or
 * reach through the email module to get one string.
 */
export async function productNameFor(db: Db, orgId: string): Promise<string> {
  try {
    const { data } = await db.from('orgs').select('parent_org_id').eq('id', orgId).maybeSingle()
    const parent = (data as { parent_org_id: string | null } | null)?.parent_org_id ?? null
    return (await brandingFor(db, orgId, parent)).productName
  } catch {
    return PLATFORM_PRODUCT_NAME
  }
}

/**
 * Branding for the signed-in user's active org, once per request.
 *
 * Signed out (login, signup) there is no org to resolve, so this returns the
 * platform look — a custom-domain visitor gets theirs from brandingForHost()
 * instead, which is the only resolution that can work before authentication.
 */
export const currentBranding = cache(async (): Promise<Branding> => {
  const org = await activeOrg()
  if (!org) return platformBranding()
  const db = await userClient()
  return brandingFor(db, org.orgId, org.parentOrgId)
})

/**
 * Branding for a request arriving on a vanity host, resolved BEFORE any session
 * exists — this is what makes an agency's sign-in page theirs.
 *
 * Service-role by necessity: there is no authenticated user yet, so RLS has
 * nothing to scope by. It reads org_branding keyed by an exact host match and
 * nothing else; a miss returns the platform look. The host comes from a header,
 * so it is untrusted input — which is why it is compared for equality against a
 * column and never interpolated into a query or a template.
 */
export async function resolveBrandingForHost(host: string | null): Promise<Branding | null> {
  const hostname = (host ?? '').split(':')[0].toLowerCase()
  if (!hostname || !/^[a-z0-9.-]+$/.test(hostname)) return null
  try {
    const svc = serviceClient()
    const { data } = await svc
      .from('org_branding')
      .select(BRANDING_COLUMNS)
      .eq('custom_domain', hostname)
      // A CLAIM is not PROOF. Branding resolves by host before it resolves by
      // session, so an unverified hostname that still resolved would let any
      // agency-plan tenant write our own hostname into this column and repaint
      // the real product, on the real domain, for every visitor — including
      // other tenants' signed-in users. Only a host we have verified answers.
      .not('custom_domain_verified_at', 'is', null)
      .maybeSingle()
    if (!data) return null
    const row = data as BrandingRow
    // A vanity host resolves to exactly one org's row. The parent chain is not
    // walked here: the row IS the org that claimed this hostname, and reaching
    // past it would mean a host could inherit a name its owner never set.
    return fold(row.org_id, null, [row])
  } catch {
    return null
  }
}

/**
 * Request-scoped memo of the above, for pages.
 *
 * The uncached function is exported separately because Better Auth's
 * sendMagicLink runs outside React's render scope, where cache() has no request
 * to key on — a page calls this one, the auth plugin calls the other.
 */
export const brandingForHost = cache(resolveBrandingForHost)

/**
 * The branding a page should render: the vanity host wins when the request
 * arrived on one, otherwise the active org's.
 *
 * Host first because it is the only one that works signed-out, and because a
 * reseller's customer landing on voice.acme-agency.com must never see a flash
 * of our name while their session resolves.
 */
export async function pageBranding(host: string | null): Promise<Branding> {
  const byHost = await brandingForHost(host)
  if (byHost) return byHost
  return currentBranding()
}
