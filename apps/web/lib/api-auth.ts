import { hashApiKey, parseBearer } from './api-keys'

// Phase 24: bearer-key authentication for /api/v1. This is a NEW AUTH SURFACE —
// the only entry point to tenant data that carries no session cookie — so the
// rules are deliberately narrow:
//   * the presented key is hashed and looked up by hash; the raw key is never a
//     query value and never written anywhere,
//   * every failure answers with the same generic message (no oracle telling an
//     attacker whether a key exists, is revoked, or belongs to the wrong plan),
//   * resolving a key yields an ORG, and every later read goes through an
//     RLS-scoped client for exactly that org (see apiKeyDb in @voiceflow/db).

/** The key row joined to its org's plan entitlement. */
export interface ApiKeyRow {
  id: string
  org_id: string
  revoked_at: string | null
  /** plans.api_enabled for the owning org — Pro only. */
  api_enabled: boolean
}

export interface ApiAuthDeps {
  /** Single indexed lookup by sha256 hash. Runs as service role: the caller has
   *  no session, so RLS cannot scope the query that establishes who they are. */
  lookupKey: (hash: string) => Promise<ApiKeyRow | null>
  /** Best-effort last_used_at stamp. */
  touchKey: (id: string) => Promise<void>
}

export type ApiAuthResult =
  | { ok: true; orgId: string; keyId: string }
  | { ok: false; status: 401 | 403; code: string; message: string }

const UNAUTHORIZED = {
  ok: false,
  status: 401,
  code: 'invalid_api_key',
  // Same text for absent/malformed/unknown/revoked — deliberately no detail.
  message: 'Invalid or revoked API key.',
} as const

export async function authenticateApiKey(
  authHeader: string | null,
  deps: ApiAuthDeps
): Promise<ApiAuthResult> {
  const presented = parseBearer(authHeader)
  if (!presented) return UNAUTHORIZED

  const row = await deps.lookupKey(hashApiKey(presented))
  if (!row) return UNAUTHORIZED
  if (row.revoked_at) return UNAUTHORIZED

  if (!row.api_enabled) {
    return {
      ok: false,
      status: 403,
      code: 'plan_upgrade_required',
      message: 'The public API is available on the Pro plan.',
    }
  }

  // Usage telemetry must never be able to fail an authenticated request.
  try {
    await deps.touchKey(row.id)
  } catch (e) {
    console.error('api key last_used_at update failed (allowing):', e)
  }

  return { ok: true, orgId: row.org_id, keyId: row.id }
}
