// Twilio number search + purchase + subaccount management (raw REST, same as
// scripts/bootstrap.ts — rule 1 only fences ElevenLabs; Twilio-the-number-vendor
// lives here).
//
// Phase 23: every function still takes its credentials as an argument and holds
// no ambient state. That was already true and is now load-bearing — the caller
// decides whether a call runs as the parent account or as one org's subaccount,
// and getting that wrong is the bug this phase exists to prevent. Resolving which
// credentials an org gets is deliberately NOT here: see lib/twilio-subaccounts.ts,
// which touches the database. This file stays a pure REST layer so it can be
// tested against a fake fetch.

export interface TwilioCreds {
  accountSid: string
  authToken: string
}

export interface AvailableNumber {
  e164: string
  friendly: string
  locality: string | null
  region: string | null
}

const TWILIO_BASE = 'https://api.twilio.com/2010-04-01'

function basicAuth(creds: TwilioCreds) {
  return 'Basic ' + Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString('base64')
}

/** US local voice-capable numbers, optionally filtered by area code. */
export async function searchAvailableNumbers(
  creds: TwilioCreds,
  areaCode: string | null,
  fetchFn: typeof fetch = fetch
): Promise<AvailableNumber[]> {
  const qs = new URLSearchParams({ VoiceEnabled: 'true', PageSize: '10' })
  if (areaCode) qs.set('AreaCode', areaCode)
  const res = await fetchFn(
    `${TWILIO_BASE}/Accounts/${creds.accountSid}/AvailablePhoneNumbers/US/Local.json?${qs}`,
    { headers: { Authorization: basicAuth(creds) } }
  )
  if (!res.ok) throw new Error(`Twilio search → ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return ((json.available_phone_numbers ?? []) as Record<string, string | null>[]).map((n) => ({
    e164: n.phone_number as string,
    friendly: n.friendly_name ?? (n.phone_number as string),
    locality: n.locality ?? null,
    region: n.region ?? null,
  }))
}

/** Buy the number. This starts a monthly charge — callers must pass
 *  numberPurchaseBlocked() first (rule 3). */
export async function purchaseNumber(
  creds: TwilioCreds,
  e164: string,
  fetchFn: typeof fetch = fetch
): Promise<{ twilioSid: string; e164: string }> {
  const res = await fetchFn(`${TWILIO_BASE}/Accounts/${creds.accountSid}/IncomingPhoneNumbers.json`, {
    method: 'POST',
    headers: { Authorization: basicAuth(creds), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ PhoneNumber: e164 }),
  })
  if (!res.ok) throw new Error(`Twilio purchase → ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return { twilioSid: json.sid, e164: json.phone_number }
}

/** Release a just-bought number (stops its billing) when downstream setup fails. */
export async function releaseNumber(
  creds: TwilioCreds,
  twilioSid: string,
  fetchFn: typeof fetch = fetch
): Promise<void> {
  const res = await fetchFn(
    `${TWILIO_BASE}/Accounts/${creds.accountSid}/IncomingPhoneNumbers/${twilioSid}.json`,
    { method: 'DELETE', headers: { Authorization: basicAuth(creds) } }
  )
  if (!res.ok && res.status !== 404) {
    throw new Error(`Twilio release → ${res.status}: ${await res.text()}`)
  }
}

/**
 * Rule 3: buying numbers spends money — every purchase passes these guards
 * server-side (the UI only mirrors them). Returns the reason, or null when
 * the purchase may proceed.
 */
export function numberPurchaseBlocked(state: {
  hasSubscription: boolean
  /** Signup attaches to the agent on buy so it requires one; /numbers assigns
   *  later, so it omits this. Only `false` blocks — undefined passes. */
  hasAgent?: boolean
  existingNumbers: number
  maxNumbers: number
}): string | null {
  if (!state.hasSubscription) return 'Pick a plan before claiming a number.'
  if (state.hasAgent === false) return 'Create your agent before claiming a number.'
  // Per-plan cap (Phase 13, replaces the one-per-org rule). Rule 3: this is the
  // money guard; the /numbers UI mirrors it but the action is the gate.
  if (state.existingNumbers >= state.maxNumbers) {
    const plural = state.maxNumbers === 1 ? '' : 's'
    return `Your plan allows up to ${state.maxNumbers} phone number${plural}. Upgrade for more.`
  }
  return null
}


// ---------------------------------------------------------------------------
// Phase 23: subaccounts (architecture §12 Q3)
// ---------------------------------------------------------------------------

export interface Subaccount {
  sid: string
  authToken: string
  /** Twilio's own values: active | suspended | closed. */
  status: string
}

/**
 * Create a subaccount under the authenticating (parent) account.
 *
 * Twilio returns the new subaccount's auth_token in this response and nowhere
 * else that is cheaper — it can be re-fetched later with fetchSubaccount(), but
 * only by the parent. Callers must seal it before it touches storage.
 */
export async function createSubaccount(
  parent: TwilioCreds,
  friendlyName: string,
  fetchFn: typeof fetch = fetch
): Promise<Subaccount> {
  const res = await fetchFn(`${TWILIO_BASE}/Accounts.json`, {
    method: 'POST',
    headers: { Authorization: basicAuth(parent), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ FriendlyName: friendlyName }),
  })
  if (!res.ok) throw new Error(`Twilio subaccount create → ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return { sid: json.sid, authToken: json.auth_token, status: json.status }
}

/** Re-read a subaccount (including its current auth_token). Parent creds only. */
export async function fetchSubaccount(
  parent: TwilioCreds,
  subaccountSid: string,
  fetchFn: typeof fetch = fetch
): Promise<Subaccount> {
  const res = await fetchFn(`${TWILIO_BASE}/Accounts/${subaccountSid}.json`, {
    headers: { Authorization: basicAuth(parent) },
  })
  if (!res.ok) throw new Error(`Twilio subaccount fetch → ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return { sid: json.sid, authToken: json.auth_token, status: json.status }
}

/**
 * Move an already-purchased number into another account.
 *
 * Twilio: "You must use your main account's credentials when making the API
 * request to transfer a phone number." So `parent` is not a convenience here —
 * a subaccount's own token cannot perform this call, which is why the backfill
 * script is the only caller and why it is not reachable from a server action.
 *
 * Caveats that are not ours to fix, recorded so nobody rediscovers them at 2am:
 * voice/SMS webhook configuration may not survive the move, and any toll-free
 * verification, A2P registration or TrustHub enrollment must be resubmitted in
 * the destination account.
 */
export async function transferNumber(
  parent: TwilioCreds,
  fromAccountSid: string,
  numberSid: string,
  toAccountSid: string,
  fetchFn: typeof fetch = fetch
): Promise<void> {
  const res = await fetchFn(
    `${TWILIO_BASE}/Accounts/${fromAccountSid}/IncomingPhoneNumbers/${numberSid}.json`,
    {
      method: 'POST',
      headers: { Authorization: basicAuth(parent), 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ AccountSid: toAccountSid }),
    }
  )
  if (!res.ok) throw new Error(`Twilio number transfer → ${res.status}: ${await res.text()}`)
}

/**
 * Suspend a subaccount — the offboarding action.
 *
 * Note what this deliberately cannot do: Twilio also accepts Status=closed, and
 * closing "will release all phone numbers assigned to it" irreversibly. That
 * value is not exposed here, and 0019's check constraint refuses to record it,
 * so losing a customer's number needs more than calling the obvious function.
 */
export async function suspendSubaccount(
  parent: TwilioCreds,
  subaccountSid: string,
  fetchFn: typeof fetch = fetch
): Promise<void> {
  const res = await fetchFn(`${TWILIO_BASE}/Accounts/${subaccountSid}.json`, {
    method: 'POST',
    headers: { Authorization: basicAuth(parent), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ Status: 'suspended' }),
  })
  if (!res.ok) throw new Error(`Twilio subaccount suspend → ${res.status}: ${await res.text()}`)
}
