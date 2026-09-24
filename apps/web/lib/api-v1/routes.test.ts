import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

// middleware.ts exempts /api/v1 from the session gate, because these routes
// authenticate with a bearer key instead. That makes withApiAuth() the ONLY
// thing standing in front of tenant data there — a route added later that
// forgets the wrapper is silently public. This test is the guard: it reads
// every route under app/api/v1 and refuses one whose handlers aren't wrapped.

const V1 = join(__dirname, '../../app/api/v1')
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

function routeFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return routeFiles(p)
    return e.name === 'route.ts' ? [p] : []
  })
}

const files = routeFiles(V1)

describe('/api/v1 routes', () => {
  test('there are routes to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  test.each(files.map((f) => [f.slice(f.indexOf('app/api/v1')), f]))(
    '%s wraps every handler in withApiAuth',
    (_label, file) => {
      const src = readFileSync(file, 'utf8')
      const exported = METHODS.filter((m) => new RegExp(`export\\s+const\\s+${m}\\b`).test(src))
      expect(exported.length, 'route file exports no HTTP method').toBeGreaterThan(0)

      for (const m of exported) {
        const assignment = new RegExp(`export\\s+const\\s+${m}\\s*=\\s*withApiAuth\\(`).test(src)
        expect(assignment, `${m} must be assigned from withApiAuth(...)`).toBe(true)
      }
      // ...and the import has to be the real wrapper, not a local shadow.
      expect(/import\s*\{[^}]*\bwithApiAuth\b[^}]*\}\s*from\s*'[^']*api-v1\/wrapper'/.test(src)).toBe(true)
    }
  )
})
