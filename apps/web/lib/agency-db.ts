import type { Db } from '@voiceflow/db'
import { serviceClient } from '@voiceflow/db'
import { isBrandColor } from './brand-palette'

/**
 * Phase 27 — every read and write of the parent/child relationship.
 *
 * THE BOUNDARY IS THE `parent_org_id` FILTER IN THESE QUERIES, NOT RLS.
 *
 * This is the Phase 24 lesson applied before it costs anything. There, the API
 * keys page listed rows with no org filter and leaned on is_org_member(), which
 * answers "is this user a member of that org?" — true across EVERY workspace
 * they belong to, while the action had authorised exactly one. Here the same
 * shape would be worse: is_org_member() now also answers true for any org a
 * caller resells, so an unscoped query in an agency screen would happily return
 * the sub-orgs of a DIFFERENT agency the same person happens to work at.
 *
 * So every function below takes the parent org explicitly and filters on it.
 * RLS stays on as defence in depth. Mutations return the rows they touched, so
 * a write that matched nothing cannot report success.
 */

export interface SubOrgRow {
  orgId: string
  name: string
  planName: string
  minutesCap: number
  minutesUsed: number
  createdAt: string
  /** Whether this sub-org has branding of its own (vs inheriting the agency's). */
  hasOwnBranding: boolean
}

/** First day of the current UTC month, the key usage_periods is written on. */
export function currentPeriodStart(now = new Date()): string {
  return now.toISOString().slice(0, 8) + '01'
}

/**
 * Every sub-org of ONE parent, with this period's minutes.
 *
 * `.eq('parent_org_id', parentOrgId)` is the security boundary. Without it this
 * returns every org the caller can see through any membership they hold.
 */
export async function listSubOrgs(db: Db, parentOrgId: string, period = currentPeriodStart()): Promise<SubOrgRow[]> {
  const { data, error } = await db
    .from('orgs')
    .select('id, name, minutes_cap, created_at, plans!orgs_plan_id_fkey(name), usage_periods(minutes_used, period_start), org_branding(org_id)')
    .eq('parent_org_id', parentOrgId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`listSubOrgs: ${error.message}`)

  return (data ?? []).map((o) => {
    const row = o as unknown as {
      id: string
      name: string
      minutes_cap: number
      created_at: string
      plans: { name: string } | null
      usage_periods: { minutes_used: number; period_start: string }[] | null
      org_branding: { org_id: string }[] | { org_id: string } | null
    }
    // The embed returns every period, not just this one — filtering here rather
    // than in the query keeps it a single round trip for the whole list.
    const thisPeriod = (row.usage_periods ?? []).find((u) => u.period_start === period)
    const branding = Array.isArray(row.org_branding) ? row.org_branding[0] : row.org_branding
    return {
      orgId: row.id,
      name: row.name,
      planName: row.plans?.name ?? '—',
      minutesCap: row.minutes_cap,
      minutesUsed: thisPeriod?.minutes_used ?? 0,
      createdAt: row.created_at,
      hasOwnBranding: Boolean(branding),
    }
  })
}

/**
 * One sub-org, but only if it is THIS parent's.
 *
 * Returns null rather than throwing for a child of another agency: the caller
 * renders a 404, so there is no oracle telling them the org exists elsewhere.
 */
export async function getSubOrg(db: Db, parentOrgId: string, childOrgId: string) {
  const { data, error } = await db
    .from('orgs')
    .select('id, name, minutes_cap, overage_policy, plan_id, created_at, parent_org_id')
    .eq('id', childOrgId)
    .eq('parent_org_id', parentOrgId)
    .maybeSingle()
  if (error) throw new Error(`getSubOrg: ${error.message}`)
  return data as {
    id: string
    name: string
    minutes_cap: number
    overage_policy: string
    plan_id: string
    created_at: string
    parent_org_id: string
  } | null
}

/** How many sub-orgs this parent already has — checked against the plan ceiling. */
export async function countSubOrgs(db: Db, parentOrgId: string): Promise<number> {
  const { count, error } = await db
    .from('orgs')
    .select('id', { count: 'exact', head: true })
    .eq('parent_org_id', parentOrgId)
  if (error) throw new Error(`countSubOrgs: ${error.message}`)
  return count ?? 0
}

/**
 * Create a sub-org under a parent.
 *
 * Service-role for the same reason provisionOrg() is (Phase 9): orgs and
 * org_members are member-read-only under RLS, so a member cannot insert either.
 * That makes the caller the gate — agency/actions.ts checks the plan flag, the
 * role and the ceiling before reaching this.
 *
 * NOT a 'use server' module, so `parentOrgId` can never be supplied by a client.
 *
 * The one-level trigger in 0022 is the backstop: if `parentOrgId` is itself a
 * sub-org, the insert fails loudly here rather than building a grandchild that
 * every rule in this phase would quietly mis-handle.
 */
