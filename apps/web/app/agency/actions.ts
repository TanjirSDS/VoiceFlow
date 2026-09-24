'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import { getEnv } from '@voiceflow/db'
import { headerSafe } from '../../lib/brand-constants'
import { checkLogo, logoKey, MAX_LOGO_BYTES } from '../../lib/brand-logo'
import { recordingStore } from '../../lib/object-store'
import { isBrandColor } from '../../lib/brand-palette'
import {
  countSubOrgs,
  createSubOrg,
  getSubOrg,
  listSubOrgs,
  saveBranding,
  updateSubOrg,
  type BrandingPatch,
} from '../../lib/agency-db'
import { subOrgHeadroom } from '../../lib/agency-math'
import { userClient } from '../../lib/db'
import { activeOrg, type ActiveOrg } from '../../lib/org'

/**
 * Phase 27 — the agency console's server actions.
 *
 * The PAGES are UX; these are the gate. Every one of them re-establishes three
 * facts from the session rather than trusting anything the form sent:
 *
 *   1. the caller's active org can actually resell (plan flag), and
 *   2. is not itself a sub-org (no reselling your reseller), and
 *   3. the caller holds owner or reseller ON THAT ORG.
 *
 * The org id is NEVER a parameter. That is the difference between this and the
 * Phase 24 defect: an action that accepts an org id and checks permissions
 * against the *active* org has authorised one thing and acted on another.
 */

export interface ActionResult {
  ok?: true
  error?: string
}

/**
 * The caller's org, if it may administer sub-orgs.
 *
 * 404 rather than 403, like requireAdmin(): a tenant with no agency plan should
 * not learn that the surface exists by the shape of its refusal.
 *
 * `admin` is deliberately not accepted for WRITES. It comes from the Phase 6
 * view-as cookie, which exists so support can SEE a customer's screens; an
 * admin provisioning workspaces under someone else's account, which then bill
 * to that customer, is not support.
 */
async function requireResellerWrite(): Promise<ActiveOrg> {
  const org = await activeOrg()
  if (!org) notFound()
  if (!org.plan.agencyEnabled) notFound()
  if (org.parentOrgId !== null) notFound()
  if (org.role !== 'owner' && org.role !== 'reseller') notFound()
  return org
}

/** Read-side gate: support admins may look, which is what view-as is for. */
export async function requireResellerRead(): Promise<ActiveOrg> {
  const org = await activeOrg()
  if (!org) notFound()
  if (!org.plan.agencyEnabled) notFound()
  if (org.parentOrgId !== null) notFound()
  if (org.role !== 'owner' && org.role !== 'reseller' && org.role !== 'admin') notFound()
  return org
}

function cleanName(raw: FormDataEntryValue | null): string {
  return String(raw ?? '').trim().slice(0, 80)
}

export async function createSubOrgAction(form: FormData): Promise<ActionResult> {
  const org = await requireResellerWrite()
  const name = cleanName(form.get('name'))
  if (!name) return { error: 'Give the client workspace a name.' }

  // Rule 5: there is always a ceiling, and it is enforced here, not in the UI.
  const db = await userClient()
  const used = await countSubOrgs(db, org.orgId)
  if (subOrgHeadroom(used, org.plan.maxSubOrgs) <= 0) {
    return { error: `Your plan includes ${org.plan.maxSubOrgs} client workspaces. Contact us to raise it.` }
  }

  // The cap is a spend CONTROL for this client, not a price — the money pools at
  // the parent. Bounded so a typo cannot hand one client the whole allowance.
  const capRaw = Number(form.get('minutesCap'))
  const minutesCap = Number.isFinite(capRaw) && capRaw > 0 ? Math.min(Math.round(capRaw), org.minutesCap) : 500

  const { orgId, error } = await createSubOrg(org.orgId, name, minutesCap)
  if (error || !orgId) return { error: error ?? 'Could not create the client workspace.' }

  revalidatePath('/agency')
  return { ok: true }
}

export async function updateSubOrgAction(form: FormData): Promise<ActionResult> {
  const org = await requireResellerWrite()
  const childOrgId = String(form.get('orgId') ?? '')
  if (!childOrgId) return { error: 'Missing workspace.' }

  const name = cleanName(form.get('name'))
  if (!name) return { error: 'Give the client workspace a name.' }
  const capRaw = Number(form.get('minutesCap'))
  const minutesCap =
    Number.isFinite(capRaw) && capRaw > 0 ? Math.min(Math.round(capRaw), org.minutesCap) : undefined

  // updateSubOrg filters on BOTH ids, so a forged child id belonging to another
  // agency matches no row — and the returned count is what proves it.
  const { updated, error } = await updateSubOrg(org.orgId, childOrgId, { name, minutesCap })
  if (error) return { error }
  if (updated === 0) return { error: 'That workspace is not yours.' }

  revalidatePath('/agency')
  revalidatePath(`/agency/${childOrgId}`)
  return { ok: true }
}

/** Parse the branding form into a patch. Empty string clears a field. */
/**
 * Hostnames a tenant may not claim: ours, and the ones our host hands out.
 *
 * A vanity host is inert until verified, so this is defence in depth rather
 * than the only wall — but a row claiming our own domain should not exist at
 * all, and refusing it here gives a person an explanation instead of a silent
 * no-op later.
 *
 * APP_URL's hostname alone is NOT enough. A deployment answers on more than its
 * canonical name — Railway hands every service a generated *.up.railway.app
 * host, and that one is reachable, not theoretical. RESERVED_SUFFIXES covers
 * the platform-assigned families; add an alias here if the deployment gains one.
 */
const RESERVED_SUFFIXES = ['up.railway.app', 'railway.app', 'vercel.app', 'localhost']

