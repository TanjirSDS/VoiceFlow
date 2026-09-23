import { describe, expect, test, vi } from 'vitest'
import { withApiAuth, type ApiDeps, type ApiHandler } from './wrapper'
import { generateApiKey } from '../api-keys'

const { key } = generateApiKey()
const AUTH = { authorization: `Bearer ${key}` }

/** The handler under test just reports what scope it was handed. */
const echoOrg: ApiHandler = async ({ orgId, keyId }) =>
  Response.json({ orgId, keyId })

function deps(over: Partial<ApiDeps> = {}): ApiDeps {
  return {
    authenticate: async () => ({ ok: true, orgId: 'org-1', keyId: 'key-1' }),
    rateLimit: async () => ({ success: true }),
    dbFor: vi.fn(() => ({}) as never),
    ...over,
  }
}

const req = (headers: Record<string, string> = AUTH) =>
  new Request('https://api.voiceflow.test/api/v1/agents', { headers })

describe('withApiAuth', () => {
  test('runs the handler with the org the key resolved to', async () => {
    const res = await withApiAuth(echoOrg, deps())(req(), {})
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ orgId: 'org-1', keyId: 'key-1' })
  })

  test('scopes the database client to that org and nothing wider', async () => {
    const d = deps()
    await withApiAuth(echoOrg, d)(req(), {})
    expect(d.dbFor).toHaveBeenCalledWith('org-1')
    expect(d.dbFor).toHaveBeenCalledTimes(1)
  })

  test('a REVOKED key gets 401 and the handler never runs', async () => {
    const handler = vi.fn(echoOrg)
    const res = await withApiAuth(
      handler,
      deps({
        authenticate: async () => ({
          ok: false,
          status: 401,
          code: 'invalid_api_key',
          message: 'Invalid or revoked API key.',
        }),
      })
    )(req(), {})

    expect(res.status).toBe(401)
    expect(handler).not.toHaveBeenCalled()
    await expect(res.json()).resolves.toEqual({
      error: { code: 'invalid_api_key', message: 'Invalid or revoked API key.' },
    })
    // RFC 7235: a 401 must say how to authenticate.
    expect(res.headers.get('www-authenticate')).toMatch(/^Bearer/)
  })

  test('a STARTER-plan key gets 403 and the handler never runs', async () => {
    const handler = vi.fn(echoOrg)
    const res = await withApiAuth(
      handler,
      deps({
        authenticate: async () => ({
          ok: false,
          status: 403,
          code: 'plan_upgrade_required',
          message: 'The public API is available on the Pro plan.',
        }),
      })
    )(req(), {})

    expect(res.status).toBe(403)
    expect(handler).not.toHaveBeenCalled()
    const body = await res.json()
    expect(body.error.code).toBe('plan_upgrade_required')
  })

  test('rate limiting is per key and returns 429 before the handler', async () => {
    const handler = vi.fn(echoOrg)
    const limiter = vi.fn(async () => ({ success: false }))
    const res = await withApiAuth(handler, deps({ rateLimit: limiter }))(req(), {})

    expect(res.status).toBe(429)
    expect(limiter).toHaveBeenCalledWith('key-1')
    expect(handler).not.toHaveBeenCalled()
  })

  test('an unhandled error in a handler is a 500 that leaks nothing', async () => {
    const boom: ApiHandler = async () => {
      throw new Error('connection string postgres://user:hunter2@db/voiceflow')
    }
    const res = await withApiAuth(boom, deps())(req(), {})
    expect(res.status).toBe(500)
    const text = await res.text()
    expect(text).not.toContain('hunter2')
    expect(text).not.toContain('postgres://')
  })

  test('responses are JSON and must never be cached by an intermediary', async () => {
    const res = await withApiAuth(echoOrg, deps())(req(), {})
    expect(res.headers.get('content-type')).toMatch(/application\/json/)
    expect(res.headers.get('cache-control')).toMatch(/no-store/)
  })
})
