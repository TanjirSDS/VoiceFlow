// Phase 23: which Twilio credentials an org's number operations run as.
//
// Split deliberately from lib/numbers.ts: that file is a pure REST layer with no
// ambient state, this one reads the database and holds the policy. The policy is
// the whole phase, so it is stated once, here:
//
//   - Every search, purchase and release for an org runs as THAT ORG's subaccount.
//   - Only provisioning and transfers run as the parent, because Twilio requires it.
//   - A number bought before this phase still lives in the parent account until the
//     backfill moves it, so the account a number lives in is read from the row, not
//     assumed. Getting this wrong does not fail loudly — it 404s on a release and
//     leaves a number billing forever.
import 'server-only'

import { getEnv, open, seal, serviceClient } from '@voiceflow/db'

import {
  createSubaccount,
  fetchSubaccount,
  suspendSubaccount,
  type TwilioCreds,
} from './numbers'

/** The shared account that owns every subaccount. Provisioning and transfers only. */
export function parentCreds(): TwilioCreds {
  const env = getEnv()
  return { accountSid: env.TWILIO_ACCOUNT_SID, authToken: env.TWILIO_AUTH_TOKEN }
}

interface SubaccountRow {
  org_id: string
  subaccount_sid: string
  auth_token_sealed: string
  status: string
}

async function readRow(orgId: string): Promise<SubaccountRow | null> {
  // serviceClient, not userClient: 0019 grants anon/authenticated nothing on this
  // table, so a user-scoped client reads zero rows by design.
  const { data, error } = await serviceClient()
    .from('org_twilio_subaccounts')
    .select('org_id, subaccount_sid, auth_token_sealed, status')
    .eq('org_id', orgId)
    .maybeSingle()
  if (error) throw new Error(`subaccount lookup failed: ${error.message}`)
  return (data as SubaccountRow | null) ?? null
}

function unsealRow(row: SubaccountRow): TwilioCreds {
  // AAD is the org id — see packages/db/src/crypto.ts. If this throws, the row was
  // moved between orgs or the key changed; both are worth failing loudly for.
  return { accountSid: row.subaccount_sid, authToken: open(row.auth_token_sealed, row.org_id) }
}

/**
 * The org's own Twilio credentials, provisioning a subaccount on first use.
 *
 * First use is usually the first number purchase, which is also the first moment
 * the org has any reason to exist at Twilio — so provisioning here rather than at
 * signup avoids creating a subaccount for every trial account that never buys
 * anything, and keeps us well clear of the documented 1000-subaccount ceiling.
 */
export async function orgTwilioCreds(orgId: string, orgName?: string): Promise<TwilioCreds> {
  const existing = await readRow(orgId)
  if (existing) {
    if (existing.status !== 'active') {
      throw new Error(`org ${orgId} has a ${existing.status} Twilio subaccount`)
    }
    return unsealRow(existing)
  }
  return provision(orgId, orgName)
}

async function provision(orgId: string, orgName?: string): Promise<TwilioCreds> {
  const parent = parentCreds()
  // FriendlyName is what a human sees in the Twilio console at 3am. The org id is
  // the part that is actually unambiguous, so it goes in regardless of the name.
  const created = await createSubaccount(parent, `${orgName ?? 'org'} (${orgId})`)

  const { error } = await serviceClient()
    .from('org_twilio_subaccounts')
    .insert({
      org_id: orgId,
      subaccount_sid: created.sid,
      auth_token_sealed: seal(created.authToken, orgId),
    })

  if (error) {
    // Two concurrent first-purchases for the same org both reached Twilio, and we
    // lost. The winner's subaccount is the real one; ours is an orphan that would
    // otherwise sit active and billable under the parent forever, so suspend it.
    // (org_id is the primary key, which is what makes this detectable at all.)
    const winner = await readRow(orgId)
    if (!winner) throw new Error(`subaccount insert failed for org ${orgId}: ${error.message}`)
    await suspendSubaccount(parent, created.sid).catch((e) =>
      console.error(`orphan subaccount ${created.sid} left active — suspend it manually:`, e)
    )
    return unsealRow(winner)
  }

  return { accountSid: created.sid, authToken: created.authToken }
}

/**
 * The credentials that can actually act on ONE number.
 *
 * This function deliberately CANNOT return parent credentials, and that is the
 * whole security argument of Phase 23. The reason is worth spelling out, because
 * the obvious convenience here is a cross-tenant number-deletion bug:
 *
 *   phone_numbers carries `phone_numbers_org_rw ... for all to authenticated`
 *   (0004), and nothing has revoked it — so a member holds UPDATE on their own
 *   org's number rows and PostgREST serves it. An attacker who owns any org can
 *   PATCH their own row to twilio_sid = <another org's PN sid>, keeping org_id
 *   their own so the RLS check still passes, then click Release. If this function
 *   answered with the parent account's credentials, the release would SUCCEED —
 *   the parent can reach every subaccount — and another tenant would silently
 *   lose their phone number, irreversibly.
 *
 *   Answering with the org's own subaccount credentials instead makes the same
 *   attack fail at Twilio: "You can't use a subaccount's credentials to access
 *   resources in your main Twilio account or any other subaccounts." That is the
 *   isolation this phase was asked to buy, and it only pays out if the privileged
 *   credential is unreachable from a user-facing path.
 *
 * `twilioAccountSid` is phone_numbers.twilio_account_sid. Null means the number
 * predates this phase and is still in the shared parent account: it is refused
 * rather than released with parent credentials. Run the backfill first — that is
 * an operator action with service-role access, not a tenant-reachable one.
 */
export async function credsForNumber(
  orgId: string,
  twilioAccountSid: string | null
): Promise<TwilioCreds> {
  if (!twilioAccountSid) {
    throw new Error(
      `number for org ${orgId} is still in the shared parent account — ` +
        'run `npm run migrate-numbers -- --apply` before releasing it'
    )
  }
  const creds = await orgTwilioCreds(orgId)
  if (creds.accountSid !== twilioAccountSid) {
    // The number is in a subaccount that is not this org's. Either the backfill
    // recorded the wrong owner or a number moved: refuse rather than reach for
    // parent credentials, which WOULD succeed and would be a cross-tenant write.
    throw new Error(
      `number lives in ${twilioAccountSid} but org ${orgId} owns ${creds.accountSid} — refusing`
    )
  }
  return creds
}

/** Re-read the live token from Twilio and re-seal it. Recovery path for a rotated
 *  token or a re-keyed CREDENTIAL_ENCRYPTION_KEY: the parent can always re-fetch,
 *  so a lost key is not a lost subaccount. */
export async function resealFromTwilio(orgId: string): Promise<void> {
  const row = await readRow(orgId)
  if (!row) throw new Error(`org ${orgId} has no subaccount to reseal`)
  const live = await fetchSubaccount(parentCreds(), row.subaccount_sid)
  const { error } = await serviceClient()
    .from('org_twilio_subaccounts')
    .update({ auth_token_sealed: seal(live.authToken, orgId), updated_at: new Date().toISOString() })
    .eq('org_id', orgId)
  if (error) throw new Error(`reseal failed for org ${orgId}: ${error.message}`)
}
