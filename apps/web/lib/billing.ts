import type Stripe from 'stripe'
import type { Db } from '@voiceflow/db'
import type { VoiceEngine } from '@voiceflow/engine'
import { AGENCY_METER_EVENT, DUNNING_GRACE_DAYS, overageDelta, OVERAGE_METER_EVENT, planChange } from './billing-math'
import { agencyMeterDelta, billsForItself } from './agency-math'
import { pauseOrgAgents } from './usage'

export type BillingInterval = 'monthly' | 'annual'

async function getOrg(db: Db, orgId: string) {
  const { data, error } = await db
    .from('orgs')
    .select('id, name, plan_id, overage_policy, stripe_customer_id, stripe_subscription_id, parent_org_id')
    .eq('id', orgId)
    .single()
  if (error) throw new Error(`org ${orgId}: ${error.message}`)
  return data
}

async function getPlan(db: Db, planId: string) {
  const { data, error } = await db
    .from('plans')
    .select('id, name, price_cents, included_minutes, stripe_price_monthly_id, stripe_price_annual_id, stripe_overage_price_id')
    .eq('id', planId)
    .single()
  if (error) throw new Error(`plan ${planId}: ${error.message}`)
  return data
}

/**
 * A sub-org has no billing relationship with us — its minutes are pooled onto
 * its parent's invoice (reportAgencyDaily). Every entry point that could open
 * one asks this first.
 *
 * Throws rather than returning a flag: each of these is reached from a server
 * action that would otherwise carry on and hand the user a Stripe URL, and a
 * client being charged by us AND by the agency reselling to them is the exact
 * double-billing this tier must never produce.
 */
function refuseIfSubOrg(org: { id: string; parent_org_id: string | null }) {
  if (!billsForItself({ parentOrgId: org.parent_org_id })) {
    throw new Error('This workspace is billed by your provider — there is no separate subscription to manage.')
  }
}

function planPrice(plan: Awaited<ReturnType<typeof getPlan>>, interval: BillingInterval): string {
  const id = interval === 'annual' ? plan.stripe_price_annual_id : plan.stripe_price_monthly_id
  if (!id) throw new Error(`plan ${plan.id} has no Stripe price — run npm run stripe-setup`)
  return id
}

async function ensureCustomer(
  db: Db,
  stripe: Stripe,
  org: { id: string; name: string; stripe_customer_id: string | null }
): Promise<string> {
  if (org.stripe_customer_id) return org.stripe_customer_id
  const customer = await stripe.customers.create({ name: org.name, metadata: { org_id: org.id } })
  await db.from('orgs').update({ stripe_customer_id: customer.id }).eq('id', org.id)
  return customer.id
}

/** First subscription for an org goes through Checkout. Returns the session URL.
 *  paths override where Stripe sends the customer back (signup flow vs billing page). */
export async function startCheckout(
  db: Db,
  stripe: Stripe,
  orgId: string,
  planId: string,
  interval: BillingInterval,
  origin: string,
  paths?: { success?: string; cancel?: string }
): Promise<string> {
  const org = await getOrg(db, orgId)
  refuseIfSubOrg(org)
  const plan = await getPlan(db, planId)
  const customer = await ensureCustomer(db, stripe, org)

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: planPrice(plan, interval), quantity: 1 },
  ]
  // Metered overage item rides along from day one when the org opted into
  // overage billing (metered items take no quantity).
  if (org.overage_policy === 'overage' && plan.stripe_overage_price_id) {
    lineItems.push({ price: plan.stripe_overage_price_id })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer,
    client_reference_id: orgId,
    line_items: lineItems,
    subscription_data: { metadata: { org_id: orgId } },
    success_url: `${origin}${paths?.success ?? '/billing?checkout=success'}`,
    cancel_url: `${origin}${paths?.cancel ?? '/billing'}`,
  })
  if (!session.url) throw new Error('Stripe returned no checkout URL')
  return session.url
}

