import { CrmAuthError, CrmRetryableError } from './types'

// Phase 25 — one fetch wrapper, two rate-limit dialects.
//
// The research register's "Rate limits and 429 semantics" section is the whole
// reason this file is parameterized rather than shared: HubSpot answers a 429
// with a Retry-After header telling us how long to wait, and Pipedrive answers
// with x-ratelimit-* and no Retry-After at all. Treating those the same means
// either ignoring a number HubSpot went to the trouble of sending, or inventing
// one for Pipedrive and calling it authoritative.
//
// Note both providers' SEARCH endpoints are far stricter than their general
// limits (HubSpot 5/s per account, Pipedrive 10 per 2s on any plan) — and search
// is the call this integration makes on every single call. The search is the
// limit that binds, so retrying it politely matters more than retrying the write.

/** How long to wait after a 429, given the response. Provider-specific. */
export type RetryAfterReader = (res: Response) => number | undefined

/** HubSpot: obey Retry-After (documented, in seconds). */
export const hubspotRetryAfter: RetryAfterReader = (res) => {
  const raw = res.headers.get('retry-after')
  if (!raw) return undefined
  const secs = Number(raw)
  return Number.isFinite(secs) && secs >= 0 ? secs * 1000 : undefined
}

/**
 * Pipedrive: no Retry-After. x-ratelimit-reset is "the remaining window before
 * the rate limit resets" — seconds of the current 2s burst window, so it is a
 * hint for burst rejection only and says nothing about a depleted daily budget.
 * Undefined falls through to exponential backoff, which is the honest answer.
 */
export const pipedriveRetryAfter: RetryAfterReader = (res) => {
  const raw = res.headers.get('x-ratelimit-reset')
  if (!raw) return undefined
  const secs = Number(raw)
  return Number.isFinite(secs) && secs >= 0 ? secs * 1000 : undefined
}

const MAX_ATTEMPTS = 3
const BASE_BACKOFF_MS = 500
/** Never sit on an Inngest step longer than this waiting for a rate limit. */
const MAX_BACKOFF_MS = 8_000

function backoffMs(attempt: number): number {
  const exponential = BASE_BACKOFF_MS * 2 ** attempt
  // Jitter: several orgs' calls end at once far more often than you would think
  // (a queue drains, a campaign chunk finishes), and un-jittered backoff marches
  // them into the next window together.
  const jitter = Math.random() * BASE_BACKOFF_MS
  return Math.min(exponential + jitter, MAX_BACKOFF_MS)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface CrmFetchOptions extends RequestInit {
  retryAfter: RetryAfterReader
  /** For error messages: 'hubspot search contacts'. */
  label: string
}

/**
 * Fetch with in-process retry for transient failures.
 *
 * This is the INNER retry, deliberately short (3 attempts, capped backoff). The
 * outer one is Inngest's, which re-runs the whole step minutes later with its own
 * backoff and dead-letters to Sentry when exhausted. A depleted Pipedrive daily
 * budget is not something to sit and spin on inside a function invocation — it
 * wants the outer loop, and CrmRetryableError is how it gets there.
 */
export async function crmFetch(url: string, opts: CrmFetchOptions): Promise<Response> {
  const { retryAfter, label, ...init } = opts
  let lastError: Error | undefined

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(backoffMs(attempt - 1))

    let res: Response
    try {
      res = await fetch(url, init)
    } catch (e) {
      // Network-level failure: no response to read a hint from.
      lastError = new CrmRetryableError(`${label}: ${e instanceof Error ? e.message : String(e)}`)
      continue
    }

    if (res.ok) return res

    // 401 means the access token is dead. The caller refreshes and retries once
    // at a higher level — retrying here with the same dead token cannot help.
    if (res.status === 401) throw new CrmAuthError(`${label}: 401 from provider`)
    // 403 is an authorization answer, not a capacity one: a missing scope, or
    // Pipedrive's sustained-abuse response. Neither improves by trying again.
    if (res.status === 403) throw new CrmAuthError(`${label}: 403 — ${await safeBody(res)}`)

    if (res.status === 429 || res.status >= 500) {
      const hint = res.status === 429 ? retryAfter(res) : undefined
      lastError = new CrmRetryableError(`${label}: ${res.status} — ${await safeBody(res)}`, hint)
      // A provider-supplied wait beats our guess, but only up to the cap — a
      // long Retry-After belongs to the outer loop, not to this invocation.
      if (hint !== undefined && hint <= MAX_BACKOFF_MS) await sleep(hint)
      continue
    }

    // 4xx that is our fault (bad property name, malformed body). Retrying sends
    // the identical broken request, so fail now with the provider's own words —
    // "property X does not exist" is the actual fix, and swallowing it turns a
    // five-minute mapping correction into an afternoon.
    throw new Error(`${label}: ${res.status} — ${await safeBody(res)}`)
  }

  throw lastError ?? new CrmRetryableError(`${label}: exhausted ${MAX_ATTEMPTS} attempts`)
}

/** Response bodies land in logs and sync rows; keep them bounded and never throw. */
async function safeBody(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500)
  } catch {
    return '<unreadable body>'
  }
}

export async function crmJson<T>(url: string, opts: CrmFetchOptions): Promise<T> {
  const res = await crmFetch(url, opts)
  return (await res.json()) as T
}
