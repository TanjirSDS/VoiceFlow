// The app-layer half of Phase 23's done-condition: whatever the database says,
// org A must never be handed credentials pointed at org B's number.
import { beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  Object.assign(process.env, {
    ELEVENLABS_API_KEY: 'x',
    ELEVENLABS_WEBHOOK_SECRET: 'x',
    TWILIO_ACCOUNT_SID: 'ACparent',
    TWILIO_AUTH_TOKEN: 'parent-token',
    CREDENTIAL_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString('base64'),
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'x',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'x',
    STRIPE_SECRET_KEY: 'x',
    STRIPE_WEBHOOK_SECRET: 'x',
  })
})

const ORG_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

/** One row, returned for any lookup — enough for these cases. */
let row: Record<string, unknown> | null = null

vi.mock('server-only', () => ({}))
vi.mock('@voiceflow/db', async (orig) => {
  const actual = await orig<typeof import('@voiceflow/db')>()
  return {
    ...actual,
    serviceClient: () => ({
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) }),
      }),
    }),
  }
})

describe('credsForNumber', () => {
  // Privilege escalation, closed. phone_numbers is `for all to authenticated`
  // (0004, never revoked), so a tenant can PATCH their own row's twilio_sid to
  // another org's number and keep org_id their own — RLS still passes. If a null
  // twilio_account_sid answered with PARENT credentials, clicking Release would
  // then delete the other tenant's number, because the parent reaches every
  // subaccount. It must refuse instead.
  it('NEVER hands parent credentials to a user-facing path', async () => {
    const { credsForNumber } = await import('./twilio-subaccounts')
    await expect(credsForNumber(ORG_A, null)).rejects.toThrow(/parent account/)
    await expect(credsForNumber(ORG_A, null)).rejects.not.toThrow(/parent-token/)
  })

  it('uses the org\'s own credentials for a number in its subaccount', async () => {
    const { seal } = await import('@voiceflow/db')
    const { credsForNumber } = await import('./twilio-subaccounts')
    row = {
      org_id: ORG_A,
      subaccount_sid: 'ACorgA',
      auth_token_sealed: seal('orgA-token', ORG_A),
      status: 'active',
    }
    expect(await credsForNumber(ORG_A, 'ACorgA')).toEqual({
      accountSid: 'ACorgA',
      authToken: 'orgA-token',
    })
  })

  // THE test this phase exists for.
  it('REFUSES when the number lives in another org\'s subaccount', async () => {
    const { seal } = await import('@voiceflow/db')
    const { credsForNumber } = await import('./twilio-subaccounts')
    row = {
      org_id: ORG_A,
      subaccount_sid: 'ACorgA',
      auth_token_sealed: seal('orgA-token', ORG_A),
      status: 'active',
    }
    // Org A asking about a number that sits in org B's subaccount. Note the
    // failure mode this prevents: falling back to parent credentials WOULD have
    // worked, because the parent can reach every subaccount — and that is exactly
    // a cross-tenant write.
    await expect(credsForNumber(ORG_A, 'ACorgB')).rejects.toThrow(/refusing/)
  })

  it('refuses to act for a suspended subaccount', async () => {
    const { seal } = await import('@voiceflow/db')
    const { credsForNumber } = await import('./twilio-subaccounts')
    row = {
      org_id: ORG_A,
      subaccount_sid: 'ACorgA',
      auth_token_sealed: seal('orgA-token', ORG_A),
      status: 'suspended',
    }
    await expect(credsForNumber(ORG_A, 'ACorgA')).rejects.toThrow(/suspended/)
  })
})