export interface InvoiceRow {
  id: string
  created: number // unix seconds
  amountCents: number // invoice total (incl. tax), in cents
  currency: string
  status: string // draft | open | paid | uncollectible | void
  hostedUrl: string | null
}

/** One page of Stripe invoices for the org's customer, newest first. Cursor
 *  pagination via starting_after (rule 6: Stripe list semantics). Empty when the
 *  org has no Stripe customer yet (pre-subscription). Owner-gate at the caller. */
export async function listInvoices(
  db: Db,
  stripe: Stripe,
  orgId: string,
  opts?: { limit?: number; startingAfter?: string }
): Promise<{ invoices: InvoiceRow[]; hasMore: boolean }> {
  const org = await getOrg(db, orgId)
  if (!org.stripe_customer_id) return { invoices: [], hasMore: false }
  const page = await stripe.invoices.list({
    customer: org.stripe_customer_id,
    limit: opts?.limit ?? 12,
    ...(opts?.startingAfter ? { starting_after: opts.startingAfter } : {}),
  })
  return {
    invoices: page.data.map((i) => ({
      id: i.id ?? '',
      created: i.created,
      amountCents: i.total,
      currency: i.currency,
      status: i.status ?? 'unknown',
      hostedUrl: i.hosted_invoice_url ?? null,
    })),
    hasMore: page.has_more,
  }
}

