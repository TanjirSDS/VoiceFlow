// Phase 23 backfill: move every number bought before this phase out of the shared
// parent account and into its owning org's subaccount.
//
//   npm run migrate-numbers                 # dry run — prints the plan, changes nothing
//   npm run migrate-numbers -- --apply      # actually moves numbers
//   npm run migrate-numbers -- --apply --org <uuid>   # one org at a time
//
// Dry run is the default on purpose. This script moves real phone numbers between
// real Twilio accounts and the move is not free: per Twilio, "Any Toll-Free number
// verifications, A2P registrations or Trust Hub enrollments will need to be
// resubmitted", and webhook configuration may not survive. Nobody should discover
// that by running the obvious command.
//
// Idempotent: a number is "done" when phone_numbers.twilio_account_sid is set, so
// a re-run after a partial failure picks up exactly what is left.
import { config } from 'dotenv'
config({ path: '.env.local' })

import { getEnv, seal, serviceClient } from '@voiceflow/db'

import {
  createSubaccount,
  transferNumber,
  type TwilioCreds,
} from '../apps/web/lib/numbers'

const apply = process.argv.includes('--apply')
const orgFilter = process.argv[process.argv.indexOf('--org') + 1]
const onlyOrg = process.argv.includes('--org') ? orgFilter : null

interface Pending {
  id: string
  org_id: string
  e164: string
  twilio_sid: string
}

async function main() {
  const env = getEnv()
  // Transfers REQUIRE the main account's credentials — a subaccount token cannot
  // move a number, even its own. This is the one place parent creds are correct.
  const parent: TwilioCreds = {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
  }
  const db = serviceClient()

  let q = db
    .from('phone_numbers')
    .select('id, org_id, e164, twilio_sid')
    .is('twilio_account_sid', null)
    .not('twilio_sid', 'is', null)
    .neq('status', 'released')
  if (onlyOrg) q = q.eq('org_id', onlyOrg)

  const { data, error } = await q
  if (error) throw new Error(`could not list numbers: ${error.message}`)
  const pending = (data ?? []) as Pending[]

  if (!pending.length) {
    console.log('nothing to migrate — every active Twilio number already records its account')
    return
  }

  const byOrg = new Map<string, Pending[]>()
  for (const n of pending) byOrg.set(n.org_id, [...(byOrg.get(n.org_id) ?? []), n])

  console.log(
    `${pending.length} number(s) across ${byOrg.size} org(s) still in the parent account ` +
      `${parent.accountSid}\n` + (apply ? '' : '(dry run — pass --apply to move them)\n')
  )

  let moved = 0
  const failures: string[] = []

  for (const [orgId, numbers] of byOrg) {
    const { data: org } = await db.from('orgs').select('name').eq('id', orgId).maybeSingle()
    const orgName = (org as { name?: string } | null)?.name ?? 'org'

    // Reuse the org's subaccount if it already has one — orgs that bought a number
    // after Phase 23 shipped will, and creating a second would split their numbers
    // across two accounts, which is worse than not migrating at all.
    const { data: existing } = await db
      .from('org_twilio_subaccounts')
      .select('subaccount_sid')
      .eq('org_id', orgId)
      .maybeSingle()

    let subSid = (existing as { subaccount_sid?: string } | null)?.subaccount_sid ?? null

    console.log(`org ${orgId} (${orgName}) — ${numbers.length} number(s)`)
    for (const n of numbers) console.log(`    ${n.e164}  ${n.twilio_sid}`)

    if (!apply) {
      console.log(`    → would ${subSid ? `use existing subaccount ${subSid}` : 'create a subaccount'}\n`)
      continue
    }

    if (!subSid) {
      try {
        const created = await createSubaccount(parent, `${orgName} (${orgId})`)
        const { error: insErr } = await db.from('org_twilio_subaccounts').insert({
          org_id: orgId,
          subaccount_sid: created.sid,
          auth_token_sealed: seal(created.authToken, orgId),
        })
        if (insErr) throw new Error(insErr.message)
        subSid = created.sid
        console.log(`    created subaccount ${subSid}`)
      } catch (e) {
        failures.push(`org ${orgId}: subaccount creation failed — ${(e as Error).message}`)
        continue
      }
    }

    for (const n of numbers) {
      try {
        await transferNumber(parent, parent.accountSid, n.twilio_sid, subSid)
        // Record only AFTER Twilio confirms. The reverse order would mark a number
        // migrated that is still in the parent account, and the next run would skip
        // it forever — the row is the only memory this script has.
        const { error: updErr } = await db
          .from('phone_numbers')
          .update({ twilio_account_sid: subSid })
          .eq('id', n.id)
        if (updErr) throw new Error(`transferred but NOT recorded: ${updErr.message}`)
        moved++
        console.log(`    moved ${n.e164} → ${subSid}`)
      } catch (e) {
        failures.push(`${n.e164} (${n.twilio_sid}): ${(e as Error).message}`)
        console.error(`    FAILED ${n.e164}: ${(e as Error).message}`)
      }
    }
    console.log('')
  }

  if (apply) {
    console.log(`moved ${moved}/${pending.length}`)
    console.log(
      'Reminder: toll-free verifications, A2P registrations and TrustHub enrollments ' +
        'must be resubmitted in the destination subaccount, and voice webhook config ' +
        'should be spot-checked on a moved number before you call this done.'
    )
  }
  if (failures.length) {
    console.error(`\n${failures.length} failure(s):`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
