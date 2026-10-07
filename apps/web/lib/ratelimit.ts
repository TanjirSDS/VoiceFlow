import { getEnv } from '@voiceflow/db'

// Upstash sliding-window limits. Without UPSTASH_* env vars every check
// passes — rate limiting is a production knob, not a dev requirement.

type Limiter = { limit: (id: string) => Promise<{ success: boolean }> }

const WINDOWS = {
  /** Magic-link sends: brute-force + email-bombing protection. */
  auth: { tokens: 8, window: '15 m' },
  /** Webhook endpoints: flood protection ahead of signature verification. */
  webhook: { tokens: 300, window: '1 m' },
  /** Phase 24 public API, per key (not per IP — a key is the tenant identity,
   *  and one customer's CI box must not spend another's budget). Generous
   *  enough for a sync loop, low enough that a runaway script is capped. */
  api: { tokens: 120, window: '1 m' },
} as const

let limiters: Partial<Record<keyof typeof WINDOWS, Limiter>> | null | undefined

async function getLimiters() {
  if (limiters !== undefined) return limiters
  const env = getEnv()
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    limiters = null
    return limiters
  }
  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import('@upstash/ratelimit'),
    import('@upstash/redis'),
  ])
  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  limiters = Object.fromEntries(
    Object.entries(WINDOWS).map(([kind, w]) => [
      kind,
      new Ratelimit({ redis, prefix: `rl:${kind}`, limiter: Ratelimit.slidingWindow(w.tokens, w.window) }),
    ])
  )
  return limiters
}

// Sign-in attempts must never be unlimited, so without Upstash the 'auth'
// window falls back to this process's memory. Webhooks and the API keep
// failing open as before.
// ponytail: per-process, so N instances allow N× the window and a flood of
// distinct ids evicts the oldest — configure UPSTASH_* before scaling out.
const memory = new Map<string, number[]>()
function memoryLimit(kind: keyof typeof WINDOWS, id: string): { success: boolean } {
  const w = WINDOWS[kind]
  const windowMs = Number.parseInt(w.window, 10) * 60_000 // every window is in minutes
  const now = Date.now()
  const key = `${kind}:${id}`
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= w.tokens) return { success: false }
  hits.push(now)
  memory.set(key, hits)
  if (memory.size > 50_000) memory.delete(memory.keys().next().value!)
  return { success: true }
}

export async function rateLimit(kind: keyof typeof WINDOWS, id: string): Promise<{ success: boolean }> {
  try {
    const l = await getLimiters()
    if (!l) return kind === 'auth' ? memoryLimit(kind, id) : { success: true }
    return await l[kind]!.limit(id)
  } catch (e) {
    // Redis down must not take auth/webhooks down with it — fail open.
    console.error('rate limit check failed (allowing):', e)
    return { success: true }
  }
}