export async function createSubOrg(
  parentOrgId: string,
  name: string,
  minutesCap: number
): Promise<{ orgId?: string; error?: string }> {
  const svc = serviceClient()
  const { data: org, error } = await svc
    .from('orgs')
    .insert({
      name,
      parent_org_id: parentOrgId,
      minutes_cap: minutesCap,
      // A sub-org's own cap is a CONTROL (how many minutes this client may
      // spend), not a price — the money is pooled at the parent. 'pause' means
      // hitting it stops that client's agents without touching its siblings.
      overage_policy: 'pause',
    })
    .select('id')
    .single()
  if (error || !org) return { error: error?.message ?? 'Could not create the client workspace.' }
  return { orgId: org.id }
}

/** Rename / re-cap a sub-org. Scoped, and reports what it actually changed. */
export async function updateSubOrg(
  parentOrgId: string,
  childOrgId: string,
  patch: { name?: string; minutesCap?: number }
): Promise<{ updated: number; error?: string }> {
  const fields: Record<string, unknown> = {}
  if (patch.name !== undefined) fields.name = patch.name
  if (patch.minutesCap !== undefined) fields.minutes_cap = patch.minutesCap
  if (Object.keys(fields).length === 0) return { updated: 0 }

  const svc = serviceClient()
  // Both .eq() clauses matter. Dropping the parent filter would let a reseller
  // rename any org id they could guess; service_role bypasses RLS, so this
  // query is the ONLY thing standing between them and that.
  const { data, error } = await svc
    .from('orgs')
    .update(fields)
    .eq('id', childOrgId)
    .eq('parent_org_id', parentOrgId)
    .select('id')
  if (error) return { updated: 0, error: error.message }
  return { updated: (data ?? []).length }
}

export interface BrandingPatch {
  productName?: string | null
  brandColor?: string | null
  supportEmail?: string | null
  customDomain?: string | null
  logoKey?: string | null
  logoContentType?: string | null
}

/**
 * Write branding for an org the caller has already been authorised for.
 *
 * `authorisedOrgIds` is passed in rather than re-derived: the action knows
 * exactly which orgs it checked (the agency itself, or one of its sub-orgs),
 * and an id outside that set is refused here even though RLS would also refuse
 * it. Two independent gates, and the cheap one runs first.
 *
 * The colour is validated a third time on the way in. It is already constrained
 * by the column and re-checked on read, but this is the layer that can return a
 * useful error to a person instead of a constraint violation.
 */
export async function saveBranding(
  db: Db,
  orgId: string,
  authorisedOrgIds: string[],
  patch: BrandingPatch
): Promise<{ error?: string }> {
  if (!authorisedOrgIds.includes(orgId)) return { error: 'Not your workspace.' }
  if (patch.brandColor && !isBrandColor(patch.brandColor)) {
    return { error: 'Brand colour must be a hex value like #1a73e8.' }
  }

  const row: Record<string, unknown> = { org_id: orgId, updated_at: new Date().toISOString() }
  if (patch.productName !== undefined) row.product_name = patch.productName || null
  if (patch.brandColor !== undefined) row.brand_color = patch.brandColor || null
  if (patch.supportEmail !== undefined) row.support_email = patch.supportEmail || null
  if (patch.customDomain !== undefined) row.custom_domain = patch.customDomain?.toLowerCase() || null
  if (patch.logoKey !== undefined) row.logo_key = patch.logoKey
  if (patch.logoContentType !== undefined) row.logo_content_type = patch.logoContentType

  // The caller's own RLS client, not service_role: branding_write/branding_update
  // in 0022 are what stop a sub-org's owner editing the branding their reseller
  // set, and running this as service_role would bypass exactly that.
  const { error } = await db.from('org_branding').upsert(row, { onConflict: 'org_id' })
  if (error) {
    // 23505 is a unique violation, and custom_domain is the only unique column a
    // person can set here — so this is always "someone already has that host".
    if (error.code === '23505') return { error: 'That domain is already in use by another workspace.' }
    return { error: error.message }
  }
  return {}
}

/** This period's rollup row, if the nightly job has written one yet. */
export async function agencyPeriod(db: Db, parentOrgId: string, period = currentPeriodStart()) {
  const { data, error } = await db
    .from('agency_periods')
    .select('pooled_minutes, family_minutes, billable_minutes, reported_minutes, updated_at')
    .eq('parent_org_id', parentOrgId)
    .eq('period_start', period)
    .maybeSingle()
  if (error) throw new Error(`agencyPeriod: ${error.message}`)
  return data as {
    pooled_minutes: number
    family_minutes: number
    billable_minutes: number
    reported_minutes: number
    updated_at: string
  } | null
}

/** The agency's own workspace usage for the period (it is in the pool too). */
export async function parentUsage(db: Db, parentOrgId: string, period = currentPeriodStart()): Promise<number> {
  const { data, error } = await db
    .from('usage_periods')
    .select('minutes_used')
    .eq('org_id', parentOrgId)
    .eq('period_start', period)
    .maybeSingle()
  if (error) throw new Error(`parentUsage: ${error.message}`)
  return (data as { minutes_used: number } | null)?.minutes_used ?? 0
}
