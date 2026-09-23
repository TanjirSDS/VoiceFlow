// Phase 23: sealing secrets we hold on behalf of a tenant (today: each org's
// Twilio subaccount auth token). AES-256-GCM in the app layer, never pgcrypto —
// the key must not live in the database that stores the ciphertext, or the two
// halves leak together.
import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto'

import { getEnv } from './env'

const VERSION = 'v1'
const IV_BYTES = 12 // GCM standard; 96-bit nonces are what the mode is specified for
const KEY_BYTES = 32

/** Decoded once — base64 decoding on every call showed up as noise in the hot path. */
let cachedKey: Buffer | undefined

function key(): Buffer {
  if (cachedKey) return cachedKey
  const raw = Buffer.from(getEnv().CREDENTIAL_ENCRYPTION_KEY, 'base64')
  if (raw.length !== KEY_BYTES) {
    // Length, never the value — this message reaches logs.
    throw new Error(
      `CREDENTIAL_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes, got ${raw.length}. ` +
        `Generate one with: openssl rand -base64 32`
    )
  }
  cachedKey = raw
  return raw
}

/**
 * Encrypt `plaintext`, binding it to `aad` (we pass the org id).
 *
 * The binding is the point: a ciphertext stolen from org A's row and pasted into
 * org B's row fails to open, because GCM authenticates the AAD. Without it, anyone
 * with write access to the table could hand org B org A's Twilio credentials.
 */
export function seal(plaintext: string, aad: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  cipher.setAAD(Buffer.from(aad, 'utf8'))
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join('.')
}

/** Reverse of seal(). Throws if the payload was tampered with or `aad` doesn't match. */
export function open(payload: string, aad: string): string {
  const parts = payload.split('.')
  if (parts.length !== 4) throw new Error('sealed payload is malformed')
  const [version, ivB64, tagB64, ctB64] = parts
  if (version !== VERSION) throw new Error(`unsupported sealed payload version: ${version}`)

  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB64, 'base64'))
  decipher.setAAD(Buffer.from(aad, 'utf8'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  try {
    return Buffer.concat([
      decipher.update(Buffer.from(ctB64, 'base64')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    // Swallow the underlying message: node's GCM failure text differs between a
    // bad tag and a bad key, which is a small oracle. Callers only need "no".
    throw new Error('sealed payload failed authentication (wrong key, wrong org, or tampered)')
  }
}

/** Constant-time compare, for callers checking a secret they already hold. */
export function secretEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}
