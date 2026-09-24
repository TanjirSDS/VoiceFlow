import { NextResponse, type NextRequest } from 'next/server'
import { pool } from '@voiceflow/db'
import { getAuth } from './lib/auth'

// Signature-verified or secret-guarded machine routes, plus the login/signup flows.
const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/auth',
  '/share',
  '/api/auth',
  '/api/webhooks',
  '/api/cron',
  '/api/health',
  '/api/inngest',
  '/api/tools',
  // Phase 24: the public API authenticates with a bearer key, not a session
  // cookie. withApiAuth() is the gate — see lib/api-v1/wrapper.ts.
  '/api/v1',
]

// Gates everything else behind a real session check (Node runtime, so Better
// Auth validates against the sessions table — a cookie-presence check could be
// forged). Org resolution happens per-request in lib/org.ts (RLS does the scoping).
export async function middleware(req: NextRequest) {
  // ponytail: DEV_BYPASS_AUTH=1 skips the login gate — local skeleton preview
  // only (no signed-in user exists). Delete once local signup works.
  if (process.env.DEV_BYPASS_AUTH === '1') return NextResponse.next()
  // returnHeaders: a session past its daily refresh comes back with a new
  // Set-Cookie, which every response below forwards (was @supabase/ssr's job).
  const { headers: authHeaders, response: session } = await getAuth().api.getSession({
    headers: req.headers,
    returnHeaders: true,
  })
  const user = session?.user
  const send = (res: NextResponse) => {
    for (const c of authHeaders.getSetCookie()) res.headers.append('set-cookie', c)
    return res
  }

  const path = req.nextUrl.pathname
  if (!user && !PUBLIC_PREFIXES.some((p) => path.startsWith(p))) {
    return send(NextResponse.redirect(new URL('/login', req.url)))
  }

  // Phase 6: a signed-in user with no org is mid-signup — route them into the
  // flow instead of an empty app. Skipped for admins impersonating an org
  // (activeOrg validates the cookie; a spoofed one is simply ignored there).
  // ponytail: one indexed select per authenticated page request — cache the
  // membership bit on the session if this ever shows up in latency.
  if (
    user &&
    !path.startsWith('/signup') &&
    !path.startsWith('/api') &&
    !path.startsWith('/auth') &&
    !path.startsWith('/admin') && // support staff have no memberships
    !req.cookies.get('admin-view-org')
  ) {
    const { rowCount } = await pool().query('select 1 from public.org_members where user_id = $1 limit 1', [user.id])
    if (!rowCount) return send(NextResponse.redirect(new URL('/signup/org', req.url)))
  }
  return send(NextResponse.next())
}

export const config = {
  runtime: 'nodejs', // stable since Next 15.5; needed for pg + a real session lookup
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
