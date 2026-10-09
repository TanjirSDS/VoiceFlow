// Adopt a number the company ALREADY owns in the parent Twilio account into one org:
// detach it from any SIP trunk, move it into the org's subaccount, import it into the
// voice engine, and record it in phone_numbers.
//
//   npm run adopt-number -- --org <uuid> --number +16202992485            # dry run
//   npm run adopt-number -- --org <uuid> --number +16202992485 --apply     # do it
//
// Operator-only on purpose (service-role DB + parent Twilio creds): it skips the
// Stripe/plan-cap gate that the Numbers page enforces, and detaching a trunk takes a
// number off whatever was answering it. Dry run is the default for that reason.
//
// Order matters: detach -> transfer -> engine import -> insert. If a later step fails
// the number is left where the earlier steps put it and the failure message says how
// to undo; re-running resumes (each step checks current state first).
import { config } from 'dotenv'
config({ path: '.env.local' })

import { getEnv, open, seal, serviceClient } from '@voiceflow/db'
import { ElevenLabsEngine } from '@voiceflow/engine'

import { createSubaccount, transferNumber, type TwilioCreds } from '../apps/web/lib/numbers'

const arg = (name: string) => {
  const i = process.argv.indexOf(name)
  return i > 0 ? process.argv[i + 1] : undefined
}
const apply = process.argv.includes('--apply')
const orgId = arg('--org')
const e164 = arg('--number')

const BASE = 'https://api.twilio.com/2010-04-01'
const auth = (c: TwilioCreds) => 'Basic ' + Buffer.from(`${c.accountSid}:${c.authToken}`).toString('base64')

async function twilio(c: TwilioCreds, url: string, method = 'GET') {
  const res = await fetch(url, { method, headers: { Authorization: auth(c) } })
  if (!res.ok) throw new Error(`Twilio ${method} ${url} → ${res.status}: ${await res.text()}`)
  return method === 'DELETE' ? null : res.json()
}

interface Incoming {
  sid: string
  phone_number: string
  trunk_sid: string | null
}

async function findNumber(c: TwilioCreds, account: string): Promise<Incoming | null> {
  const q = new URLSearchParams({ PhoneNumber: e164! })
  const body = await twilio(c, `${BASE}/Accounts/${account}/IncomingPhoneNumbers.json?${q}`)
  return (body.incoming_phone_numbers?.[0] as Incoming | undefined) ?? null
}

async function main() {
  const env = getEnv()
  const parent: TwilioCreds = { accountSid: env.TWILIO_ACCOUNT_SID, authToken: env.TWILIO_AUTH_TOKEN }
  const db = serviceClient()

  if (!orgId) {
    // No --org: list orgs so the operator can find the id to pass.
    const { data: orgs } = await db.from('orgs').select('id, name, plan_id').order('created_at')
    for (const o of orgs ?? []) console.log(`${o.id}  ${o.name}  (${o.plan_id})`)
    return console.log('\nnow re-run with --org <id> --number +1XXXXXXXXXX')
  }
  if (!e164 || !/^\+1\d{10}$/.test(e164)) {
    throw new Error('usage: adopt-number --org <uuid> --number +1XXXXXXXXXX [--apply]')
  }

  const { data: org } = await db.from('orgs').select('id, name').eq('id', orgId).maybeSingle()
  if (!org) throw new Error(`no org ${orgId}`)

  const { data: already } = await db.from('phone_numbers').select('id, status').eq('e164', e164).maybeSingle()
  if (already) throw new Error(`${e164} already has a phone_numbers row (${already.status}) — nothing to do`)

  const { data: subRow } = await db
    .from('org_twilio_subaccounts')
    .select('subaccount_sid, auth_token_sealed, status')
    .eq('org_id', orgId)
    .maybeSingle()

  // Where is it now? Parent account first; if a previous run already transferred it,
  // it is in the org's subaccount instead.
  let where = parent.accountSid
  let num = await findNumber(parent, parent.accountSid)
  if (!num && subRow) {
    num = await findNumber(parent, subRow.subaccount_sid) // parent creds can read subaccounts
    where = subRow.subaccount_sid
  }
  if (!num) throw new Error(`${e164} is in neither the parent account nor the org's subaccount`)

  console.log(`org        ${orgId} (${org.name})`)
  console.log(`number     ${e164}  ${num.sid}  in account ${where}`)
  console.log(`trunk      ${num.trunk_sid ?? 'none'}`)
  console.log(`subaccount ${subRow ? subRow.subaccount_sid : 'will be created'}`)
  if (!apply) return console.log('\n(dry run — pass --apply to do it)')

  if (num.trunk_sid) {
    await twilio(parent, `https://trunking.twilio.com/v1/Trunks/${num.trunk_sid}/PhoneNumbers/${num.sid}`, 'DELETE')
    console.log(`detached from trunk ${num.trunk_sid}  (undo: POST trunking.twilio.com/v1/Trunks/${num.trunk_sid}/PhoneNumbers PhoneNumberSid=${num.sid})`)
  }

  let sub: TwilioCreds
  if (subRow) {
    if (subRow.status !== 'active') throw new Error(`org subaccount is ${subRow.status}`)
    sub = { accountSid: subRow.subaccount_sid, authToken: open(subRow.auth_token_sealed, orgId) }
  } else {
    const made = await createSubaccount(parent, `${org.name} (${orgId})`)
    const { error } = await db
      .from('org_twilio_subaccounts')
      .insert({ org_id: orgId, subaccount_sid: made.sid, auth_token_sealed: seal(made.authToken, orgId) })
    if (error) throw new Error(`created subaccount ${made.sid} but could not record it: ${error.message}`)
    sub = { accountSid: made.sid, authToken: made.authToken }
  }

  if (where !== sub.accountSid) {
    await transferNumber(parent, where, num.sid, sub.accountSid)
    console.log(`transferred to ${sub.accountSid}`)
  }

  const engine = new ElevenLabsEngine({
    apiKey: env.ELEVENLABS_API_KEY,
    webhookSecret: env.ELEVENLABS_WEBHOOK_SECRET,
  })
  const { providerNumberId } = await engine.importNumber(e164, sub)
  console.log(`imported into the voice engine: ${providerNumberId}`)

  const { error } = await db.from('phone_numbers').insert({
    org_id: orgId,
    e164,
    twilio_sid: num.sid,
    twilio_account_sid: sub.accountSid,
    provider_number_id: providerNumberId,
    status: 'active',
  })
  if (error) throw new Error(`imported but NOT recorded in phone_numbers: ${error.message}`)
  console.log('done — it now shows on the Numbers page, unassigned')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
