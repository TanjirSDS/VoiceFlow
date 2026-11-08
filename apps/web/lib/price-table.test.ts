import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lookupPrice, parsePriceTable, spokenUsd } from './price-table'

// The real seed file, so a typo in it fails here rather than on a call.
const table = parsePriceTable(
  JSON.parse(readFileSync(new URL('../../../scripts/price-tables/sds-manager-us.json', import.meta.url), 'utf8'))
)
const usd = (count: unknown, plan?: unknown) => {
  const r = lookupPrice(table, count, plan)
  return 'annual_usd' in r ? r.annual_usd : r
}

describe('lookupPrice: first row whose up_to >= count', () => {
  it.each([
    [0, 468],
    [1, 468],
    [100, 468],
    [101, 668],
    [200, 668],
    [201, 1068],
    [600, 1468],
    [601, 1768],
    [620, 1768], // the live slip: quoted $1,468
    [1000, 2068],
    [1001, 2568],
    [10_000, 9468],
  ])('Premium (default) %i → $%i', (count, price) => {
    expect(usd(count)).toBe(price)
  })

  it('prices Basic and PRO by name, any case', () => {
    expect(usd(50, 'Basic')).toBe(228) // the live slip: quoted $276
    expect(usd(450, 'basic')).toBe(468)
    expect(usd(620, ' pro ')).toBe(2658)
    expect(usd(8000, 'PRO')).toBe(11808)
  })

  it('custom quote above custom_quote_above, and past a plan’s last row', () => {
    expect(lookupPrice(table, 10_001)).toEqual({ plan: 'Premium', count: 10_001, custom_quote: true })
    expect(lookupPrice(table, 8001, 'PRO')).toEqual({ plan: 'PRO', count: 8001, custom_quote: true })
    expect(lookupPrice(table, 10_000, 'PRO')).toEqual({ plan: 'PRO', count: 10_000, custom_quote: true })
  })

  it('returns the full answer with the spoken price', () => {
    expect(lookupPrice(table, 620)).toEqual({ plan: 'Premium', count: 620, annual_usd: 1768, spoken: 'seventeen sixty-eight a year' })
  })

  it('rejects an unknown plan, naming the real ones', () => {
    expect(lookupPrice(table, 50, 'Gold')).toEqual({ error: 'Unknown plan "Gold". Plans: Premium, Basic, PRO.' })
    expect(lookupPrice(table, 50, 7)).toHaveProperty('error')
  })

  it.each([-1, 1.5, '620', null, undefined, NaN, Infinity, 2 ** 60])('rejects count %s', (count) => {
    expect(lookupPrice(table, count)).toHaveProperty('error')
  })

  it('without a plan: default_plan, else the only plan, else ask', () => {
    const { default_plan: _, ...noDefault } = table
    expect(lookupPrice(noDefault, 50)).toEqual({ error: 'Ask which plan they want. Plans: Premium, Basic, PRO.' })
    const single = { plans: { Std: [{ up_to: 10, annual_usd: 99 }] }, custom_quote_above: 10 }
    expect(lookupPrice(single, 5)).toMatchObject({ plan: 'Std', annual_usd: 99 })
  })
})

describe('spokenUsd: how a person says the price', () => {
  it.each([
    [1468, 'fourteen sixty-eight'],
    [468, 'four sixty-eight'],
    [1068, 'ten sixty-eight'],
    [540, 'five forty'],
    [612, 'six twelve'],
    [9468, 'ninety-four sixty-eight'],
    [708, 'seven oh-eight'],
    [1608, 'sixteen oh-eight'],
    [2004, 'two thousand four'],
    [1500, 'fifteen hundred'],
    [500, 'five hundred'],
    [2000, 'two thousand'],
    [11808, 'eleven thousand eight hundred eight'],
    [10_000, 'ten thousand'],
    [99, 'ninety-nine'],
  ])('%i → %s', (n, words) => {
    expect(spokenUsd(n)).toBe(words)
  })
})

describe('parsePriceTable', () => {
  it('keeps known keys only (the seed file’s _note is dropped)', () => {
    expect(Object.keys(table).sort()).toEqual(['custom_quote_above', 'default_plan', 'plans'])
  })

  it.each([
    ['no plans', { plans: {}, custom_quote_above: 1 }],
    ['rows out of order', { plans: { A: [{ up_to: 200, annual_usd: 1 }, { up_to: 100, annual_usd: 2 }] }, custom_quote_above: 1 }],
    ['fractional price', { plans: { A: [{ up_to: 100, annual_usd: 4.5 }] }, custom_quote_above: 1 }],
    ['missing custom_quote_above', { plans: { A: [{ up_to: 100, annual_usd: 4 }] } }],
    ['unknown default_plan', { plans: { A: [{ up_to: 100, annual_usd: 4 }] }, custom_quote_above: 1, default_plan: 'B' }],
    ['not an object', 'nope'],
  ])('rejects %s', (_, raw) => {
    expect(() => parsePriceTable(raw)).toThrow()
  })
})
