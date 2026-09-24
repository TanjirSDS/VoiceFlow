import { describe, expect, it } from 'vitest'
import { agencyMeterDelta, agencyRollup, billsForItself, subOrgHeadroom } from './agency-math'

// The Agency plan as seeded in 0022.
const POOL = 10_000
const RATE = 25 // ¢/min
const BASE = 399_900 // $3,999

const rollup = (parentMinutes: number, children: [string, number][]) =>
  agencyRollup({
    parentMinutes,
    children: children.map(([name, minutes], i) => ({ orgId: `c${i}`, name, minutes })),
    pooledMinutes: POOL,
    rateCentsPerMin: RATE,
    baseCents: BASE,
  })

describe('agencyRollup — the pool', () => {
  it('bills nothing while the family is inside its allowance', () => {
    const r = rollup(200, [
      ['Northside Dental', 3000],
      ['Harbour Plumbing', 2500],
    ])
    expect(r.familyMinutes).toBe(5700)
    expect(r.includedUsed).toBe(5700)
    expect(r.billableMinutes).toBe(0)
    expect(r.overageCents).toBe(0)
    expect(r.estTotalCents).toBe(BASE)
  })

  it('bills the family total past the pool, not each child past its own share', () => {
    // Neither client alone exceeds the pool; together they do. A per-child
    // calculation would bill zero here, which is the bug this models away.
    const r = rollup(0, [
      ['Northside Dental', 6000],
      ['Harbour Plumbing', 5000],
    ])
    expect(r.familyMinutes).toBe(11_000)
    expect(r.includedUsed).toBe(POOL)
    expect(r.billableMinutes).toBe(1000)
    expect(r.overageCents).toBe(1000 * RATE) // $250.00
    expect(r.estTotalCents).toBe(BASE + 25_000)
  })

  it("counts the agency's own workspace in the family", () => {
    const r = rollup(10_100, [])
    expect(r.billableMinutes).toBe(100)
    expect(r.overageCents).toBe(2500)
  })

  it('charges whole minutes only — a partial minute waits', () => {
    const r = rollup(0, [['Northside Dental', 10_000.9]])
    expect(r.billableMinutes).toBeCloseTo(0.9, 6)
    expect(r.overageCents).toBe(0)
  })

  it('charges the whole minutes of a fractional overage and holds the remainder', () => {
    const r = rollup(0, [['Northside Dental', 10_003.7]])
    expect(r.billableMinutes).toBeCloseTo(3.7, 6)
    expect(r.overageCents).toBe(3 * RATE)
  })

  it('an empty agency bills base only and divides by nothing', () => {
    const r = rollup(0, [])
    expect(r.familyMinutes).toBe(0)
    expect(r.children).toEqual([])
    expect(r.overageCents).toBe(0)
    expect(r.estTotalCents).toBe(BASE)
  })

  it('treats a negative minute figure as zero rather than as a credit', () => {
    // usage_periods should never hold one, but a rollup that silently subtracts
    // from the family total would let one bad row erase real billable minutes.
    const r = rollup(-50, [['Northside Dental', -10]])
    expect(r.familyMinutes).toBe(0)
    expect(r.billableMinutes).toBe(0)
  })
})

describe('agencyRollup — the per-client breakdown', () => {
  it('keeps clients who made no calls', () => {
    const r = rollup(0, [
      ['Northside Dental', 400],
      ['Quiet Client', 0],
    ])
    expect(r.children).toHaveLength(2)
    expect(r.children.map((c) => c.name)).toContain('Quiet Client')
  })

  it('orders busiest first, then alphabetically so ties do not shuffle', () => {
    const r = rollup(0, [
      ['Zeta', 0],
      ['Busy', 900],
      ['Alpha', 0],
    ])
    expect(r.children.map((c) => c.name)).toEqual(['Busy', 'Alpha', 'Zeta'])
  })

  it('shares are of the FAMILY, so they include the agency and sum to 100', () => {
    const r = rollup(1000, [
      ['A', 3000],
      ['B', 1000],
    ])
    const childShare = r.children.reduce((s, c) => s + c.sharePct, 0)
    const parentShare = (r.parentMinutes / r.familyMinutes) * 100
    expect(childShare + parentShare).toBeCloseTo(100, 6)
    expect(r.children.find((c) => c.name === 'A')!.sharePct).toBeCloseTo(60, 6)
  })

  it('shares are 0, not NaN, when nobody called', () => {
    const r = rollup(0, [['Quiet', 0]])
    expect(r.children[0].sharePct).toBe(0)
  })
})

describe('agencyMeterDelta — what reaches Stripe', () => {
  it('sends only what has not been sent', () => {
    expect(agencyMeterDelta(150, 100)).toBe(50)
  })

  it('sends nothing twice on a same-day re-run', () => {
    expect(agencyMeterDelta(150, 150)).toBe(0)
  })

  // The case that matters: the nightly recompute rewrites family usage from
  // source, so a credit or a corrected call duration can lower billable minutes
  // below what Stripe already has. A negative delta would silently refund.
  it('never refunds when a recompute lowers usage below what was reported', () => {
    expect(agencyMeterDelta(90, 150)).toBe(0)
  })

  it('holds a partial minute back until it completes', () => {
    expect(agencyMeterDelta(100.9, 100)).toBe(0)
    expect(agencyMeterDelta(101.0, 100)).toBe(1)
  })

  it('a full month of daily runs bills each minute exactly once', () => {
    // Simulate usage climbing past the pool over ten days and assert the sum of
    // deltas equals the whole billable minutes — no gaps, no double charges.
    let reported = 0
    let sent = 0
    for (const billable of [0, 0, 0.4, 2.2, 5.9, 11.1, 11.1, 20.8, 33.3, 41.7]) {
      const d = agencyMeterDelta(billable, reported)
      sent += d
      reported += d
    }
    expect(sent).toBe(41)
    expect(agencyMeterDelta(41.7, reported)).toBe(0)
  })
})

describe('billsForItself', () => {
  it('a direct customer bills for itself', () => {
    expect(billsForItself({ parentOrgId: null })).toBe(true)
  })

  // The single guard behind checkout, plan change and the customer portal. A
  // sub-org that passes it is a client billed twice — by us and by the agency.
  it('a sub-org does not', () => {
    expect(billsForItself({ parentOrgId: 'parent-uuid' })).toBe(false)
  })
})

describe('subOrgHeadroom', () => {
  it('reports what is left', () => {
    expect(subOrgHeadroom(3, 25)).toBe(22)
  })

  it('never goes negative when a plan downgrade leaves an agency over its cap', () => {
    expect(subOrgHeadroom(30, 25)).toBe(0)
  })

  it('is zero for a plan that cannot resell at all', () => {
    expect(subOrgHeadroom(0, 0)).toBe(0)
  })
})
