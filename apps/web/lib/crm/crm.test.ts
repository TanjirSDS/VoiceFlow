import { beforeAll, describe, expect, it, vi } from 'vitest'

// getEnv() parses the whole schema on first call, so the env has to be complete
// before anything imports it. Same block the other suites use.
beforeAll(() => {
  Object.assign(process.env, {
    ELEVENLABS_API_KEY: 'x',
    ELEVENLABS_WEBHOOK_SECRET: 'x',
    TWILIO_ACCOUNT_SID: 'ACparent',
    TWILIO_AUTH_TOKEN: 'parent-token',
    CREDENTIAL_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
    DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    POSTGREST_URL: 'http://127.0.0.1:54321',
    POSTGREST_JWT_SECRET: 'test-postgrest-jwt-secret-at-least-32-chars',
    BETTER_AUTH_SECRET: 'test-better-auth-secret-at-least-32-chars',
    STRIPE_SECRET_KEY: 'x',
    STRIPE_WEBHOOK_SECRET: 'x',
    HUBSPOT_CLIENT_ID: 'hs-client',
    HUBSPOT_CLIENT_SECRET: 'hs-secret',
  })
})

vi.mock('server-only', () => ({}))

const ORG = '11111111-1111-1111-1111-111111111111'

// ── the phone-number strip ───────────────────────────────────────────────────
//
// The highest-consequence line in the integration. HubSpot's search indexes
// "the area code and local number" and its docs say to leave the country code
// out; we store E.164. Get this wrong and every search misses, which does not
// look like a failure — it looks like a working integration quietly creating a
// duplicate contact per call.
describe('hubspotSearchNumber', () => {
  it('strips the +1 country code from NANP numbers', async () => {
    const { hubspotSearchNumber } = await import('./hubspot')
    expect(hubspotSearchNumber('+15550104477')).toBe('5550104477')
    expect(hubspotSearchNumber('+1 (555) 010-4477')).toBe('5550104477')
  })

  it('leaves a bare 10-digit number alone', async () => {
    const { hubspotSearchNumber } = await import('./hubspot')
    expect(hubspotSearchNumber('5550104477')).toBe('5550104477')
  })

  it('never returns the leading + that the search would choke on', async () => {
    const { hubspotSearchNumber } = await import('./hubspot')
    // Non-NANP is documented as a known limitation (no prefix table in this
    // repo) — but it must still never send punctuation into the filter.
    expect(hubspotSearchNumber('+442071234567')).not.toMatch(/\D/)
  })
})

// ── Pipedrive's lossy duration format ────────────────────────────────────────
describe('pipedriveDuration', () => {
  it('formats HH:MM', async () => {
    const { pipedriveDuration } = await import('./pipedrive')
    expect(pipedriveDuration(0)).toBe('00:00')
    expect(pipedriveDuration(60)).toBe('00:01')
    expect(pipedriveDuration(90)).toBe('00:02') // rounds to nearest minute
    expect(pipedriveDuration(3600)).toBe('01:00')
    expect(pipedriveDuration(4500)).toBe('01:15')
  })

  it('never rounds a real call down to zero', async () => {
    const { pipedriveDuration } = await import('./pipedrive')
    // A 12-second call that logs as 00:00 reads as "no call happened".
    expect(pipedriveDuration(12)).toBe('00:01')
    expect(pipedriveDuration(1)).toBe('00:01')
  })
})

describe('pipedriveDueParts', () => {
  it('splits an instant into YYYY-MM-DD and HH:MM', async () => {
    const { pipedriveDueParts } = await import('./pipedrive')
    expect(pipedriveDueParts(new Date('2026-09-24T14:35:09.000Z'))).toEqual({
      due_date: '2026-09-24',
      due_time: '14:35',
    })
  })
})

// ── field mappings ───────────────────────────────────────────────────────────
describe('applyCallMappings', () => {
  const base = {
    startedAt: new Date('2026-09-24T10:00:00Z'),
    durationSecs: 120,
    direction: 'inbound' as const,
    fromE164: '+15550104477',
    toE164: '+15550100000',
    summary: 'Booked a Tuesday slot',
    outcome: 'booked',
    agentName: 'Front desk',
    productName: 'VoiceFlow',
    recordingUrl: null,
  }

  it('writes the mapped source values onto the payload', async () => {
    const { applyCallMappings } = await import('./mappings')
    const out = applyCallMappings(
      { ...base, mappings: { contact: {}, call: { summary: 'hs_call_body', outcome: 'outcome__c' } } },
      {}
    )
    expect(out).toEqual({ hs_call_body: 'Booked a Tuesday slot', outcome__c: 'booked' })
  })

  it('skips empty values rather than blanking the CRM property', async () => {
    const { applyCallMappings } = await import('./mappings')
    // An unclassified call (no OPENAI_API_KEY) must not overwrite a note a
    // human wrote with an empty string.
    const out = applyCallMappings(
      { ...base, summary: null, outcome: null, mappings: { contact: {}, call: { summary: 'hs_call_body', outcome: 'outcome__c' } } },
      { hs_call_body: 'existing' }
    )
    expect(out).toEqual({ hs_call_body: 'existing' })
  })
})

describe('callTitle', () => {
  it('names the direction, the agent and the outcome', async () => {
    const { callTitle } = await import('./mappings')
    const title = callTitle({
      startedAt: new Date(),
      durationSecs: 10,
      direction: 'inbound',
      fromE164: null,
      toE164: null,
      summary: null,
      outcome: 'lead_captured',
      agentName: 'Front desk',
      productName: 'VoiceFlow',
      recordingUrl: null,
      mappings: { contact: {}, call: {} },
    })
    expect(title).toBe('Inbound call — Front desk (lead captured)')
  })
})

