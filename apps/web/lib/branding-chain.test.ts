import { describe, expect, it } from 'vitest'
import type { Db } from '@voiceflow/db'
import { brandingFor, PLATFORM_BRAND_COLOR, PLATFORM_PRODUCT_NAME } from './branding'

/**
 * The resolution chain: own row → PARENT's row → platform, field by field.
 *
 * This is the other half of the tier's acceptance criterion. The live RLS test
 * proves a sub-org member can READ its parent's branding row through PostgREST
 * (the policy half); these prove the JS then FOLDS the two rows in the right
 * order and per field (the logic half). Both halves have to hold: the policy
 * alone would give a readable row nobody uses, and the fold alone would be
 * correct code operating on a row RLS filtered out.
 *
 * A stub Db rather than a live one — this is pure list-folding, and the query it
 * issues is already exercised in agency-db.live.test.ts.
 */

const AGENCY = 'agency-uuid'
const CLIENT = 'client-uuid'

type Row = Record<string, unknown>

/** Minimal Db stand-in: records the ids asked for, returns the rows given. */
function stubDb(rows: Row[], seen?: { ids?: unknown }): Db {
  return {
    from: () => ({
      select: () => ({
        in: (_col: string, ids: unknown) => {
          if (seen) seen.ids = ids
          return Promise.resolve({ data: rows, error: null })
        },
      }),
    }),
  } as unknown as Db
}

const row = (orgId: string, over: Row = {}): Row => ({
  org_id: orgId,
  product_name: null,
  logo_key: null,
  brand_color: null,
  custom_domain: null,
  custom_domain_verified_at: null,
  support_email: null,
  email_from_address: null,
  email_sender_verified: false,
  ...over,
})

describe('brandingFor — a client inherits its agency', () => {
  it('THE CRITERION: an unbranded client shows the AGENCY name, never the platform', async () => {
    const b = await brandingFor(
      stubDb([row(AGENCY, { product_name: 'Northwind Voice', brand_color: '#c1121f' })]),
      CLIENT,
      AGENCY
    )
    expect(b.productName).toBe('Northwind Voice')
    expect(b.brandColor).toBe('#c1121f')
    expect(b.whiteLabelled).toBe(true)
  })

  it('asks for BOTH rows — a query for the client alone could never inherit', async () => {
    const seen: { ids?: unknown } = {}
    await brandingFor(stubDb([], seen), CLIENT, AGENCY)
    expect(seen.ids).toEqual([CLIENT, AGENCY])
  })

  it('asks for one row when the org has no parent', async () => {
    const seen: { ids?: unknown } = {}
    await brandingFor(stubDb([], seen), AGENCY, null)
    expect(seen.ids).toEqual([AGENCY])
  })

  it('the client\'s own value wins over the agency\'s', async () => {
    const b = await brandingFor(
      stubDb([
        row(AGENCY, { product_name: 'Northwind Voice', brand_color: '#c1121f' }),
        row(CLIENT, { product_name: 'Northside Dental Line' }),
      ]),
      CLIENT,
      AGENCY
    )
    expect(b.productName).toBe('Northside Dental Line')
    // FIELD BY FIELD: overriding the name must not drop the agency's colour.
    // Inheriting the row as a unit would fall all the way to platform indigo.
    expect(b.brandColor).toBe('#c1121f')
  })

  it('an empty string inherits, exactly like a NULL — it is what a cleared field posts', async () => {
    const b = await brandingFor(
      stubDb([row(AGENCY, { product_name: 'Northwind Voice' }), row(CLIENT, { product_name: '' })]),
      CLIENT,
      AGENCY
    )
    expect(b.productName).toBe('Northwind Voice')
  })

  it('falls through to the platform when neither row says anything', async () => {
    const b = await brandingFor(stubDb([row(AGENCY), row(CLIENT)]), CLIENT, AGENCY)
    expect(b.productName).toBe(PLATFORM_PRODUCT_NAME)
    expect(b.brandColor).toBe(PLATFORM_BRAND_COLOR)
    expect(b.whiteLabelled).toBe(false)
  })

  it('a colour that is not a hex literal is refused ON READ and falls back', async () => {
    // The column has a CHECK and the action validates, but this value is
    // interpolated into a <style> block — a row that arrived from a dump
    // restore or a DB console must still be unable to reach the stylesheet.
    const b = await brandingFor(
      stubDb([row(CLIENT, { brand_color: 'red;}body{display:none}' })]),
      CLIENT,
      null
    )
    expect(b.brandColor).toBe(PLATFORM_BRAND_COLOR)
  })

  it('a custom domain is NOT inherited — it names one host', async () => {
    const b = await brandingFor(
      stubDb([
        row(AGENCY, { custom_domain: 'voice.northwind.test', custom_domain_verified_at: '2026-01-01' }),
        row(CLIENT, { product_name: 'Client' }),
      ]),
      CLIENT,
      AGENCY
    )
    expect(b.customDomain).toBeNull()
  })

  it('an UNVERIFIED domain does not become the origin of the tenant\'s email links', async () => {
    const b = await brandingFor(
      stubDb([row(CLIENT, { custom_domain: 'claimed.test', custom_domain_verified_at: null })]),
      CLIENT,
      null
    )
    expect(b.customDomain).toBeNull()
  })

  it('a verified domain does', async () => {
    const b = await brandingFor(
      stubDb([row(CLIENT, { custom_domain: 'claimed.test', custom_domain_verified_at: '2026-01-01' })]),
      CLIENT,
      null
    )
    expect(b.customDomain).toBe('claimed.test')
  })

  it('an unverified sending address is never used as the envelope From', async () => {
    const b = await brandingFor(
      stubDb([row(AGENCY, { email_from_address: 'hi@northwind.test', email_sender_verified: false })]),
      CLIENT,
      AGENCY
    )
    expect(b.emailFrom).toBeNull()
  })

  it('a verified one is, and it inherits down to the client', async () => {
    const b = await brandingFor(
      stubDb([row(AGENCY, { email_from_address: 'hi@northwind.test', email_sender_verified: true })]),
      CLIENT,
      AGENCY
    )
    expect(b.emailFrom).toBe('hi@northwind.test')
  })

  it('a database failure degrades to the platform look rather than blanking the app', async () => {
    const boom = {
      from: () => ({
        select: () => ({
          in: () => {
            throw new Error('connection reset')
          },
        }),
      }),
    } as unknown as Db
    const b = await brandingFor(boom, CLIENT, AGENCY)
    expect(b.productName).toBe(PLATFORM_PRODUCT_NAME)
  })
})
