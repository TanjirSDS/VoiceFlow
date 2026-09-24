import { describe, expect, test } from 'vitest'
import { API_KEY_PREFIX, apiKeyInsert, generateApiKey, hashApiKey, parseBearer } from './api-keys'

describe('generateApiKey', () => {
  test('returns a key the caller can show once, and a hash to store', () => {
    const { key, hash, prefix } = generateApiKey()

    expect(key.startsWith(API_KEY_PREFIX)).toBe(true)
    // 32 random bytes of hex after the scheme — enough entropy that a fast hash
    // is safe (see hashApiKey's note on why not bcrypt).
    expect(key.slice(API_KEY_PREFIX.length)).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    // The stored hash must never be the key itself.
    expect(hash).not.toBe(key)
    expect(key).not.toContain(hash)
    // The display prefix must be a real prefix of the key, and far too short to
    // be usable as a credential on its own.
    expect(key.startsWith(prefix)).toBe(true)
    expect(prefix.length).toBeLessThan(key.length / 2)
  })

  test('never repeats a key', () => {
    const keys = new Set(Array.from({ length: 200 }, () => generateApiKey().key))
    expect(keys.size).toBe(200)
  })
})

describe('hashApiKey', () => {
  test('is deterministic and agrees with generateApiKey', () => {
    const { key, hash } = generateApiKey()
    expect(hashApiKey(key)).toBe(hash)
    expect(hashApiKey(key)).toBe(hashApiKey(key))
  })

  test('a different key gives a different hash', () => {
    expect(hashApiKey('vf_aaa')).not.toBe(hashApiKey('vf_aab'))
  })
})

describe('parseBearer', () => {
  test('extracts the token from a well-formed header', () => {
    expect(parseBearer('Bearer vf_abc')).toBe('vf_abc')
    // Scheme is case-insensitive per RFC 7235.
    expect(parseBearer('bearer vf_abc')).toBe('vf_abc')
  })

  test('rejects anything that is not a bearer token', () => {
    expect(parseBearer(null)).toBeNull()
    expect(parseBearer('')).toBeNull()
    expect(parseBearer('vf_abc')).toBeNull()
    expect(parseBearer('Basic dXNlcjpwYXNz')).toBeNull()
    expect(parseBearer('Bearer ')).toBeNull()
  })
})

describe('apiKeyInsert', () => {
  test('stores the hash and never the key itself', () => {
    const generated = generateApiKey()
    const row = apiKeyInsert({
      orgId: 'org-1',
      name: 'CI',
      createdBy: 'owner@example.com',
      generated,
    })

    expect(row).toEqual({
      org_id: 'org-1',
      name: 'CI',
      key_hash: generated.hash,
      prefix: generated.prefix,
      created_by: 'owner@example.com',
    })

    // The guard that matters: no field of the persisted row may carry the
    // secret. A typo putting `key` here instead of `hash` is the one mistake
    // that turns a database dump into working credentials for every tenant.
    const serialized = JSON.stringify(row)
    expect(serialized).not.toContain(generated.key)
    expect(Object.values(row)).not.toContain(generated.key)
  })

  test('falls back to a default name rather than storing an empty one', () => {
    const generated = generateApiKey()
    expect(apiKeyInsert({ orgId: 'o', name: '   ', createdBy: null, generated }).name).toBe('API key')
    expect(apiKeyInsert({ orgId: 'o', name: undefined, createdBy: null, generated }).name).toBe('API key')
  })

  test('trims and caps an over-long name', () => {
    const generated = generateApiKey()
    const row = apiKeyInsert({ orgId: 'o', name: `  ${'x'.repeat(500)}  `, createdBy: null, generated })
    expect(row.name.length).toBeLessThanOrEqual(80)
    expect(row.name.startsWith('x')).toBe(true)
  })
})
