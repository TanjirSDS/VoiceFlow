// Phase 23 acceptance: prove against LIVE Twilio that one org's credentials
// cannot touch another org's numbers.
//
//   npm run verify-isolation           # free: subaccounts only, buys nothing
//   npm run verify-isolation -- --buy  # SPENDS MONEY: buys one number per org
//
// Needs ONLY TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN (the PARENT account), in
// .env.local or the environment. It deliberately does NOT go through getEnv():
// that validates the whole app schema, so proving a Twilio access-control claim
// would fail on a missing Stripe key. This script touches no database and no other
// provider, so the narrow read is the honest one.
//
// Everything it creates is torn down at the end: subaccounts are SUSPENDED, never
// closed, because closing releases numbers irreversibly.
//
// Why the default buys nothing: the security claim is about ACCESS, and access is
// provable without owning anything. Asking subaccount A to list subaccount B's
// IncomingPhoneNumbers is refused by Twilio whether or not B has any — the refusal
// is the result. --buy additionally proves the placement half (each org's number
// really does land in its own subaccount) and costs ~$1.15/number/month.
import { config } from 'dotenv'
config({ path: '.env.local' })

import {
  createSubaccount,
  purchaseNumber,
  releaseNumber,
  searchAvailableNumbers,
  suspendSubaccount,
  type TwilioCreds,
} from '../apps/web/lib/numbers'

const BUY = process.argv.includes('--buy')
const BASE = 'https://api.twilio.com/2010-04-01'

let passed = 0
let failed = 0

function check(label: string, ok: boolean, detail = '') {
  if (ok) {
    passed++
    console.log(`    ok   ${label}${detail ? ` (${detail})` : ''}`)
  } else {
    failed++
    console.error(`    FAIL ${label}${detail ? ` (${detail})` : ''}`)
  }
}

function basicAuth(c: TwilioCreds) {
  return 'Basic ' + Buffer.from(`${c.accountSid}:${c.authToken}`).toString('base64')
}

/** Raw GET so we can observe the STATUS rather than a thrown error. */
async function status(creds: TwilioCreds, path: string): Promise<number> {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: basicAuth(creds) } })
  return res.status
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(
      `${name} is not set. Put the PARENT account's credentials in .env.local:\n` +
        '  TWILIO_ACCOUNT_SID=ACxxxxxxxx...\n  TWILIO_AUTH_TOKEN=...\n' +
        'Nothing else is needed for this check.'
    )
    process.exit(2)
  }
  return v
}

