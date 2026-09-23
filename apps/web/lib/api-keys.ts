import { createHash, randomBytes } from 'node:crypto'

// Phase 24: credentials for the Pro public API. The rule this file exists to
// enforce: we store a HASH and never the key. A leaked database dump must not
// hand the attacker a working credential for every tenant.

/** Scheme marker, so a leaked key is recognisable in logs/scanners. */
export const API_KEY_PREFIX = 'vf_'

/** Characters of the key kept in the clear, for "which key is this?" in the UI.
 *  Short enough to be useless on its own (the secret is 64 hex chars). */
const DISPLAY_PREFIX_LEN = API_KEY_PREFIX.length + 6

export interface GeneratedApiKey {
  /** Shown to the user exactly once. Never persisted. */
  key: string
  /** What goes in the database. */
  hash: string
  /** Display-only, e.g. "vf_a1b2c3". Safe to store and render. */
  prefix: string
}

/**
 * Why sha256 and not bcrypt/argon2: this is a 256-bit RANDOM secret, not a
 * human-chosen password, so there is no dictionary to grind and key-stretching
 * buys nothing. It also keeps verification a single indexed lookup by hash —
 * a slow salted hash would force a scan over every row in the table.
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key, 'utf8').digest('hex')
}

export function generateApiKey(): GeneratedApiKey {
  const key = `${API_KEY_PREFIX}${randomBytes(32).toString('hex')}`
  return { key, hash: hashApiKey(key), prefix: key.slice(0, DISPLAY_PREFIX_LEN) }
}

/** `Authorization: Bearer <token>` → token. Null for anything else. */
export function parseBearer(header: string | null): string | null {
  if (!header) return null
  const match = /^Bearer[ ]+(\S+)$/i.exec(header.trim())
  return match ? match[1] : null
}

export interface ApiKeyInsert {
  org_id: string
  name: string
  key_hash: string
  prefix: string
  created_by: string | null
}

const MAX_NAME = 80

/**
 * Builds the row that gets persisted. Separate from the server action purely so
 * the "we store a hash, never the key" claim is a unit test rather than a
 * comment — see api-keys.test.ts.
 */
export function apiKeyInsert(input: {
  orgId: string
  name?: string | null
  createdBy: string | null
  generated: GeneratedApiKey
}): ApiKeyInsert {
  const name = (input.name ?? '').trim().slice(0, MAX_NAME)
  return {
    org_id: input.orgId,
    name: name || 'API key',
    key_hash: input.generated.hash,
    prefix: input.generated.prefix,
    created_by: input.createdBy,
  }
}
