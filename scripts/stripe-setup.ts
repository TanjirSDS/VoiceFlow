// Phase 5: idempotently create the Stripe catalog and store the ids in plans.
//
//   - One Product per plan (matched by metadata.plan_id) + one for overage.
//   - Prices via lookup_key (starter_monthly, starter_annual, …, overage_minutes).
//     Prices are immutable: an amount change creates a replacement price and
//     moves the lookup_key over (transfer_lookup_key).
//   - One billing Meter 'overage_minutes' (sum), which the metered price bills
//     at $0.35/min. Usage lands via meter events from the daily cron.
//
//   npm run stripe-setup   (run `npm run migrate` first — needs 0005_billing.sql)

import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

import Stripe from 'stripe'
import { getEnv, serviceClient } from '@voiceflow/db'
import { AGENCY_METER_EVENT, annualPriceCents, OVERAGE_CENTS_PER_MIN, OVERAGE_METER_EVENT } from '../apps/web/lib/billing-math'

async function ensureProduct(stripe: Stripe, existing: Stripe.Product[], key: string, name: string) {
  const found = existing.find((p) => p.metadata.plan_id === key)
  return found ?? (await stripe.products.create({ name, metadata: { plan_id: key } }))
}

async function ensurePrice(
  stripe: Stripe,
  opts: {
    lookupKey: string
    product: string
    unitAmount: number
    recurring: Stripe.PriceCreateParams.Recurring
  }
): Promise<Stripe.Price> {
  const { data } = await stripe.prices.list({ lookup_keys: [opts.lookupKey], limit: 1 })
  const existing = data[0]
  if (existing && existing.unit_amount === opts.unitAmount) return existing
  if (existing) {
    console.warn(
      `price ${opts.lookupKey}: amount ${existing.unit_amount} → ${opts.unitAmount}, creating replacement`
    )
  }
  return stripe.prices.create({
    currency: 'usd',
    product: opts.product,
    unit_amount: opts.unitAmount,
    recurring: opts.recurring,
    lookup_key: opts.lookupKey,
    transfer_lookup_key: true,
  })
}

async function main() {
  const stripe = new Stripe(getEnv().STRIPE_SECRET_KEY)
  const db = serviceClient()

  const { data: plans, error } = await db.from('plans').select('id, name, price_cents, agency_rate_cents_per_min')
  if (error || !plans?.length) throw new Error(`plans: ${error?.message ?? 'empty'} — run \`npm run migrate\` first`)
  if (plans.some((p) => p.price_cents < 10_000)) {
    throw new Error('plans.price_cents looks like dollars — run `npm run migrate` (needs 0005_billing.sql)')
  }

  const products = (await stripe.products.list({ active: true, limit: 100 })).data

  const meters = (await stripe.billing.meters.list({ status: 'active', limit: 100 })).data
  const meter =
    meters.find((m) => m.event_name === OVERAGE_METER_EVENT) ??
    (await stripe.billing.meters.create({
      display_name: 'Overage minutes',
      event_name: OVERAGE_METER_EVENT,
      default_aggregation: { formula: 'sum' },
      customer_mapping: { type: 'by_id', event_payload_key: 'stripe_customer_id' },
      value_settings: { event_payload_key: 'value' },
    }))

  // Phase 27: a second meter for the agency tier's pooled overage. Separate
  // from the direct one because it bills at a different rate ($0.25 vs $0.35)
  // and prices are immutable — one meter at two rates is not expressible.
  //
  // These product names DO reach an invoice, and they say VoiceFlow on purpose:
  // the agency is our own direct customer and knows exactly who they buy from.
  // It is their SUB-ORGS that must never see us, and a sub-org receives no
  // invoice from us at all — that is what rolling up to one invoice means.
  const agencyMeter =
    meters.find((m) => m.event_name === AGENCY_METER_EVENT) ??
    (await stripe.billing.meters.create({
      display_name: 'Agency pooled minutes',
      event_name: AGENCY_METER_EVENT,
      default_aggregation: { formula: 'sum' },
      customer_mapping: { type: 'by_id', event_payload_key: 'stripe_customer_id' },
      value_settings: { event_payload_key: 'value' },
    }))

  const agencyRate = plans.find((p) => p.id === 'agency')?.agency_rate_cents_per_min ?? 25
  const agencyProduct = await ensureProduct(stripe, products, 'agency_minutes', 'VoiceFlow Agency pooled minutes')
  const agencyPrice = await ensurePrice(stripe, {
    lookupKey: AGENCY_METER_EVENT,
    product: agencyProduct.id,
    unitAmount: agencyRate,
    recurring: { interval: 'month', usage_type: 'metered', meter: agencyMeter.id },
  })

  const overageProduct = await ensureProduct(stripe, products, 'overage', 'VoiceFlow Overage minutes')
  const overagePrice = await ensurePrice(stripe, {
    lookupKey: OVERAGE_METER_EVENT,
    product: overageProduct.id,
    unitAmount: OVERAGE_CENTS_PER_MIN,
    recurring: { interval: 'month', usage_type: 'metered', meter: meter.id },
  })

  for (const plan of plans) {
    const product = await ensureProduct(stripe, products, plan.id, `VoiceFlow ${plan.name}`)
    const monthly = await ensurePrice(stripe, {
      lookupKey: `${plan.id}_monthly`,
      product: product.id,
      unitAmount: plan.price_cents,
      recurring: { interval: 'month' },
    })
    const annual = await ensurePrice(stripe, {
      lookupKey: `${plan.id}_annual`,
      product: product.id,
      unitAmount: annualPriceCents(plan.price_cents),
      recurring: { interval: 'year' },
    })
    const { error: upErr } = await db
      .from('plans')
      .update({
        stripe_product_id: product.id,
        stripe_price_monthly_id: monthly.id,
        stripe_price_annual_id: annual.id,
        stripe_overage_price_id: overagePrice.id,
        stripe_agency_price_id: agencyPrice.id,
      })
      .eq('id', plan.id)
    if (upErr) throw new Error(`plans update ${plan.id}: ${upErr.message}`)
    console.log(
      `${plan.id}: ${monthly.id} ($${plan.price_cents / 100}/mo), ${annual.id} ` +
        `($${annualPriceCents(plan.price_cents) / 100}/yr)`
    )
  }
  console.log(`overage: ${overagePrice.id} ($${OVERAGE_CENTS_PER_MIN / 100}/min, meter ${meter.id})`)
  console.log(`agency:  ${agencyPrice.id} ($${agencyRate / 100}/min, meter ${agencyMeter.id})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
