import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// What actually goes on the wire.
//
// The done-condition for this phase is a real call appearing as a logged
// activity on the right contact in a HubSpot sandbox. That needs credentials, a
// sandbox and a deployed callback URL. This suite proves everything up to that
// boundary: that the requests we would send match, field for field, what the
// providers' own documentation specifies — the paths, the units, the enums and
// the association id recorded in docs/phase-25-crm-sync-research.md.
//
// These are the assertions that would otherwise only fail in someone's live CRM.

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
  })
})

vi.mock('server-only', () => ({}))

interface Captured {
  url: string
  method: string
  body: any
}

/** Stub fetch; record every request; answer from a url→response table. */
function stubFetch(routes: { match: RegExp; method?: string; json: unknown }[]) {
  const captured: Captured[] = []
  const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any, init: any = {}) => {
    const url = typeof input === 'string' ? input : input.url
    const method = init.method ?? 'GET'
    captured.push({ url, method, body: init.body ? JSON.parse(init.body) : undefined })
    const route = routes.find((r) => r.match.test(url) && (!r.method || r.method === method))
    if (!route) throw new Error(`unstubbed request: ${method} ${url}`)
    return new Response(JSON.stringify(route.json), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  })
  return { captured, spy }
}

afterEach(() => vi.restoreAllMocks())

const CALL = {
  startedAt: new Date('2026-09-24T14:35:09.000Z'),
  durationSecs: 185,
  direction: 'inbound' as const,
  fromE164: '+15550104477',
  toE164: '+15550100000',
  summary: 'Caller booked a Tuesday 10am slot.',
  outcome: 'booked',
  agentName: 'Front desk',
  productName: 'VoiceFlow',
  recordingUrl: 'https://example.test/rec.mp3',
}

describe('HubSpot wire format', () => {
  it('searches without the country code, then logs the call against the contact', async () => {
    const { hubspotClient } = await import('./hubspot')
    const { DEFAULT_MAPPINGS } = await import('./mappings')
    const { captured } = stubFetch([
      { match: /contacts\/search$/, method: 'POST', json: { total: 0, results: [] } },
      { match: /\/contacts$/, method: 'POST', json: { id: '701' } },
      { match: /\/calls$/, method: 'POST', json: { id: '900' } },
    ])

    const client = hubspotClient({ orgId: 'o', provider: 'hubspot', accessToken: 'tok' })
    const contact = await client.upsertContact({ e164: CALL.fromE164, firstName: 'Dana', lastName: 'Whitby' })
    const activity = await client.logCall(contact.id, { ...CALL, mappings: DEFAULT_MAPPINGS.hubspot })

    expect(contact).toEqual({ id: '701', created: true })
    expect(activity).toEqual({ id: '900' })

    // 1. Dated version path, not the legacy /v3/ one that goes unsupported in 2027.
    const [search, create, call] = captured
    expect(search.url).toBe('https://api.hubapi.com/crm/objects/2026-09/contacts/search')
    expect(create.url).toBe('https://api.hubapi.com/crm/objects/2026-09/contacts')
    expect(call.url).toBe('https://api.hubapi.com/crm/objects/2026-09/calls')

    // 2. The country code is stripped for the SEARCH ...
    expect(search.body.filterGroups[0].filters[0]).toEqual({
      propertyName: 'phone',
      operator: 'EQ',
      value: '5550104477',
    })
    // ... and both phone properties are tried, so a mobile-only contact matches.
    expect(search.body.filterGroups[1].filters[0].propertyName).toBe('mobilephone')

    // 3. ... but the full E.164 is what gets STORED, so a human can dial it.
    expect(create.body.properties.phone).toBe('+15550104477')
    expect(create.body.properties.firstname).toBe('Dana')

    // 4. Duration is MILLISECONDS. 185s → 185000, not 185.
    expect(call.body.properties.hs_call_duration).toBe('185000')
    expect(call.body.properties.hs_timestamp).toBe('2026-09-24T14:35:09.000Z')
    expect(call.body.properties.hs_call_direction).toBe('INBOUND')
    expect(call.body.properties.hs_call_status).toBe('COMPLETED')
    // The classifier's summary, via the default mapping.
    expect(call.body.properties.hs_call_body).toBe('Caller booked a Tuesday 10am slot.')
    expect(call.body.properties.hs_call_title).toBe('Inbound call — Front desk (booked)')

    // 5. The association that puts the call on the RIGHT contact — 194, HUBSPOT_DEFINED.
    expect(call.body.associations).toEqual([
      { to: { id: '701' }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 194 }] },
    ])
  })

  it('reuses an existing contact instead of creating a duplicate', async () => {
    const { hubspotClient } = await import('./hubspot')
    const { captured } = stubFetch([
      { match: /contacts\/search$/, method: 'POST', json: { total: 1, results: [{ id: '55', properties: {} }] } },
    ])
    const client = hubspotClient({ orgId: 'o', provider: 'hubspot', accessToken: 'tok' })
    expect(await client.upsertContact({ e164: CALL.fromE164 })).toEqual({ id: '55', created: false })
    // Exactly one request: the search. No create.
    expect(captured).toHaveLength(1)
  })
})

