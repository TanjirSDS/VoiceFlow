// The cross-org half of Phase 23's done-condition, proved where it can be proved
// offline: a credential sealed for one org must be useless to another.
import { beforeAll, describe, expect, it } from 'vitest'

// getEnv() parses the whole schema on first call, so the env has to be complete
// before anything imports crypto's key. Set once, here.
beforeAll(() => {
  Object.assign(process.env, {
    ELEVENLABS_API_KEY: 'x',
    ELEVENLABS_WEBHOOK_SECRET: 'x',
    TWILIO_ACCOUNT_SID: 'ACparent',
    TWILIO_AUTH_TOKEN: 'parent-token',
    CREDENTIAL_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'x',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'x',
    STRIPE_SECRET_KEY: 'x',
    STRIPE_WEBHOOK_SECRET: 'x',
  })
})

const ORG_A = '11111111-1111-1111-1111-111111111111'
const ORG_B = '22222222-2222-2222-2222-222222222222'
const TOKEN_A = 'a-real-looking-twilio-auth-token-aaaa'

describe('seal/open', () => {
  it('round-trips under the same org', async () => {
    const { open, seal } = await import('./crypto')
    expect(open(seal(TOKEN_A, ORG_A), ORG_A)).toBe(TOKEN_A)
  })

  it('never emits the plaintext in the sealed payload', async () => {
    const { seal } = await import('./crypto')
    expect(seal(TOKEN_A, ORG_A)).not.toContain(TOKEN_A)
  })

  it('produces a different payload every time (fresh IV)', async () => {
    const { seal } = await import('./crypto')
    expect(seal(TOKEN_A, ORG_A)).not.toBe(seal(TOKEN_A, ORG_A))
  })

  // THE cross-tenant test. Anyone who can write this table could otherwise copy
  // org A's ciphertext into org B's row and have org B authenticate as org A.
  it('refuses to open org A\'s credential as org B', async () => {
    const { open, seal } = await import('./crypto')
    const sealedForA = seal(TOKEN_A, ORG_A)
    expect(() => open(sealedForA, ORG_B)).toThrow(/failed authentication/)
  })

  it('detects tampering with the ciphertext', async () => {
    const { open, seal } = await import('./crypto')
    const parts = seal(TOKEN_A, ORG_A).split('.')
    const ct = Buffer.from(parts[3], 'base64')
    ct[0] ^= 0xff
    parts[3] = ct.toString('base64')
    expect(() => open(parts.join('.'), ORG_A)).toThrow(/failed authentication/)
  })

  it('does not distinguish a wrong key from a wrong org in its message', async () => {
    const { open, seal } = await import('./crypto')
    // Both failure modes must read identically — a message that says which one
    // went wrong is a small oracle for anyone probing the table.
    let wrongOrg = ''
    try { open(seal(TOKEN_A, ORG_A), ORG_B) } catch (e) { wrongOrg = (e as Error).message }
    const parts = seal(TOKEN_A, ORG_A).split('.')
    parts[2] = Buffer.alloc(16, 1).toString('base64') // bogus auth tag
    let tampered = ''
    try { open(parts.join('.'), ORG_A) } catch (e) { tampered = (e as Error).message }
    expect(wrongOrg).toBe(tampered)
  })

  it('rejects a malformed or unknown-version payload', async () => {
    const { open } = await import('./crypto')
    expect(() => open('nonsense', ORG_A)).toThrow(/malformed/)
    expect(() => open('v2.a.b.c', ORG_A)).toThrow(/unsupported/)
  })
})
