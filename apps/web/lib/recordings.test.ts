// Phase 22 acceptance: org B gets a 404 for org A's recording, and audio past
// its retention window is really gone from the bucket.
//
// These run offline, against an in-memory db + bucket, and they drive the
// REAL route handler — so the 404 asserted below is the status code a browser
// would receive, not a stand-in for it. That matters here: the thing being
// proven is an authorization decision, and a test that only exercised the helper
// would not notice a route that forgot to call it.
//
// What the fake models, and what it does not: `scopeOrgId` reproduces 0004's
// `calls_org_rw ... using (is_org_member(org_id))` — a member's client cannot
// see another org's rows. That the real policy is installed and enabled is
// Postgres's job and is covered live by packages/db/src/rls.test.ts. What is
// unique to this phase, and what these tests pin, is everything the app does
// AROUND that policy: that the ownership check happens before anything is
// signed, that the path signed is the row's and not the request's, and that an
// expired recording is deleted rather than quietly re-served from the provider.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveCallRecording,
  isPathOwnedBy,
  recordingExpiry,
  recordingObjectPath,
  type RecordingStore,
  resolveRecording,
  SIGNED_URL_TTL_SECS,
  sweepExpiredRecordings,
} from './recordings'

// The route resolves its clients through these three modules. Hoisted stubs let
// the genuine handler run unmodified.
const stubs = vi.hoisted(() => ({ user: null as any, service: null as any, engine: null as any, store: null as any }))
vi.mock('./engine', () => ({ makeEngine: () => stubs.engine }))
vi.mock('./db', () => ({ userClient: async () => stubs.user }))
vi.mock('./object-store', () => ({ recordingStore: () => stubs.store }))

import { GET } from '../app/api/calls/[id]/audio/route'

const ORG_A = '11111111-1111-4111-8111-111111111111'
const ORG_B = '22222222-2222-4222-8222-222222222222'
const CALL_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const T0 = new Date('2026-09-23T10:00:00.000Z')
const DAY = 86_400_000

interface Store {
  calls: any[]
  orgs: any[]
  /** The bucket. An object is in here or it is not — no other notion of "deleted". */
  bucket: Map<string, { bytes: number; contentType?: string }>
  /** Every path signing was ATTEMPTED for, so a test can prove B never got that far. */
  signed: string[]
}

function makeStore(): Store {
  return {
    orgs: [
      { id: ORG_A, recording_retention_days: 30 },
      { id: ORG_B, recording_retention_days: 30 },
    ],
    calls: [
      {
        id: CALL_A,
        org_id: ORG_A,
        provider_call_id: 'conv_a',
        recording_url: 'https://provider.example/conv_a.mp3',
        recording_path: `${ORG_A}/${CALL_A}.mp3`,
        recording_bytes: 2048,
        recording_archived_at: T0.toISOString(),
        recording_expires_at: new Date(T0.getTime() + 30 * DAY).toISOString(),
      },
    ],
    bucket: new Map([[`${ORG_A}/${CALL_A}.mp3`, { bytes: 2048, contentType: 'audio/mpeg' }]]),
    signed: [],
  }
}

