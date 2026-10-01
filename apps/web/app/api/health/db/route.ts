import { GET as health } from '../route'

export const dynamic = 'force-dynamic'

// Railway's deploy healthcheck. Railway rejects '?' in a healthcheck path, so
// /api/health?scope=db needs a path of its own — same probe, same response.
export const GET = (req: Request) => health(new Request(new URL('/api/health?scope=db', req.url)))