/** Customer portal: cards, invoices, cancel. */
export async function portalUrl(db: Db, stripe: Stripe, orgId: string, origin: string): Promise<string> {
  const org = await getOrg(db, orgId)
  refuseIfSubOrg(org)
  if (!org.stripe_customer_id) throw new Error('no billing account yet — pick a plan first')
  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${origin}/billing`,
  })
  return session.url
}

/**
 * Upgrade mid-cycle applies immediately (Stripe prorates; the
 * customer.subscription.updated webhook raises plan_id/minutes_cap). Downgrade
 * is deferred to the next period via a subscription schedule — pending_plan_id
 * until the phase flips. Returns a URL to redirect to (checkout) or null when
 * the subscription was changed in place.
 */
export async function changePlan(
  db: Db,
  stripe: Stripe,
  orgId: string,
  newPlanId: string,
  interval: BillingInterval,
  origin: string
): Promise<string | null> {
  const org = await getOrg(db, orgId)
  refuseIfSubOrg(org)
  if (!org.stripe_subscription_id) return startCheckout(db, stripe, orgId, newPlanId, interval, origin)

  const [current, next] = await Promise.all([getPlan(db, org.plan_id), getPlan(db, newPlanId)])
  const change = planChange(current, next)
  if (change.action === 'none') return null

  const sub = await stripe.subscriptions.retrieve(org.stripe_subscription_id)
  const licensed = sub.items.data.find((i) => i.price.recurring?.usage_type !== 'metered')
  if (!licensed) throw new Error(`subscription ${sub.id} has no licensed item`)
  const newPrice = planPrice(next, interval)
  const scheduleId = typeof sub.schedule === 'string' ? sub.schedule : sub.schedule?.id

  if (change.action === 'upgrade') {
    // an in-flight scheduled downgrade loses to an upgrade
    if (scheduleId) await stripe.subscriptionSchedules.release(scheduleId)
    await stripe.subscriptions.update(sub.id, {
      items: [{ id: licensed.id, price: newPrice }],
      proration_behavior: 'create_prorations',
    })
    await db.from('orgs').update({ pending_plan_id: null }).eq('id', orgId)
  } else {
    // keep every current item (incl. metered overage) until period end, then swap
    const keepItems = sub.items.data.map((i) => ({
      price: i.price.id,
      ...(i.price.recurring?.usage_type === 'metered' ? {} : { quantity: i.quantity ?? 1 }),
    }))
    const nextItems = keepItems.map((it) => (it.price === licensed.price.id ? { ...it, price: newPrice } : it))
    const schedule = scheduleId ?? (await stripe.subscriptionSchedules.create({ from_subscription: sub.id })).id
    await stripe.subscriptionSchedules.update(schedule, {
      end_behavior: 'release',
      phases: [
        {
          items: keepItems,
          start_date: licensed.current_period_start,
          end_date: licensed.current_period_end,
        },
        { items: nextItems },
      ],
    })
    await db.from('orgs').update({ pending_plan_id: newPlanId }).eq('id', orgId)
  }
  return null
}

/**
 * Daily (from the reconciliation cron, after recompute_usage — rule 5): send
 * each overage org's unreported whole minutes to the Stripe meter. The event
 * identifier makes a re-run of the same day a no-op on Stripe's side.
 */
export async function reportOverageDaily(db: Db, stripe: Stripe, now = new Date()): Promise<number> {
  const period = now.toISOString().slice(0, 8) + '01'
  const day = now.toISOString().slice(0, 10)
  const { data: orgs, error } = await db
    .from('orgs')
    .select('id, stripe_customer_id, stripe_subscription_id, usage_periods!inner(overage_minutes, overage_reported)')
    .eq('overage_policy', 'overage')
    .eq('usage_periods.period_start', period)
    .not('stripe_customer_id', 'is', null)
    .not('stripe_subscription_id', 'is', null)
  if (error) throw new Error(error.message)

  let reported = 0
  for (const org of orgs ?? []) {
    const up = (Array.isArray(org.usage_periods) ? org.usage_periods[0] : org.usage_periods) as {
      overage_minutes: number
      overage_reported: number
    }
    const delta = overageDelta(up.overage_minutes, up.overage_reported)
    if (!delta) continue
    await ensureOverageItem(db, stripe, org.stripe_subscription_id!)
    await stripe.billing.meterEvents.create({
      event_name: OVERAGE_METER_EVENT,
      identifier: `overage:${org.id}:${day}`,
      payload: { stripe_customer_id: org.stripe_customer_id!, value: String(delta) },
    })
    // ponytail: read-modify-write is fine here — the cron is the only writer,
    // and Stripe's identifier dedupe already blocks double-billing on a re-run.
    await db
      .from('usage_periods')
      .update({ overage_reported: up.overage_reported + delta })
      .eq('org_id', org.id)
      .eq('period_start', period)
    reported++
  }
  return reported
}

/**
 * Phase 27 — roll every agency's family usage up onto ONE invoice: the parent's.
 *
 * Runs daily from the reconciliation cron, AFTER recompute_usage has rewritten
 * each org's minutes from the calls table (rule 5), so the family total this
 * reads is the reconciled number and never a webhook accumulation.
 *
 * Two steps per agency, in this order for a reason:
 *
 *   1. recompute_agency_usage() re-derives family_minutes and billable_minutes
 *      from usage_periods. It deliberately does NOT touch reported_minutes.
 *   2. Only the whole minutes not yet reported go to the meter, keyed to the
 *      PARENT's stripe_customer_id — which is the entire mechanism by which a
 *      dozen sub-orgs become one line on one invoice. Sub-orgs have no customer
 *      and no subscription, so there is nothing else for their minutes to land on.
 *
 * Idempotent twice over. The event identifier `agency:{orgId}:{date}` is deduped
 * by Stripe for ~24h, so a cron re-run on the same day cannot double-bill; and
 * agency_periods.reported_minutes is the running ledger, so a re-run after
 * midnight sends only what genuinely accrued.
 */
export async function reportAgencyDaily(db: Db, stripe: Stripe, now = new Date()): Promise<number> {
  const period = now.toISOString().slice(0, 8) + '01'
  const day = now.toISOString().slice(0, 10)

  // Only orgs on an agency plan that are themselves top-level. A sub-org can
  // never be here — the one-level trigger makes it impossible for one to have
  // children, so it has no family to roll up.
  const { data: agencies, error } = await db
    .from('orgs')
    .select('id, stripe_customer_id, stripe_subscription_id, plans!orgs_plan_id_fkey(agency_enabled, stripe_agency_price_id)')
    .is('parent_org_id', null)
    .not('stripe_customer_id', 'is', null)
    .not('stripe_subscription_id', 'is', null)
  if (error) throw new Error(error.message)

  let reported = 0
  for (const org of agencies ?? []) {
    const plan = (Array.isArray(org.plans) ? org.plans[0] : org.plans) as {
      agency_enabled: boolean
      stripe_agency_price_id: string | null
    } | null
    if (!plan?.agency_enabled) continue

    // Rule 5: the billed figure is re-derived, never accumulated.
    const { error: rpcError } = await db.rpc('recompute_agency_usage', {
      p_parent: org.id,
      p_period: period,
    })
    if (rpcError) {
      // One agency's failure must not stop the rest of the run; the next night
      // re-derives from source anyway, so nothing is lost by continuing.
      console.error(`recompute_agency_usage(${org.id}) failed:`, rpcError.message)
      continue
    }

    const { data: row } = await db
      .from('agency_periods')
      .select('billable_minutes, reported_minutes')
      .eq('parent_org_id', org.id)
      .eq('period_start', period)
      .maybeSingle()
    if (!row) continue

    const delta = agencyMeterDelta(row.billable_minutes, row.reported_minutes)
    if (!delta) continue
    if (!plan.stripe_agency_price_id) {
      throw new Error(`plan for org ${org.id} has no agency price — run npm run stripe-setup`)
    }
    await ensureAgencyItem(stripe, org.stripe_subscription_id!, plan.stripe_agency_price_id)
    await stripe.billing.meterEvents.create({
      event_name: AGENCY_METER_EVENT,
      identifier: `agency:${org.id}:${day}`,
      payload: { stripe_customer_id: org.stripe_customer_id!, value: String(delta) },
    })
    // ponytail: read-modify-write is fine here for the same reason it is in
    // reportOverageDaily — the cron is the only writer (the table is revoked
    // from authenticated), and Stripe's identifier dedupe already blocks a
    // double charge on a re-run.
    await db
      .from('agency_periods')
      .update({ reported_minutes: row.reported_minutes + delta })
      .eq('parent_org_id', org.id)
      .eq('period_start', period)
    reported++
  }
  return reported
}

/** An agency upgraded into the tier mid-cycle has no metered agency item on its
 *  subscription yet — add it before the first report, like ensureOverageItem. */
async function ensureAgencyItem(stripe: Stripe, subscriptionId: string, priceId: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  if (sub.items.data.some((i) => i.price.id === priceId)) return
  await stripe.subscriptionItems.create({ subscription: subscriptionId, price: priceId })
}

/** Orgs whose overage_policy flipped to 'overage' after checkout have no
 *  metered item on the subscription yet — add it before the first report. */
async function ensureOverageItem(db: Db, stripe: Stripe, subscriptionId: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  if (sub.items.data.some((i) => i.price.recurring?.usage_type === 'metered')) return
  const { data: plan } = await db
    .from('plans')
    .select('stripe_overage_price_id')
    .not('stripe_overage_price_id', 'is', null)
    .limit(1)
    .maybeSingle()
  if (!plan?.stripe_overage_price_id) throw new Error('no overage price in plans — run npm run stripe-setup')
  await stripe.subscriptionItems.create({ subscription: subscriptionId, price: plan.stripe_overage_price_id })
}

/** Daily: pause agents for orgs whose payment failure outlived the grace window.
 *  pauseOrgAgents is idempotent, so re-pausing on later days is harmless. */
export async function expireDunning(db: Db, engine: VoiceEngine, now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - DUNNING_GRACE_DAYS * 86_400_000).toISOString()
  const { data: orgs, error } = await db.from('orgs').select('id').lt('payment_failed_at', cutoff)
  if (error) throw new Error(error.message)
  for (const org of orgs ?? []) await pauseOrgAgents(db, engine, org.id)
  return (orgs ?? []).length
}
