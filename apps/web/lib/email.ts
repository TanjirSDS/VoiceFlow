import type { ReactElement } from 'react'
import { getEnv, pool, serviceClient } from '@voiceflow/db'
import { brandingFor, PLATFORM_PRODUCT_NAME, type Branding } from './branding'
import { headerSafe } from './brand-constants'
import type { EmailBrand } from '../emails'

// Resend's sandbox sender — works without domain verification, dev only.
const FROM_FALLBACK = 'onboarding@resend.dev'

/** Origin for links inside emails. Platform default; see brandedAppUrl(). */
export function appUrl(): string {
  return getEnv().APP_URL ?? 'http://localhost:3000'
}

/**
 * Where a branded email's links should point.
 *
 * A reseller's customer who clicks "View usage" and lands on app.voiceflow.io —
 * a domain they have never heard of, showing a product with a different name —
 * has just been told the whole story. If the org has a vanity host, the links
 * use it.
 *
 * Scheme is hardcoded https: the column only ever holds a bare hostname
 * (constrained in 0022), so there is nothing here to be talked into http or into
 * a different origin.
 */
export function brandedAppUrl(branding: Branding): string {
  return branding.customDomain ? `https://${branding.customDomain}` : appUrl()
}

/** What every send needs: the template's brand, and the envelope to send it from. */
export interface OrgMailBrand {
  brand: EmailBrand
  from: string
}

/**
 * The branding an email template needs, resolved for one org, plus the From it
 * should be sent with. Returned together because every caller needs both and
 * resolving them separately would mean two reads of the same row.
 *
 * Service-role because this runs from Inngest jobs and webhooks, which have no
 * session for RLS to scope. It reads org_branding and nothing else.
 */
export async function emailBrandFor(orgId: string): Promise<OrgMailBrand> {
  const svc = serviceClient()
  let parentOrgId: string | null = null
  try {
    const { data } = await svc.from('orgs').select('parent_org_id').eq('id', orgId).maybeSingle()
    parentOrgId = (data as { parent_org_id: string | null } | null)?.parent_org_id ?? null
  } catch {
    // Fall through with no parent — a resolution failure must degrade to the
    // platform look, never block a payment-failed or cap-reached email.
  }
  const branding = await brandingFor(svc, orgId, parentOrgId)
  const brand = brandFrom(branding)
  return { brand, from: emailFrom(brand, branding) }
}

/** Branding → the template-facing shape. */
export function brandFrom(branding: Branding): EmailBrand {
  return {
    // Every template puts this in a Subject line as well as in the body, and a
    // subject is a header too.
    productName: headerSafe(branding.productName),
    // brandStrong on white is the pair derivePalette guarantees above 4.5:1,
    // and an email card is white. Using `brand` here would be the lighter of
    // the two and is only proven against the app's page background.
    accent: branding.palette.light.brandStrong,
    supportEmail: branding.supportEmail,
    appUrl: brandedAppUrl(branding),
  }
}

/**
 * The address branded mail actually goes out from when a tenant's own sending
 * domain is not verified. Surfaced in the agency console so a reseller learns
 * about the one remaining leak from us rather than from a client.
 */
export function platformFromAddress(): string {
  const configured = getEnv().EMAIL_FROM ?? FROM_FALLBACK
  return configured.match(/<([^>]+)>/)?.[1] ?? configured.trim()
}

/**
 * The envelope From for a branded email.
 *
 * Two levels, and the difference is not cosmetic:
 *
 *   display name  — always the tenant's product name. Free, instant, and it is
 *                   what a recipient actually reads in their inbox list.
 *   address       — the tenant's own ONLY when email_sender_verified is set,
 *                   which only we can set (0022 revokes the column from
 *                   members). Sending as a domain whose SPF/DKIM we do not
 *                   control gets the mail spam-foldered or rejected outright,
 *                   which is worse for the agency than a neutral address.
 *
 * So an unverified tenant gets "Acme Voice <notifications@ourdomain>" — their
 * name, our address. The residual leak is the address itself; it is called out
 * in the agency console rather than hidden, with the verification step beside it.
 */
export function emailFrom(brand: EmailBrand, branding?: Branding): string {
  // EMAIL_FROM may be "Name <addr>" or a bare address; we only want the address.
  const address = branding?.emailFrom ?? platformFromAddress()
  // Two separate problems, and escaping only solves one of them.
  //
  // Quotes and backslashes are RFC 5322 specials INSIDE a quoted string, so
  // they are escaped — that is what lets a product name contain a comma or a
  // period without splitting the header.
  //
  // Control characters are a different thing entirely: a CR or LF ends the
  // header, and no amount of escaping inside the quoted string prevents that.
  // headerSafe removes them. Order matters — strip first, then escape, or the
  // backslash inserted by escaping could itself be split by a later newline.
  const name = headerSafe(brand.productName).replace(/[\\"]/g, '\\$&')
  return `"${name}" <${address}>`
}

/**
 * Send one transactional email via Resend. No RESEND_API_KEY → skipped
 * (returns false), same pattern as the optional OpenAI key. Failures throw so
 * the Inngest wrapper can retry.
 */
export async function sendEmail(
  to: string[],
  subject: string,
  react: ReactElement,
  from?: string
): Promise<boolean> {
  const env = getEnv()
  if (!env.RESEND_API_KEY || to.length === 0) return false
  const { Resend } = await import('resend')
  const resend = new Resend(env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: from ?? env.EMAIL_FROM ?? `${PLATFORM_PRODUCT_NAME} <${FROM_FALLBACK}>`,
    to,
    subject,
    react,
  })
  if (error) throw new Error(`resend: ${error.message}`)
  return true
}

/** Email addresses of an org's owners. auth.users is off PostgREST, so direct SQL. */
export async function orgOwnerEmails(orgId: string): Promise<string[]> {
  const { rows } = await pool().query<{ email: string }>(
    `select u.email from public.org_members m join auth.users u on u.id = m.user_id
     where m.org_id = $1 and m.role = 'owner'`,
    [orgId]
  )
  return rows.map((r) => r.email)
}
