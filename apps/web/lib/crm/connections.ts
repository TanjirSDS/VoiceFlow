import { open, seal, type Db } from '@voiceflow/db'
import { refreshTokens } from './oauth'
import { CrmAuthError, type CrmConnection, type CrmProviderId, type TokenSet } from './types'

// Phase 25 — reading and writing org_crm_connections.
//
// Everything that touches the sealed columns goes through here, so there is one
// place that knows the tokens are encrypted and one place that can leak them.
// `db` must be the SERVICE client: the table has RLS on with no policies and no
// grant to anon/authenticated, so a user client sees nothing at all (by design —
// see the migration's comment).

/**
 * Refresh this far before the token actually dies.
 *
 * HubSpot's access tokens last 1800s and Pipedrive's 3600s, so a minute of slack
 * is small either way. It exists because the gap between "we checked expiry" and
 * "the provider evaluated the token" spans a search and a write, and a token that
 * expires inside that gap turns a normal sync into a 401 retry.
 */
const REFRESH_SKEW_MS = 60_000

export interface StoredConnection {
  orgId: string
  provider: CrmProviderId
  accessTokenSealed: string
  refreshTokenSealed: string
  accessExpiresAt: string
  apiBaseUrl: string | null
  status: 'active' | 'revoked'
}

const COLUMNS = 'org_id, provider, access_token_sealed, refresh_token_sealed, access_expires_at, api_base_url, status'

function row(r: Record<string, unknown>): StoredConnection {
  return {
    orgId: r.org_id as string,
    provider: r.provider as CrmProviderId,
    accessTokenSealed: r.access_token_sealed as string,
    refreshTokenSealed: r.refresh_token_sealed as string,
    accessExpiresAt: r.access_expires_at as string,
    apiBaseUrl: (r.api_base_url as string | null) ?? null,
    status: r.status as 'active' | 'revoked',
  }
}

/** Persist a freshly-issued token set. Used by the callback and by refresh. */
export async function storeConnection(
  db: Db,
  orgId: string,
  provider: CrmProviderId,
  tokens: TokenSet,
  connectedBy?: string
): Promise<void> {
  const { error } = await db.from('org_crm_connections').upsert(
    {
      org_id: orgId,
      provider,
      // AAD = org id, so this ciphertext cannot be moved to another org's row.
      access_token_sealed: seal(tokens.accessToken, orgId),
      refresh_token_sealed: seal(tokens.refreshToken, orgId),
      access_expires_at: tokens.expiresAt.toISOString(),
      api_base_url: tokens.apiBaseUrl ?? null,
      scopes: tokens.scopes,
      external_account_id: tokens.externalAccountId ?? null,
      // Re-connecting is the documented cure for a revoked connection, so a
      // successful store always clears the revoked state rather than leaving the
      // org staring at a "Reconnect" button they just used.
      status: 'active',
      status_detail: null,
      ...(connectedBy ? { connected_by: connectedBy } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'org_id,provider' }
  )
  if (error) throw new Error(`org_crm_connections upsert: ${error.message}`)
}

/**
 * Mark a connection dead, with the reason.
 *
 * Reached on any CrmAuthError, which includes the entirely ordinary case of a
 * Pipedrive refresh token that went 60 days unused. Nothing here pages; the UI
 * reads status via org_crm_connection_status and offers Reconnect.
 */
export async function markRevoked(db: Db, orgId: string, provider: CrmProviderId, detail: string): Promise<void> {
  await db
    .from('org_crm_connections')
    .update({ status: 'revoked', status_detail: detail.slice(0, 500), updated_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('provider', provider)
}

/** Every active connection for an org — the set the post-call job fans out over. */
export async function activeConnections(db: Db, orgId: string): Promise<StoredConnection[]> {
  const { data, error } = await db
    .from('org_crm_connections')
    .select(COLUMNS)
    .eq('org_id', orgId)
    .eq('status', 'active')
  if (error) throw new Error(`org_crm_connections select: ${error.message}`)
  return (data ?? []).map(row)
}

/**
 * A usable connection: unsealed, and refreshed first if the access token is at
 * or near expiry.
 *
 * Throws CrmAuthError when the refresh itself fails, having already marked the
 * row revoked — so the caller's one job is to stop, not to work out whether this
 * is retryable. It is not: no amount of retrying revives a refresh token the
 * provider has rejected.
 */
export async function usableConnection(db: Db, stored: StoredConnection): Promise<CrmConnection> {
  const expiresAt = new Date(stored.accessExpiresAt).getTime()

  if (Date.now() < expiresAt - REFRESH_SKEW_MS) {
    return {
      orgId: stored.orgId,
      provider: stored.provider,
      accessToken: open(stored.accessTokenSealed, stored.orgId),
      apiBaseUrl: stored.apiBaseUrl,
    }
  }

  const refreshToken = open(stored.refreshTokenSealed, stored.orgId)
  let tokens: TokenSet
  try {
    tokens = await refreshTokens(stored.provider, refreshToken)
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    await markRevoked(db, stored.orgId, stored.provider, detail)
    throw new CrmAuthError(`${stored.provider} refresh failed for org ${stored.orgId}: ${detail}`)
  }

  // Pipedrive reissues the same refresh token with a fresh 60-day window, so
  // writing back is what keeps a low-volume org connected. HubSpot returns one
  // too. Either way: persist whatever came back, never the one we sent.
  await storeConnection(db, stored.orgId, stored.provider, tokens)

  return {
    orgId: stored.orgId,
    provider: stored.provider,
    accessToken: tokens.accessToken,
    // A refresh can, in principle, hand back a different api_domain; prefer the
    // fresh one and fall back to what we had.
    apiBaseUrl: tokens.apiBaseUrl ?? stored.apiBaseUrl,
  }
}
