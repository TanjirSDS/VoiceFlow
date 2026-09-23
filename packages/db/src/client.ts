import { createHmac } from 'node:crypto'
import { PostgrestClient } from '@supabase/postgrest-js'
import { Pool } from 'pg'
import { getEnv } from './env'

/** Query client for the public schema, served by our own (private) PostgREST.
 *  Same .from()/.rpc() builder supabase-js wraps — Phase 21 kept all queries. */
export type Db = PostgrestClient

const b64url = (s: string) => Buffer.from(s).toString('base64url')

/** HS256 JWT that PostgREST verifies with PGRST_JWT_SECRET. `role` picks the
 *  Postgres role the request runs as; `sub` is what auth.uid() returns. */
export function signPostgrestJwt(claims: Record<string, unknown>, secret: string, ttlSecs = 60): string {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64url(
    JSON.stringify({ ...claims, iat: now, exp: now + ttlSecs })
  )}`
  return `${unsigned}.${createHmac('sha256', secret).update(unsigned).digest('base64url')}`
}

/** A fresh token is signed per request, so a long-running job never holds an
 *  expired one. claims=null sends none → PostgREST 401s (no anon role). */
export function createDb(url: string, secret: string, claims: Record<string, unknown> | null): Db {
  return new PostgrestClient(url, {
    fetch: (input, init) => {
      if (!claims) return fetch(input, init)
      const headers = new Headers(init?.headers)
      headers.set('Authorization', `Bearer ${signPostgrestJwt(claims, secret)}`)
      return fetch(input, { ...init, headers })
    },
  })
}

// Service-role client: server-side only (webhooks, scripts, jobs). Bypasses RLS.
export function serviceClient(): Db {
  const env = getEnv()
  return createDb(env.POSTGREST_URL, env.POSTGREST_JWT_SECRET, { role: 'service_role' })
}

/** RLS-scoped client for one signed-in user (apps/web wraps this with the session). */
export function userDb(userId: string | null): Db {
  const env = getEnv()
  return createDb(env.POSTGREST_URL, env.POSTGREST_JWT_SECRET, userId ? { role: 'authenticated', sub: userId } : null)
}

let _pool: Pool | undefined

/** Direct Postgres for what PostgREST doesn't expose (the auth schema). Our SQL
 *  here always schema-qualifies; Better Auth keeps its own search_path=auth pool. */
export function pool(): Pool {
  _pool ??= new Pool({ connectionString: getEnv().DATABASE_URL, max: 5 })
  return _pool
}

/** Get-or-create an auth user by email — scripts only (the app creates users
 *  via Better Auth on first magic-link click, which then finds this row). */
export async function ensureAuthUser(email: string): Promise<string> {
  const { rows } = await pool().query<{ id: string }>(
    `insert into auth.users (email, email_verified) values (lower($1), true)
     on conflict (email) do update set email = excluded.email
     returning id`,
    [email]
  )
  return rows[0].id
}