/** `scopeOrgId` set = an authenticated member's RLS-scoped client; omitted = service role. */
function fakeDb(store: Store, scopeOrgId?: string): any {
  const rowsFor = (table: string) => {
    const all = (store as any)[table] as any[]
    if (!scopeOrgId) return all
    if (table === 'calls') return all.filter((r) => r.org_id === scopeOrgId)
    if (table === 'orgs') return all.filter((r) => r.id === scopeOrgId)
    return all
  }

  // Reads hand back copies — the code under test is on the far side of a network
  // boundary and must not be able to mutate the store by holding a row.
  function selectBuilder(rows: any[]) {
    let out = [...rows]
    const q: any = {
      eq: (c: string, v: any) => ((out = out.filter((r) => r[c] === v)), q),
      in: (c: string, vs: any[]) => ((out = out.filter((r) => vs.includes(r[c]))), q),
      not: (c: string, op: string, v: any) => {
        if (op !== 'is' || v !== null) throw new Error(`fake db: unsupported .not(${op})`)
        return (out = out.filter((r) => r[c] != null)), q
      },
      lte: (c: string, v: any) => ((out = out.filter((r) => r[c] != null && r[c] <= v)), q),
      limit: (n: number) => ((out = out.slice(0, n)), q),
      maybeSingle: async () => ({ data: out[0] ? { ...out[0] } : null, error: null }),
      then: (resolve: any) => resolve({ data: out.map((r) => ({ ...r })), error: null }),
    }
    return q
  }

  function updateBuilder(rows: any[], patch: any) {
    let out = [...rows]
    const q: any = {
      eq: (c: string, v: any) => ((out = out.filter((r) => r[c] === v)), q),
      in: (c: string, vs: any[]) => ((out = out.filter((r) => vs.includes(r[c]))), q),
      then: (resolve: any) => {
        out.forEach((r) => Object.assign(r, patch))
        return resolve({ data: out, error: null })
      },
    }
    return q
  }

  return {
    from: (table: string) => ({
      select: () => selectBuilder(rowsFor(table)),
      update: (patch: any) => updateBuilder(rowsFor(table), patch),
    }),
  }
}

/** The bucket. Mirrors lib/object-store.ts: signedUrl HEADs first, so a swept
 *  object never gets a URL (presigning alone would happily sign a missing key). */
function fakeStore(store: Store): RecordingStore {
  return {
    put: async (path, body, contentType) => {
      store.bucket.set(path, { bytes: body.byteLength, contentType })
    },
    signedUrl: async (path, ttl) => {
      store.signed.push(path)
      if (!store.bucket.has(path)) return null
      return `https://bucket.example/${path}?X-Amz-Expires=${ttl}`
    },
    remove: async (paths) => {
      paths.forEach((p) => store.bucket.delete(p))
    },
  }
}

const audioGet = (id: string) => GET({} as any, { params: Promise.resolve({ id }) })

let store: Store

beforeEach(() => {
  store = makeStore()
  stubs.service = fakeDb(store)
  stubs.user = fakeDb(store, ORG_A)
  stubs.store = fakeStore(store)
  stubs.engine = {
    fetchRecording: vi.fn(async () => ({ audio: new ArrayBuffer(2048), contentType: 'audio/mpeg' })),
  }
})

describe('GET /api/calls/[id]/audio — tenant isolation', () => {
  it("org B gets a 404 for org A's recording, and nothing is ever signed for them", async () => {
    stubs.user = fakeDb(store, ORG_B)

    const res = await audioGet(CALL_A)

    expect(res.status).toBe(404)
    // The point of the phase: the refusal happens BEFORE a signed URL exists.
    // A URL minted and then withheld would still have been minted.
    expect(store.signed).toEqual([])
    expect(res.headers.get('location')).toBeNull()
    expect(await res.text()).not.toContain(ORG_A)
  })

  it('answers a foreign call id the same way it answers a nonexistent one', async () => {
    stubs.user = fakeDb(store, ORG_B)
    const foreign = await audioGet(CALL_A)
    const missing = await audioGet('99999999-9999-4999-8999-999999999999')
    // Distinguishing them would confirm that a call id is real.
    expect([foreign.status, missing.status]).toEqual([404, 404])
    expect(await foreign.text()).toBe(await missing.text())
  })

  it('org A gets a short-lived signed URL for its own object', async () => {
    const res = await audioGet(CALL_A)

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain(`${ORG_A}/${CALL_A}.mp3`)
    expect(store.signed).toEqual([`${ORG_A}/${CALL_A}.mp3`])
    // A shared cache holding this 302 would hand the bearer URL to whoever asks next.
    expect(res.headers.get('cache-control')).toBe('private, no-store')
    expect(SIGNED_URL_TTL_SECS).toBeLessThanOrEqual(600)
    // The provider's own link is never what we hand out.
    expect(res.headers.get('location')).not.toContain('provider.example')
  })

  it('refuses to sign a path that is not under the calling org, however it got there', async () => {
    // Defence in depth: only reachable if something wrote a foreign path into
    // the column, which is exactly the bug that would leak B's audio to A.
    store.calls[0].recording_path = `${ORG_B}/${CALL_A}.mp3`
    store.bucket.set(`${ORG_B}/${CALL_A}.mp3`, { bytes: 10 })

    const res = await audioGet(CALL_A)

    expect(res.status).toBe(404)
    expect(store.signed).toEqual([])
  })

  it('serves the provider stream only while a call is not yet archived', async () => {
    Object.assign(store.calls[0], {
      recording_path: null,
      recording_archived_at: null,
      recording_expires_at: null,
    })

    const res = await audioGet(CALL_A)

    expect(res.status).toBe(200)
    expect(stubs.engine.fetchRecording).toHaveBeenCalledWith('conv_a')
    expect(res.headers.get('cache-control')).toBe(`private, max-age=${SIGNED_URL_TTL_SECS}`)
  })
})

