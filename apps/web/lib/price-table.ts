// Price lookup behind the look_up_price agent tool. Agents quote prices from this code,
// not from a table in their prompt: across 4 rounds of prompt tuning the SDS demo agent
// kept misreading a 36-row table at new counts (620 SDSs quoted at $1,468 instead of
// $1,768). Pure, no runtime imports — ~/vf-sds-demo/sim-call.mjs imports this file as is.
import type { PriceTable } from '@voiceflow/engine/templates'

export type PriceAnswer =
  | { plan: string; count: number; annual_usd: number; spoken: string }
  | { plan: string; count: number; custom_quote: true }
  | { error: string }

const MAX_PRICE = 999_999 // spokenUsd says thousands, not millions

/** Validate a price table (the apply script on write, the tool route on read). Throws with the reason. */
export function parsePriceTable(raw: unknown): PriceTable {
  const t = raw as PriceTable
  if (!t || typeof t !== 'object' || !t.plans || typeof t.plans !== 'object') throw new Error('plans missing')
  const names = Object.keys(t.plans)
  if (!names.length) throw new Error('no plans')
  for (const name of names) {
    const rows = t.plans[name]
    if (!Array.isArray(rows) || !rows.length) throw new Error(`${name}: no rows`)
    rows.forEach((r, i) => {
      if (!Number.isSafeInteger(r?.up_to) || r.up_to < 1) throw new Error(`${name} row ${i}: up_to must be a whole number ≥ 1`)
      if (!Number.isSafeInteger(r.annual_usd) || r.annual_usd < 0 || r.annual_usd > MAX_PRICE) {
        throw new Error(`${name} row ${i}: annual_usd must be whole dollars, 0-${MAX_PRICE}`)
      }
      if (i > 0 && r.up_to <= rows[i - 1].up_to) throw new Error(`${name} row ${i}: up_to must increase`)
    })
  }
  if (typeof t.custom_quote_above !== 'number' || !(t.custom_quote_above >= 0)) {
    throw new Error('custom_quote_above must be a number ≥ 0')
  }
  if (t.default_plan !== undefined && !names.includes(t.default_plan)) throw new Error('default_plan is not a plan')
  // Known keys only, so a note in the source JSON never lands in agents.config.
  const plans = Object.fromEntries(names.map((p) => [p, t.plans[p].map((r) => ({ up_to: r.up_to, annual_usd: r.annual_usd }))]))
  return { plans, custom_quote_above: t.custom_quote_above, ...(t.default_plan !== undefined && { default_plan: t.default_plan }) }
}

/** First row whose up_to >= count; past custom_quote_above or the plan's last row → custom quote.
 *  `plan` matches case-insensitively; omitted → default_plan (or the only plan). */
export function lookupPrice(table: PriceTable, count: unknown, plan?: unknown): PriceAnswer {
  if (!Number.isSafeInteger(count) || (count as number) < 0) {
    return { error: 'The count must be a whole number, 0 or more. Ask the caller how many they have.' }
  }
  const n = count as number
  const names = Object.keys(table.plans)
  const known = `Plans: ${names.join(', ')}.`
  let name: string | undefined
  if (plan === undefined || plan === null || plan === '') {
    name = table.default_plan ?? (names.length === 1 ? names[0] : undefined)
    if (!name) return { error: `Ask which plan they want. ${known}` }
  } else {
    if (typeof plan !== 'string') return { error: `Unknown plan. ${known}` }
    name = names.find((p) => p.toLowerCase() === plan.trim().toLowerCase())
    if (!name) return { error: `Unknown plan "${plan}". ${known}` }
  }
  const row = n > table.custom_quote_above ? undefined : table.plans[name].find((r) => r.up_to >= n)
  if (!row) return { plan: name, count: n, custom_quote: true }
  return { plan: name, count: n, annual_usd: row.annual_usd, spoken: `${spokenUsd(row.annual_usd)} a year` }
}

const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ')
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const under100 = (n: number) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ''))
const under1000 = (n: number) =>
  n < 100 ? under100(n) : `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${under100(n % 100)}` : ''}`

/** Whole dollars the way a person says a price: 1468 → "fourteen sixty-eight",
 *  708 → "seven oh-eight", 2004 → "two thousand four", 1500 → "fifteen hundred". */
export function spokenUsd(n: number): string {
  const hi = Math.floor(n / 100)
  const lo = n % 100
  if (n < 100) return under100(n)
  if (n >= 10_000 || (n >= 1000 && n % 1000 < 10)) {
    const rest = n % 1000
    return `${under1000(Math.floor(n / 1000))} thousand${rest ? ` ${under1000(rest)}` : ''}`
  }
  if (lo === 0) return `${under100(hi)} hundred`
  return `${under100(hi)} ${lo < 10 ? `oh-${ONES[lo]}` : under100(lo)}`
}
