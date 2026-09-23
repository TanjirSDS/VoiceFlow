import { describe, expect, it } from 'vitest'
import {
  createSubaccount,
  numberPurchaseBlocked,
  purchaseNumber,
  searchAvailableNumbers,
  suspendSubaccount,
  transferNumber,
} from './numbers'

const CREDS = { accountSid: 'ACtest', authToken: 'token' }

function fakeFetch(status: number, body: unknown): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })) as typeof fetch
}

describe('numberPurchaseBlocked (rule 3: money-loop guards)', () => {
  const ready = { hasSubscription: true, hasAgent: true, existingNumbers: 0, maxNumbers: 3 }

  it('allows while under the plan cap', () => {
    expect(numberPurchaseBlocked(ready)).toBeNull()
    expect(numberPurchaseBlocked({ ...ready, existingNumbers: 2 })).toBeNull()
  })

  it('blocks without a subscription — no pay, no spend', () => {
    expect(numberPurchaseBlocked({ ...ready, hasSubscription: false })).toMatch(/plan/i)
  })

  it('blocks when hasAgent is explicitly false (signup attaches on buy)', () => {
    expect(numberPurchaseBlocked({ ...ready, hasAgent: false })).toMatch(/agent/i)
  })

  it('allows when hasAgent is omitted (/numbers assigns later)', () => {
    expect(numberPurchaseBlocked({ hasSubscription: true, existingNumbers: 0, maxNumbers: 1 })).toBeNull()
  })

  it('caps at plan max_numbers, with correct pluralization', () => {
    expect(numberPurchaseBlocked({ ...ready, existingNumbers: 3 })).toMatch(/up to 3 phone numbers/i)
    expect(numberPurchaseBlocked({ ...ready, maxNumbers: 1, existingNumbers: 1 })).toMatch(/up to 1 phone number\b/i)
  })
})

describe('searchAvailableNumbers', () => {
  it('maps the Twilio payload and passes AreaCode through', async () => {
    let calledUrl = ''
    const f: typeof fetch = async (url) => {
      calledUrl = String(url)
      return new Response(
        JSON.stringify({
          available_phone_numbers: [
            { phone_number: '+14155551234', friendly_name: '(415) 555-1234', locality: 'San Francisco', region: 'CA' },
          ],
        }),
        { status: 200 }
      )
    }
    const nums = await searchAvailableNumbers(CREDS, '415', f)
    expect(calledUrl).toContain('AreaCode=415')
    expect(calledUrl).toContain('VoiceEnabled=true')
    expect(nums).toEqual([
      { e164: '+14155551234', friendly: '(415) 555-1234', locality: 'San Francisco', region: 'CA' },
    ])
  })

  it('throws on a Twilio error status', async () => {
    await expect(searchAvailableNumbers(CREDS, '415', fakeFetch(401, {}))).rejects.toThrow('401')
  })
})

describe('purchaseNumber', () => {
  it('returns the sid Twilio assigns', async () => {
    const res = await purchaseNumber(CREDS, '+14155551234', fakeFetch(201, { sid: 'PN123', phone_number: '+14155551234' }))
    expect(res).toEqual({ twilioSid: 'PN123', e164: '+14155551234' })
  })

  it('throws when the number was taken', async () => {
    await expect(purchaseNumber(CREDS, '+14155551234', fakeFetch(400, { message: 'not available' }))).rejects.toThrow(
      '400'
    )
  })
})


// Phase 23 — subaccounts. These assert the two things that are dangerous to get
// wrong: which account a call is aimed at, and whose credentials sign it.
const PARENT = { accountSid: 'ACparent', authToken: 'parent-token' }

/** Captures the request so a test can assert on URL, body and Authorization. */
function capture(status: number, body: unknown) {
  const seen: { url: string; init: RequestInit | undefined }[] = []
  const f: typeof fetch = async (url, init) => {
    seen.push({ url: String(url), init })
    return new Response(JSON.stringify(body), { status })
  }
  return { f, seen }
}

function authOf(init: RequestInit | undefined): string {
  const h = (init?.headers ?? {}) as Record<string, string>
  return Buffer.from(h.Authorization.replace('Basic ', ''), 'base64').toString('utf8')
}

describe('createSubaccount', () => {
  it('creates under the parent and returns the token Twilio mints', async () => {
    const { f, seen } = capture(201, { sid: 'ACchild', auth_token: 'child-token', status: 'active' })
    const sub = await createSubaccount(PARENT, 'Acme (org-1)', f)
    expect(seen[0].url).toBe('https://api.twilio.com/2010-04-01/Accounts.json')
    expect(String(seen[0].init?.body)).toContain('FriendlyName=Acme')
    expect(authOf(seen[0].init)).toBe('ACparent:parent-token')
    expect(sub).toEqual({ sid: 'ACchild', authToken: 'child-token', status: 'active' })
  })
})

describe('transferNumber', () => {
  it('targets the SOURCE account and signs with the PARENT credentials', async () => {
    // Twilio: "You must use your main account's credentials when making the API
    // request to transfer a phone number." A subaccount token here fails, so this
    // assertion is the contract, not a detail.
    const { f, seen } = capture(200, { sid: 'PN1' })
    await transferNumber(PARENT, 'ACparent', 'PN1', 'ACchild', f)
    expect(seen[0].url).toBe(
      'https://api.twilio.com/2010-04-01/Accounts/ACparent/IncomingPhoneNumbers/PN1.json'
    )
    expect(String(seen[0].init?.body)).toBe('AccountSid=ACchild')
    expect(authOf(seen[0].init)).toBe('ACparent:parent-token')
  })

  it('throws when Twilio refuses the move', async () => {
    const { f } = capture(403, { message: 'not permitted' })
    await expect(transferNumber(PARENT, 'ACa', 'PN1', 'ACb', f)).rejects.toThrow('403')
  })
})

describe('suspendSubaccount', () => {
  it('suspends and never closes — closing would release the org\'s numbers', async () => {
    const { f, seen } = capture(200, { sid: 'ACchild', status: 'suspended' })
    await suspendSubaccount(PARENT, 'ACchild', f)
    expect(String(seen[0].init?.body)).toBe('Status=suspended')
    expect(String(seen[0].init?.body)).not.toContain('closed')
  })
})
