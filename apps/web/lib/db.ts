import { serviceClient, userDb, type Db } from '@voiceflow/db'
import { currentUser } from './auth'

// RLS-scoped client for the signed-in user. All user-facing reads/writes go
// through this so Postgres enforces org isolation; only webhooks/cron/scripts
// use serviceClient(). No session → no token → PostgREST 401s every query.
export async function userClient(): Promise<Db> {
  // ponytail: DEV_BYPASS_AUTH=1 → service role, RLS bypassed — local skeleton
  // preview only (no signed-in user exists). Delete once local signup works.
  if (process.env.DEV_BYPASS_AUTH === '1') return serviceClient()
  const user = await currentUser()
  return userDb(user?.id ?? null)
}
