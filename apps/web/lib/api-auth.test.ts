import { describe, expect, test, vi } from 'vitest'
import { authenticateApiKey, type ApiKeyRow } from './api-auth'
import { generateApiKey, hashApiKey } from './api-keys'

// A row as the join in api-auth.ts returns it.
function row(over: Partial<ApiKeyRow> = {}): ApiKeyRow {
  return {
    id: 'key-1',
    org_id: 'org-1',
    revoked_at: null,
    api_enabled: true,
    ...over,
  }
}

/** Fake of the single indexed lookup, so the whole auth path runs offline. */
function deps(found: ApiKeyRow | null) {
  return {
    lookupKey: vi.fn(async () => found),
    touchKey: vi.fn(async () => {}),
  }
}

describe('authenticateApiKey', () => {
  test('a valid key resolves its org', async () => {
    const { key } = generateApiKey()
    const d = deps(row())

    const result = await authenticateApiKey(`Bearer ${key}`, d)

    expect(result).toMatchObject({ ok: true, orgId: 'org-1', keyId: 'key-1' })
  })

  test('looks the key up BY HASH — the raw key is never used as a query value', async () => {
    const { key } = generateApiKey()
    const d = deps(row())

    await authenticateApiKey(`Bearer ${key}`, d)

    expect(d.lookupKey).toHaveBeenCalledWith(hashApiKey(key))
    expect(d.lookupKey).not.toHaveBeenCalledWith(key)
  })

  test('a REVOKED key is rejected with 401', async () => {
    const { key } = generateApiKey()
    const d = deps(row({ revoked_at: '2026-09-01T00:00:00Z' }))

    const result = await authenticateApiKey(`Bearer ${key}`, d)

    expect(result).toMatchObject({ ok: false, status: 401 })
    // A revoked key must not be recorded as in-use.
    expect(d.touchKey).not.toHaveBeenCalled()
  })

  test("a STARTER-plan key (api_enabled false) is rejected with 403", async () => {
    const { key } = generateApiKey()
    const d = deps(row({ api_enabled: false }))

    const result = await authenticateApiKey(`Bearer ${key}`, d)

    // 403 not 401: the credential is genuine, the plan just doesn't include it.
    expect(result).toMatchObject({ ok: false, status: 403 })
    if (result.ok) throw new Error('unreachable')
    expect(result.code).toBe('plan_upgrade_required')
  })

  test('an unknown key is rejected with 401', async () => {
    const { key } = generateApiKey()
    const result = await authenticateApiKey(`Bearer ${key}`, deps(null))
    expect(result).toMatchObject({ ok: false, status: 401 })
  })

  test('a missing or malformed Authorization header is rejected with 401 without a lookup', async () => {
    for (const header of [null, '', 'Basic abc', 'vf_loose', 'Bearer ']) {
      const d = deps(row())
      const result = await authenticateApiKey(header, d)
      expect(result).toMatchObject({ ok: false, status: 401 })
      expect(d.lookupKey).not.toHaveBeenCalled()
    }
  })

  test('records last_used_at only on success', async () => {
    const { key } = generateApiKey()
    const ok = deps(row())
    await authenticateApiKey(`Bearer ${key}`, ok)
    expect(ok.touchKey).toHaveBeenCalledWith('key-1')

    const denied = deps(row({ api_enabled: false }))
    await authenticateApiKey(`Bearer ${key}`, denied)
    expect(denied.touchKey).not.toHaveBeenCalled()
  })

  test('a failing last_used_at write never fails the request', async () => {
    const { key } = generateApiKey()
    const result = await authenticateApiKey(`Bearer ${key}`, {
      lookupKey: async () => row(),
      touchKey: async () => {
        throw new Error('postgrest down')
      },
    })
    expect(result).toMatchObject({ ok: true, orgId: 'org-1' })
  })
})
