// Phase 27 agency money math — pure, unit-tested (CLAUDE.md rule 7). No Stripe
// imports, no database. This is what decides an agency's invoice, so it is a
// function of its inputs and nothing else.

import { overageDelta } from './billing-math'

/** One sub-org's minutes for the period. Comes straight from usage_periods. */
export interface ChildUsage {
  orgId: string
  name: string
  minutes: number
}

export interface ChildLine extends ChildUsage {
  /** Share of the family's minutes, 0–100. 0 for every child when nobody called. */
  sharePct: number
}

export interface AgencyRollup {
  /** Every sub-org, busiest first — including the ones with no usage. */
  children: ChildLine[]
  /** Minutes the agency's own workspace used. */
  parentMinutes: number
  /** Parent + every sub-org. */
  familyMinutes: number
  /** The agency plan's pooled allowance. */
  pooledMinutes: number
  /** Of the pool, how much is spent. Never more than the pool. */
  includedUsed: number
  /** Minutes past the pool — what actually costs money. */
  billableMinutes: number
  rateCentsPerMin: number
  /** Whole billable minutes × rate. Partial minutes are not charged. */
  overageCents: number
  /** The agency plan's monthly price. */
  baseCents: number
  /** base + overage. An ESTIMATE until Stripe closes the invoice (rule 5). */
  estTotalCents: number
}

export interface RollupInput {
  parentMinutes: number
  children: ChildUsage[]
  pooledMinutes: number
  rateCentsPerMin: number
  baseCents: number
}

/**
 * Roll a family's usage into the one line the agency is billed for.
 *
 * THE POOL IS THE WHOLE POINT, and it is why this cannot be computed per child.
 * An agency buys 10,000 minutes and resells them; whether client A's 900th
 * minute is "included" or "overage" depends on what every OTHER client used
 * that month, so "which client used the billable minute" is a question with no
 * answer. The per-child lines below therefore attribute USAGE (what each client
 * consumed, which is real) and the pool prices it (which is a family-level
 * fact). Splitting the overage across children pro-rata would invent a number
 * that looks authoritative and is not — the agency's own pricing to its clients
 * is its business, not ours to guess.
 *
 * Children with zero minutes are kept in the output on purpose: an agency
 * looking at this screen needs to see the client that made no calls this month
 * at least as much as the one that made the most.
 */
export function agencyRollup(input: RollupInput): AgencyRollup {
  const childTotal = input.children.reduce((sum, c) => sum + Math.max(0, c.minutes), 0)
  const parentMinutes = Math.max(0, input.parentMinutes)
  const familyMinutes = parentMinutes + childTotal
  const pooledMinutes = Math.max(0, input.pooledMinutes)

  const billableMinutes = Math.max(0, familyMinutes - pooledMinutes)
  // Whole minutes only, exactly like the direct overage meter — an agency and a
  // direct customer must not round differently on the same platform.
  const overageCents = Math.floor(billableMinutes) * input.rateCentsPerMin

  const children: ChildLine[] = input.children
    .map((c) => ({
      ...c,
      minutes: Math.max(0, c.minutes),
      sharePct: familyMinutes > 0 ? (Math.max(0, c.minutes) / familyMinutes) * 100 : 0,
    }))
    // Busiest first, then by name so the order is stable across renders when
    // several clients sit on the same number (very common at zero).
    .sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name))

  return {
    children,
    parentMinutes,
    familyMinutes,
    pooledMinutes,
    includedUsed: Math.min(familyMinutes, pooledMinutes),
    billableMinutes,
    rateCentsPerMin: input.rateCentsPerMin,
    overageCents,
    baseCents: input.baseCents,
    estTotalCents: input.baseCents + overageCents,
  }
}

/**
 * Whole billable minutes not yet sent to the Stripe meter.
 *
 * Deliberately the SAME primitive the direct overage reporter uses: meter events
 * are additive, so the daily job sends only the delta and advances the ledger by
 * exactly that much. Reusing overageDelta rather than re-deriving it here keeps
 * one definition of "a whole minute we have already billed for" on the platform
 * — two would eventually disagree, and the disagreement would be money.
 *
 * Clamped at zero by that primitive, which matters here: recompute_agency_usage
 * rewrites family usage from source every night, and a credit or a corrected
 * duration can LOWER billable_minutes below what has already been reported.
 * A negative delta would be a meter event that silently refunds.
 */
export function agencyMeterDelta(billableMinutes: number, reportedMinutes: number): number {
  return overageDelta(billableMinutes, reportedMinutes)
}

/**
 * Can this org be billed on its own?
 *
 * A sub-org has no subscription, no card and no invoice — its minutes land on
 * its parent's. Every billing entry point (checkout, plan change, the customer
 * portal) asks this first, so the answer lives in one place rather than being
 * re-derived at each of them, where one omission is a client being charged
 * twice: once by us and once by the agency reselling to them.
 */
export function billsForItself(org: { parentOrgId: string | null }): boolean {
  return org.parentOrgId === null
}

/** Sub-orgs an agency may still create. Rule 5: there is always a ceiling. */
export function subOrgHeadroom(current: number, max: number): number {
  return Math.max(0, max - current)
}