// ── OAuth state ──────────────────────────────────────────────────────────────
//
// Without this check a captured callback URL connects an attacker's CRM to
// someone else's workspace, after which every call that org takes is logged
// into the attacker's account.
describe('OAuth state', () => {
  it('round-trips and carries the org id', async () => {
    const { signState, verifyState } = await import('./oauth')
    const { state, nonce } = signState(ORG, 'hubspot')
    const verified = verifyState(state, 'hubspot', nonce)
    expect(verified.orgId).toBe(ORG)
    expect(verified.provider).toBe('hubspot')
  })

  it('rejects a tampered payload', async () => {
    const { signState, verifyState } = await import('./oauth')
    const { state, nonce } = signState(ORG, 'hubspot')
    const [body, mac] = state.split('.')
    const forged = Buffer.from(
      JSON.stringify({ orgId: '99999999-9999-9999-9999-999999999999', provider: 'hubspot', nonce, issuedAt: Date.now() })
    ).toString('base64url')
    expect(() => verifyState(`${forged}.${mac}`, 'hubspot', nonce)).toThrow(/signature/i)
    expect(body).toBeTruthy()
  })

  it('rejects a state replayed without the browser cookie', async () => {
    const { signState, verifyState } = await import('./oauth')
    const { state } = signState(ORG, 'hubspot')
    expect(() => verifyState(state, 'hubspot', undefined)).toThrow(/browser session/i)
    expect(() => verifyState(state, 'hubspot', 'some-other-nonce')).toThrow(/browser session/i)
  })

  it('rejects a state minted for a different provider', async () => {
    const { signState, verifyState } = await import('./oauth')
    const { state, nonce } = signState(ORG, 'hubspot')
    expect(() => verifyState(state, 'pipedrive', nonce)).toThrow(/different provider/i)
  })
})

describe('configuredProviders', () => {
  it('only offers a provider whose id AND secret are set', async () => {
    const { configuredProviders } = await import('./oauth')
    // beforeAll set HubSpot's pair and not Pipedrive's.
    expect(configuredProviders()).toEqual(['hubspot'])
  })
})

// ── idempotency ──────────────────────────────────────────────────────────────
//
// Rule 2, applied outbound. Inngest retries, the provider webhook replays and
// the nightly reconcile all re-ask for the same call; none may put a second
// activity in the customer's CRM. Neither provider accepts an idempotency key,
// so crm_sync_attempts is the only thing standing in the way.
function fakeDb(seed: { attempts?: any[]; calls?: any[]; contacts?: any[] } = {}) {
  const tables: Record<string, any[]> = {
    crm_sync_attempts: seed.attempts ?? [],
    calls: seed.calls ?? [],
    contacts: seed.contacts ?? [],
  }
  function builder(rows: any[]) {
    let filtered = [...rows]
    const q: any = {
      eq(col: string, v: any) {
        filtered = filtered.filter((r) => r[col] === v)
        return q
      },
      maybeSingle: () => Promise.resolve({ data: filtered[0] ?? null, error: null }),
      then: (resolve: (v: any) => unknown) => resolve({ data: filtered, error: null }),
    }
    return q
  }
  return {
    tables,
    from(name: string) {
      const rows = (tables[name] ??= [])
      return {
        select: () => builder(rows),
        upsert(row: any, opts?: { onConflict?: string }) {
          const keys = (opts?.onConflict ?? 'id').split(',')
          const existing = rows.find((r) => keys.every((k) => r[k] === row[k]))
          if (existing) Object.assign(existing, row)
          else rows.push({ id: `${name}_${rows.length + 1}`, ...row })
          return Promise.resolve({ data: null, error: null })
        },
        update(patch: any) {
          const q: any = {
            eq(col: string, v: any) {
              q._f = (q._f ?? rows).filter((r: any) => r[col] === v)
              return q
            },
            then(resolve: (v: any) => unknown) {
              for (const r of q._f ?? rows) Object.assign(r, patch)
              return resolve({ data: null, error: null })
            },
          }
          return q
        },
      }
    },
  } as any
}

const STORED = {
  orgId: ORG,
  provider: 'hubspot' as const,
  accessTokenSealed: 'sealed',
  refreshTokenSealed: 'sealed',
  accessExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  apiBaseUrl: null,
  status: 'active' as const,
}

describe('syncCallToCrm idempotency', () => {
  it('returns early when the call is already synced, without calling the provider', async () => {
    const { syncCallToCrm } = await import('./sync')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const db = fakeDb({
      attempts: [{ call_id: 'call_1', provider: 'hubspot', status: 'ok', attempts: 1, crm_contact_id: '701', crm_activity_id: '900' }],
      calls: [{ id: 'call_1', org_id: ORG, direction: 'inbound', from_e164: '+15550104477' }],
    })

    const res = await syncCallToCrm(db, 'call_1', STORED)

    expect(res.status).toBe('already')
    expect(res.crmActivityId).toBe('900')
    // The guarantee that matters: a retry does not re-post.
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('skips a call with no external number instead of failing forever', async () => {
    const { syncCallToCrm } = await import('./sync')
    const db = fakeDb({
      calls: [{ id: 'call_2', org_id: ORG, direction: 'inbound', from_e164: null, to_e164: null }],
    })

    const res = await syncCallToCrm(db, 'call_2', STORED)

    expect(res.status).toBe('skipped')
    // Recorded, so it is visible rather than silently absent.
    expect(db.tables.crm_sync_attempts[0].status).toBe('skipped')
  })

  it('reports a vanished call row rather than throwing', async () => {
    const { syncCallToCrm } = await import('./sync')
    const res = await syncCallToCrm(fakeDb(), 'gone', STORED)
    expect(res.status).toBe('skipped')
  })
})
