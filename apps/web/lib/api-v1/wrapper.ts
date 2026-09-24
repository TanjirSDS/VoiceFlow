import { apiKeyDb, serviceClient, type Db } from '@voiceflow/db'
import { authenticateApiKey, type ApiAuthResult } from '../api-auth'
import { rateLimit } from '../ratelimit'

// Phase 24: the one place every /api/v1 request is authenticated, scoped and
// answered. Routes stay thin so there is a single copy of these rules.

export interface ApiContext {
  orgId: string
  keyId: string
  /** RLS-scoped to orgId. Postgres, not this file, is what stops cross-tenant reads. */
  db: Db
  req: Request
  /** Dynamic segments, e.g. { id } for /api/v1/calls/{id}. */
  params: Record<string, string>
}

export type ApiHandler = (ctx: ApiContext) => Promise<Response>

export interface ApiDeps {
  authenticate: (authHeader: string | null) => Promise<ApiAuthResult>
  rateLimit: (keyId: string) => Promise<{ success: boolean }>
  dbFor: (orgId: string) => Db
}

/** Production wiring. Key lookup runs as service role because the caller has no
 *  session — RLS cannot scope the very query that establishes who they are. It
 *  reads the key row and nothing else; all tenant data goes through dbFor(). */
const realDeps: ApiDeps = {
  authenticate: (authHeader) =>
    authenticateApiKey(authHeader, {
      lookupKey: async (hash) => {
        const { data, error } = await serviceClient()
          .from('api_keys')
          .select('id, org_id, revoked_at, orgs!inner(plans!orgs_plan_id_fkey(api_enabled))')
          .eq('key_hash', hash)
          .maybeSingle()
        if (error) throw new Error(error.message)
        if (!data) return null
        const plan = (data.orgs as unknown as { plans: { api_enabled: boolean } }).plans
        return {
          id: data.id,
          org_id: data.org_id,
          revoked_at: data.revoked_at,
          api_enabled: plan?.api_enabled ?? false,
        }
      },
      touchKey: async (id) => {
        await serviceClient().from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', id)
      },
    }),
  rateLimit: (keyId) => rateLimit('api', keyId),
  dbFor: (orgId) => apiKeyDb(orgId),
}

export function apiError(status: number, code: string, message: string, extra?: HeadersInit): Response {
  return Response.json({ error: { code, message } }, { status, headers: { 'cache-control': 'no-store', ...extra } })
}

export function apiOk(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } })
}

/** The framework boundary. Next 15's build-time route validator requires the
 *  second parameter to be exactly `{ params: Promise<any> }` — neither the
 *  param nor `params` may accept undefined, and a narrower element type is
 *  rejected for static routes, which carry no dynamic segments. It is read back
 *  as a string map immediately below, and only `params.id` is ever used. */
type RouteCtx = { params: Promise<any> }

export function withApiAuth(handler: ApiHandler, deps: ApiDeps = realDeps) {
  return async (req: Request, ctx: RouteCtx): Promise<Response> => {
    const auth = await deps.authenticate(req.headers.get('authorization'))
    if (!auth.ok) {
      // 401 must advertise the scheme (RFC 7235). 403 is a real answer — the key
      // is valid, the plan just doesn't include the API — so it carries none.
      return apiError(
        auth.status,
        auth.code,
        auth.message,
        auth.status === 401 ? { 'www-authenticate': 'Bearer realm="VoiceFlow API"' } : undefined
      )
    }

    const { success } = await deps.rateLimit(auth.keyId)
    if (!success) {
      return apiError(429, 'rate_limited', 'Too many requests for this API key. Try again shortly.')
    }

    try {
      const res = await handler({
        orgId: auth.orgId,
        keyId: auth.keyId,
        db: deps.dbFor(auth.orgId),
        req,
        params: (await ctx?.params) ?? {},
      })
      // Stamped here, not in each handler: every response carries one tenant's
      // data, and a single forgotten header is a shared cache serving org A's
      // calls to org B. One guarantee beats per-handler discipline.
      res.headers.set('cache-control', 'no-store')
      return res
    } catch (e) {
      // Never surface the message: it can carry a connection string, a provider
      // error body, or a row we just read. The detail goes to the server log.
      console.error('api/v1 handler failed:', e)
      return apiError(500, 'internal_error', 'The request could not be completed.')
    }
  }
}