describe('retention window', () => {
  it('archives into the org folder and stamps an expiry from the org window', async () => {
    Object.assign(store.calls[0], {
      recording_path: null,
      recording_bytes: null,
      recording_archived_at: null,
      recording_expires_at: null,
    })
    store.bucket.clear()

    const res = await archiveCallRecording(stubs.service, stubs.store, stubs.engine as any, 'conv_a', T0)

    expect(res).toMatchObject({ kind: 'archived', path: `${ORG_A}/${CALL_A}.mp3`, bytes: 2048 })
    expect(store.bucket.has(`${ORG_A}/${CALL_A}.mp3`)).toBe(true)
    expect(store.calls[0].recording_expires_at).toBe(new Date(T0.getTime() + 30 * DAY).toISOString())
  })

  it('archives nothing for an org that set its window to 0', async () => {
    Object.assign(store.calls[0], { recording_path: null, recording_expires_at: null })
    store.bucket.clear()
    store.orgs[0].recording_retention_days = 0

    const res = await archiveCallRecording(stubs.service, stubs.store, stubs.engine as any, 'conv_a', T0)

    expect(res).toEqual({ kind: 'skipped', reason: 'retention disabled for org' })
    expect(store.bucket.size).toBe(0)
    expect(stubs.engine.fetchRecording).not.toHaveBeenCalled()
  })

  it('leaves audio inside its window alone', async () => {
    const res = await sweepExpiredRecordings(stubs.service, stubs.store, new Date(T0.getTime() + 29 * DAY))

    expect(res.deleted).toBe(0)
    expect(store.bucket.has(`${ORG_A}/${CALL_A}.mp3`)).toBe(true)
  })

  it('expired audio is actually gone from the bucket, and stays gone', async () => {
    const path = `${ORG_A}/${CALL_A}.mp3`
    expect(store.bucket.has(path)).toBe(true)

    const res = await sweepExpiredRecordings(stubs.service, stubs.store, new Date(T0.getTime() + 31 * DAY))

    // The object itself, not a flag about the object.
    expect(res).toEqual({ deleted: 1, bytes: 2048 })
    expect(store.bucket.has(path)).toBe(false)
    expect(store.bucket.size).toBe(0)
    expect(store.calls[0].recording_path).toBeNull()
    expect(store.calls[0].recording_bytes).toBeNull()

    // Deleted audio must not come back from the provider by the side door.
    const after = await audioGet(CALL_A)
    expect(after.status).toBe(410)
    expect(stubs.engine.fetchRecording).not.toHaveBeenCalled()

    // And a replayed call/recorded must not re-upload it.
    const replay = await archiveCallRecording(stubs.service, stubs.store, stubs.engine as any, 'conv_a', new Date(T0.getTime() + 32 * DAY))
    expect(replay).toEqual({ kind: 'skipped', reason: 'already swept' })
    expect(store.bucket.size).toBe(0)
  })

  it('sweeps every expired org at once and touches nothing else', async () => {
    const bPath = `${ORG_B}/bbbb.mp3`
    store.calls.push({
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      org_id: ORG_B,
      provider_call_id: 'conv_b',
      recording_path: bPath,
      recording_bytes: 512,
      recording_archived_at: T0.toISOString(),
      recording_expires_at: new Date(T0.getTime() + 7 * DAY).toISOString(),
    })
    store.bucket.set(bPath, { bytes: 512 })

    // 10 days on: B's 7-day window is up, A's 30-day one is not.
    const res = await sweepExpiredRecordings(stubs.service, stubs.store, new Date(T0.getTime() + 10 * DAY))

    expect(res).toEqual({ deleted: 1, bytes: 512 })
    expect(store.bucket.has(bPath)).toBe(false)
    expect(store.bucket.has(`${ORG_A}/${CALL_A}.mp3`)).toBe(true)
  })

  it('an archived recording whose object vanished reads as gone, not as an error', async () => {
    store.bucket.clear() // object deleted out from under us

    const res = await audioGet(CALL_A)

    expect(res.status).toBe(410)
  })

  it('refuses to serve an archived recording with no expiry (fails closed)', async () => {
    store.calls[0].recording_expires_at = null

    const res = await audioGet(CALL_A)

    expect(res.status).toBe(410)
    expect(store.signed).toEqual([])
  })
})

