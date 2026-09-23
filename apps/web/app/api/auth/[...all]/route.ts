import { getAuth } from '../../../../lib/auth'

// Better Auth's endpoints (magic-link verify lands here). Plain wrappers
// instead of toNextJsHandler(auth) so getAuth() stays lazy at build time.
export const GET = (req: Request) => getAuth().handler(req)
export const POST = (req: Request) => getAuth().handler(req)