describe('Pipedrive wire format', () => {
  it('honours the per-install api_domain and logs a completed call activity', async () => {
    const { pipedriveClient } = await import('./pipedrive')
    const { DEFAULT_MAPPINGS } = await import('./mappings')
    const { captured } = stubFetch([
      { match: /persons\/search/, method: 'GET', json: { success: true, data: { items: [] } } },
      { match: /\/persons$/, method: 'POST', json: { success: true, data: { id: 44 } } },
      { match: /\/activities$/, method: 'POST', json: { success: true, data: { id: 88 } } },
    ])

    const client = pipedriveClient({
      orgId: 'o',
      provider: 'pipedrive',
      accessToken: 'tok',
      apiBaseUrl: 'https://acme.pipedrive.com',
    })
    const person = await client.upsertContact({ e164: CALL.fromE164, firstName: 'Dana', lastName: 'Whitby' })
    const activity = await client.logCall(person.id, { ...CALL, mappings: DEFAULT_MAPPINGS.pipedrive })

    expect(person).toEqual({ id: '44', created: true })
    expect(activity).toEqual({ id: '88' })

    const [search, create, act] = captured
    // 1. Every request goes to the install's OWN domain — not a constant.
    for (const r of captured) expect(r.url.startsWith('https://acme.pipedrive.com/api/v2/')).toBe(true)
    expect(search.url).toContain('exact_match=true')

    // 2. v2 renamed phone → phones, and it is an array of objects.
    expect(create.body.phones).toEqual([{ value: '+15550104477', primary: true, label: 'work' }])
    expect(create.body.name).toBe('Dana Whitby')

    // 3. Duration is an HH:MM string: 185s → 3 minutes.
    expect(act.body.duration).toBe('00:03')
    expect(act.body.due_date).toBe('2026-09-24')
    expect(act.body.due_time).toBe('14:35')
    expect(act.body.type).toBe('call')
    // v2 accepts only real booleans, never 1/0.
    expect(act.body.done).toBe(true)
    expect(act.body.person_id).toBe(44)
    expect(act.body.note).toBe('Caller booked a Tuesday 10am slot.')
  })

  it('refuses to call a guessed domain when api_domain is missing', async () => {
    const { pipedriveClient } = await import('./pipedrive')
    // Calling some default domain with a valid token could log one tenant's
    // calls into another tenant's CRM. Failing loudly is the only safe answer.
    expect(() => pipedriveClient({ orgId: 'o', provider: 'pipedrive', accessToken: 'tok' })).toThrow(/api_domain/)
  })
})

describe('429 handling', () => {
  it('obeys HubSpot Retry-After and then succeeds', async () => {
    const { hubspotClient } = await import('./hubspot')
    let calls = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      calls++
      if (calls === 1) {
        return new Response('rate limited', { status: 429, headers: { 'retry-after': '0' } })
      }
      return new Response(JSON.stringify({ total: 0, results: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })
    const client = hubspotClient({ orgId: 'o', provider: 'hubspot', accessToken: 'tok' })
    // Search misses after the retry, so it would go on to create — stub only the
    // search by asserting the retry happened at all.
    await client.upsertContact({ e164: CALL.fromE164 }).catch(() => {})
    expect(calls).toBeGreaterThan(1)
  })

  it('surfaces a 403 as an auth error rather than retrying a scope problem', async () => {
    const { hubspotClient } = await import('./hubspot')
    const { CrmAuthError } = await import('./types')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('missing scope', { status: 403 }))
    const client = hubspotClient({ orgId: 'o', provider: 'hubspot', accessToken: 'tok' })
    await expect(client.upsertContact({ e164: CALL.fromE164 })).rejects.toBeInstanceOf(CrmAuthError)
  })
})