describe('no bucket configured (local dev)', () => {
  it('skips archiving and keeps unarchived calls streaming from the provider', async () => {
    Object.assign(store.calls[0], { recording_path: null, recording_expires_at: null })
    store.bucket.clear()
    stubs.store = null

    const res = await archiveCallRecording(stubs.service, null, stubs.engine as any, 'conv_a', T0)
    expect(res).toEqual({ kind: 'skipped', reason: 'no recording bucket configured' })
    expect(stubs.engine.fetchRecording).not.toHaveBeenCalled()

    expect((await audioGet(CALL_A)).status).toBe(200) // provider proxy
  })

  it('fails closed for audio the row says was archived', async () => {
    stubs.store = null
    const res = await audioGet(CALL_A)
    expect(res.status).toBe(410)
    expect(stubs.engine.fetchRecording).not.toHaveBeenCalled()
  })
})

describe('path helpers', () => {
  it('files objects under the owning org', () => {
    expect(recordingObjectPath(ORG_A, CALL_A)).toBe(`${ORG_A}/${CALL_A}.mp3`)
    expect(recordingObjectPath(ORG_A, CALL_A, 'audio/wav')).toBe(`${ORG_A}/${CALL_A}.wav`)
    expect(recordingObjectPath(ORG_A, CALL_A, 'audio/mpeg; charset=binary')).toMatch(/\.mp3$/)
  })

  it('matches on a whole path segment, so a look-alike org prefix does not pass', () => {
    expect(isPathOwnedBy(`${ORG_A}/x.mp3`, ORG_A)).toBe(true)
    expect(isPathOwnedBy(`${ORG_B}/x.mp3`, ORG_A)).toBe(false)
    expect(isPathOwnedBy(`${ORG_A}-evil/x.mp3`, ORG_A)).toBe(false)
    expect(isPathOwnedBy(`../${ORG_A}/x.mp3`, ORG_A)).toBe(false)
    expect(isPathOwnedBy(ORG_A, ORG_A)).toBe(false) // the folder itself is not an object
  })

  it('expiry is the archive instant plus the window', () => {
    expect(recordingExpiry(T0, 30).toISOString()).toBe(new Date(T0.getTime() + 30 * DAY).toISOString())
    expect(recordingExpiry(T0, 1).getTime() - T0.getTime()).toBe(DAY)
  })
})

describe('resolveRecording (helper-level)', () => {
  it("returns not-found for another org's call without consulting storage", async () => {
    const out = await resolveRecording(fakeDb(store, ORG_B), stubs.store, CALL_A, T0)
    expect(out).toEqual({ kind: 'not-found' })
    expect(store.signed).toEqual([])
  })

  it('returns a signed URL for the owning org', async () => {
    const out = await resolveRecording(fakeDb(store, ORG_A), stubs.store, CALL_A, T0)
    expect(out.kind).toBe('signed')
  })
})