function isPlatformHost(hostname: string): boolean {
  const under = (base: string) => hostname === base || hostname.endsWith(`.${base}`)
  if (RESERVED_SUFFIXES.some(under)) return true
  try {
    const platform = new URL(getEnv().APP_URL ?? 'http://localhost:3000').hostname.toLowerCase()
    return under(platform)
  } catch {
    // No APP_URL is not a reason to accept a claim we cannot check.
    return true
  }
}

function brandingPatch(form: FormData): BrandingPatch | { error: string } {
  const color = String(form.get('brandColor') ?? '').trim()
  if (color && !isBrandColor(color)) {
    return { error: 'Brand colour must be a six-digit hex value like #1a73e8.' }
  }
  const domain = String(form.get('customDomain') ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
  if (domain && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return { error: 'Enter a hostname like voice.your-agency.com (no https://, no path).' }
  }
  if (domain && isPlatformHost(domain)) {
    return { error: 'That hostname belongs to the platform. Use a domain you control.' }
  }
  const support = String(form.get('supportEmail') ?? '').trim()
  if (support && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(support)) {
    return { error: 'Enter a valid support email address.' }
  }
  return {
    // headerSafe before the length cap: this string becomes a mail header, and
    // a control character in it appends an arbitrary header to every message
    // the workspace sends. Stripped, not escaped — see lib/brand-constants.
    productName: headerSafe(String(form.get('productName') ?? '')).slice(0, 40),
    brandColor: color,
    supportEmail: support,
    customDomain: domain,
  }
}

/**
 * Save branding for the agency itself, or for one of its sub-orgs.
 *
 * The authorised set is built HERE, from the session, and handed to saveBranding
 * — which refuses anything outside it. A forged org id in the form therefore
 * fails on an id comparison before it ever reaches the database, and RLS would
 * refuse it again if it somehow did.
 */
export async function saveBrandingAction(form: FormData): Promise<ActionResult> {
  const org = await requireResellerWrite()
  const targetOrgId = String(form.get('orgId') ?? '') || org.orgId

  const db = await userClient()
  const authorised = [org.orgId, ...(await listSubOrgs(db, org.orgId)).map((c) => c.orgId)]

  const patch = brandingPatch(form)
  if ('error' in patch) return { error: patch.error }

  const { error } = await saveBranding(db, targetOrgId, authorised, patch)
  if (error) return { error }

  // Branding is in the root layout, so every page of the affected workspace is
  // stale — including ones this reseller is not currently looking at.
  revalidatePath('/', 'layout')
  return { ok: true }
}

/**
 * Upload a logo for the agency or one of its clients.
 *
 * Validation order matters: authorise, then check the BYTES, then store. The
 * declared MIME type and the filename are both attacker-supplied and are never
 * consulted — checkLogo reads the magic number, which is what refuses a renamed
 * SVG or an HTML polyglot claiming to be a PNG.
 */
export async function uploadLogoAction(form: FormData): Promise<ActionResult> {
  const org = await requireResellerWrite()
  const targetOrgId = String(form.get('orgId') ?? '') || org.orgId

  const db = await userClient()
  const authorised = [org.orgId, ...(await listSubOrgs(db, org.orgId)).map((c) => c.orgId)]
  if (!authorised.includes(targetOrgId)) return { error: 'Not your workspace.' }

  const file = form.get('logo')
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image file.' }
  // Bound the read itself, not just the result — an oversized upload should not
  // be pulled fully into memory before being rejected.
  if (file.size > MAX_LOGO_BYTES) {
    return { error: `Logo must be under ${Math.round(MAX_LOGO_BYTES / 1024)} KB.` }
  }

  const buf = await file.arrayBuffer()
  const check = checkLogo(new Uint8Array(buf))
  if (!check.ok) return { error: check.error }

  const store = recordingStore()
  if (!store) {
    return { error: 'Logo storage is not configured on this deployment — your product name is used instead.' }
  }

  // A fresh key per upload: the proxy route's URL never changes, so the version
  // is what makes a replaced logo actually appear instead of sitting behind the
  // browser's copy of the old one.
  const key = logoKey(targetOrgId, randomUUID().slice(0, 8))
  try {
    await store.put(key, buf, check.contentType)
  } catch (e) {
    return { error: `Could not store the logo: ${String(e)}` }
  }

  const { error } = await saveBranding(db, targetOrgId, authorised, {
    logoKey: key,
    logoContentType: check.contentType,
  })
  if (error) return { error }

  revalidatePath('/', 'layout')
  return { ok: true }
}

/** Drop a logo and fall back to the wordmark. */
export async function removeLogoAction(form: FormData): Promise<ActionResult> {
  const org = await requireResellerWrite()
  const targetOrgId = String(form.get('orgId') ?? '') || org.orgId
  const db = await userClient()
  const authorised = [org.orgId, ...(await listSubOrgs(db, org.orgId)).map((c) => c.orgId)]

  // The object is left in the bucket on purpose: a logo is a few KB, and the
  // row no longer points at it, so nothing serves it. Deleting storage from a
  // request path adds a failure mode to an operation that has already succeeded
  // everywhere the user can see.
  const { error } = await saveBranding(db, targetOrgId, authorised, { logoKey: null, logoContentType: null })
  if (error) return { error }
  revalidatePath('/', 'layout')
  return { ok: true }
}

/** Confirm a sub-org belongs to the caller, for the detail page. 404 otherwise. */
export async function loadSubOrg(childOrgId: string) {
  const org = await requireResellerRead()
  const db = await userClient()
  const child = await getSubOrg(db, org.orgId, childOrgId)
  if (!child) notFound()
  return { org, child }
}