async function main() {
  const parent: TwilioCreds = {
    accountSid: requireEnv('TWILIO_ACCOUNT_SID'),
    authToken: requireEnv('TWILIO_AUTH_TOKEN'),
  }
  const stamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const created: string[] = []
  const bought: { creds: TwilioCreds; sid: string; e164: string }[] = []

  try {
    console.log(`==> parent account ${parent.accountSid}`)
    console.log('==> creating two throwaway subaccounts (org A, org B)')
    const a = await createSubaccount(parent, `zz-isolation-check-A-${stamp}`)
    const b = await createSubaccount(parent, `zz-isolation-check-B-${stamp}`)
    created.push(a.sid, b.sid)
    const credsA: TwilioCreds = { accountSid: a.sid, authToken: a.authToken }
    const credsB: TwilioCreds = { accountSid: b.sid, authToken: b.authToken }
    console.log(`    org A = ${a.sid}`)
    console.log(`    org B = ${b.sid}`)

    console.log('==> control: each org can reach its OWN account')
    check('A reads its own numbers', (await status(credsA, `/Accounts/${a.sid}/IncomingPhoneNumbers.json`)) === 200)
    check('B reads its own numbers', (await status(credsB, `/Accounts/${b.sid}/IncomingPhoneNumbers.json`)) === 200)

    // THE test. A 2xx here means the phase failed and tenants are not isolated.
    console.log('==> the isolation claim: A must NOT reach B')
    const aToB = await status(credsA, `/Accounts/${b.sid}/IncomingPhoneNumbers.json`)
    check("A cannot list B's numbers", aToB >= 400, `HTTP ${aToB}`)
    const bToA = await status(credsB, `/Accounts/${a.sid}/IncomingPhoneNumbers.json`)
    check("B cannot list A's numbers", bToA >= 400, `HTTP ${bToA}`)
    const aToParent = await status(credsA, `/Accounts/${parent.accountSid}/IncomingPhoneNumbers.json`)
    check('A cannot reach the PARENT account', aToParent >= 400, `HTTP ${aToParent}`)

    console.log('==> the asymmetry we rely on: parent CAN reach both (that is why it never leaves the server)')
    check('parent reads A', (await status(parent, `/Accounts/${a.sid}/IncomingPhoneNumbers.json`)) === 200)
    check('parent reads B', (await status(parent, `/Accounts/${b.sid}/IncomingPhoneNumbers.json`)) === 200)

    if (BUY) {
      console.log('==> --buy: purchasing one number per org (THIS SPENDS MONEY)')
      for (const [name, creds] of [['A', credsA], ['B', credsB]] as const) {
        const avail = await searchAvailableNumbers(creds, null)
        if (!avail.length) throw new Error(`no numbers available to buy for org ${name}`)
        const n = await purchaseNumber(creds, avail[0].e164)
        bought.push({ creds, sid: n.twilioSid, e164: n.e164 })
        console.log(`    org ${name} bought ${n.e164} (${n.twilioSid})`)
      }
      const [numA, numB] = bought

      console.log('==> placement: each number lives in its OWN subaccount')
      check("A's number is in A", (await status(credsA, `/Accounts/${a.sid}/IncomingPhoneNumbers/${numA.sid}.json`)) === 200)
      check("B's number is in B", (await status(credsB, `/Accounts/${b.sid}/IncomingPhoneNumbers/${numB.sid}.json`)) === 200)

      console.log("==> and A cannot touch B's actual number")
      const readOther = await status(credsA, `/Accounts/${b.sid}/IncomingPhoneNumbers/${numB.sid}.json`)
      check("A cannot READ B's number", readOther >= 400, `HTTP ${readOther}`)
      // The destructive one: this is the exact call the release path makes.
      const del = await fetch(`${BASE}/Accounts/${b.sid}/IncomingPhoneNumbers/${numB.sid}.json`, {
        method: 'DELETE',
        headers: { Authorization: basicAuth(credsA) },
      })
      check("A cannot RELEASE B's number", del.status >= 400, `HTTP ${del.status}`)
      const survived = await status(credsB, `/Accounts/${b.sid}/IncomingPhoneNumbers/${numB.sid}.json`)
      check("B's number survived A's attempt", survived === 200, `HTTP ${survived}`)
    } else {
      console.log('==> (skipping the purchase half — re-run with --buy to prove placement too)')
    }
  } finally {
    // Always tear down, even on failure: a leaked active subaccount is billable.
    for (const b of bought) {
      await releaseNumber(b.creds, b.sid).then(
        () => console.log(`    released ${b.e164}`),
        (e) => console.error(`    could NOT release ${b.e164} — do it by hand:`, (e as Error).message)
      )
    }
    for (const sid of created) {
      // Suspend, never close: closing releases numbers and cannot be undone.
      await suspendSubaccount(
        { accountSid: process.env.TWILIO_ACCOUNT_SID!, authToken: process.env.TWILIO_AUTH_TOKEN! },
        sid
      ).then(
        () => console.log(`    suspended ${sid}`),
        (e) => console.error(`    could NOT suspend ${sid} — do it by hand:`, (e as Error).message)
      )
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed) {
    console.error('ISOLATION NOT PROVEN — do not ship Phase 23 on this account')
    process.exit(1)
  }
  console.log('PASS — one org\'s credentials cannot reach another org\'s numbers')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
