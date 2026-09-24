import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { getEnv } from '@voiceflow/db'
import { appUrl } from '../email'
import { CrmAuthError, type CrmProviderId, type TokenSet } from './types'

// Phase 25 — OAuth 2.0 authorization-code flow for both CRMs.
//
// Every URL, scope string and grant parameter below is from
// docs/phase-25-crm-sync-research.md; the bracketed rows are its register. The
// two providers differ in three ways that cannot be papered over:
//
//   • client authentication — HubSpot puts client_id/secret in the form body,
//     Pipedrive wants HTTP Basic (register row 3);
//   • token lifetime — 1800s vs 3600s (row 5);
//   • API base URL — HubSpot's is fixed, Pipedrive's arrives IN the token
//     response as api_domain and is per-install (row 8).
//
// The scope lists are the other load-bearing detail. For HubSpot they are
// deliberately only the two contacts scopes: the Calls API's own requirements
// section asks for `crm.objects.contacts.read`/`.write`, NOT a call-specific
// scope (row 10). `crm.objects.calls.write` exists but is gated to the Calling
// Extensions SDK and absent from the public scopes table — requesting it does
// not fail at call time, it fails at INSTALL time, leaving the customer at a
// broken consent screen.

export interface OAuthSpec {
  id: CrmProviderId
  label: string
  scopes: string[]
  authorizeUrl: string
  tokenUrl: string
  /** Whether this provider has a per-install API base URL to persist. */
  perInstallBaseUrl: boolean
}

export const OAUTH_SPECS: Record<CrmProviderId, OAuthSpec> = {
  hubspot: {
    id: 'hubspot',
    label: 'HubSpot',
    // Register row 10 — two scopes, no call-specific scope. Do not "helpfully"
    // add crm.objects.calls.write here.
    scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write'],
    authorizeUrl: 'https://app.hubspot.com/oauth/authorize',
    // Dated version: the numeric /v1/ path is announced unsupported after
    // September 2027 and the docs say new integrations should use the latest
    // date version. One constant, so the next bump is one line.
    tokenUrl: 'https://api.hubapi.com/oauth/2026-09/token',
    perInstallBaseUrl: false,
  },
  pipedrive: {
    id: 'pipedrive',
    label: 'Pipedrive',
    // `base` is mandatory for every Pipedrive app; the other two are the read+
    // write pair this integration actually uses.
    scopes: ['base', 'contacts:full', 'activities:full'],
    authorizeUrl: 'https://oauth.pipedrive.com/oauth/authorize',
    tokenUrl: 'https://oauth.pipedrive.com/oauth/token',
    perInstallBaseUrl: true,
  },
}

/** Credentials for one provider, or null when the app isn't configured for it. */
export function oauthCredentials(provider: CrmProviderId): { clientId: string; clientSecret: string } | null {
  const env = getEnv()
  const clientId = provider === 'hubspot' ? env.HUBSPOT_CLIENT_ID : env.PIPEDRIVE_CLIENT_ID
  const clientSecret = provider === 'hubspot' ? env.HUBSPOT_CLIENT_SECRET : env.PIPEDRIVE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret }
}

/** Which providers this deployment can actually offer (both keys present). */
export function configuredProviders(): CrmProviderId[] {
  return (Object.keys(OAUTH_SPECS) as CrmProviderId[]).filter((p) => oauthCredentials(p) !== null)
}

// ── state ───────────────────────────────────────────────────────────────────
//
// The callback arrives as a plain GET from the provider's domain, so without a
// state check anyone could hand a logged-in owner a link that connects OUR app
// to THEIR CRM — and every subsequent call of theirs would be logged into an
// attacker's account. The state is HMAC-signed (it carries the org id, so the
// callback knows which tenant to store against, and a forged org id fails the
// MAC) and its nonce is echoed in an httpOnly cookie the callback re-checks, so
// a captured URL cannot be replayed in someone else's browser.

const STATE_TTL_MS = 10 * 60_000

function stateKey(): Buffer {
  // BETTER_AUTH_SECRET is already the app's session-signing secret and is
  // required (≥32 chars), so state signing has no new key to manage or rotate.
  return Buffer.from(getEnv().BETTER_AUTH_SECRET, 'utf8')
}

export interface OAuthState {
  orgId: string
  provider: CrmProviderId
  nonce: string
  issuedAt: number
}

export function signState(orgId: string, provider: CrmProviderId): { state: string; nonce: string } {
  const nonce = randomBytes(16).toString('hex')
  const payload: OAuthState = { orgId, provider, nonce, issuedAt: Date.now() }
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const mac = createHmac('sha256', stateKey()).update(body).digest('base64url')
  return { state: `${body}.${mac}`, nonce }
}

/** Throws CrmAuthError on anything wrong — forged, stale, or wrong provider. */
export function verifyState(state: string, provider: CrmProviderId, cookieNonce: string | undefined): OAuthState {
  const [body, mac] = state.split('.')
  if (!body || !mac) throw new CrmAuthError('malformed OAuth state')

  const expected = createHmac('sha256', stateKey()).update(body).digest('base64url')
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new CrmAuthError('OAuth state failed signature check')

  let parsed: OAuthState
  try {
    parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OAuthState
  } catch {
    throw new CrmAuthError('OAuth state payload is not readable')
  }

  if (parsed.provider !== provider) throw new CrmAuthError('OAuth state is for a different provider')
  if (Date.now() - parsed.issuedAt > STATE_TTL_MS) throw new CrmAuthError('OAuth state expired — start the connection again')
  // The signature proves WE minted this state; the cookie proves it came back in
  // the same browser we minted it for. Both, or the replay above is still open.
  if (!cookieNonce || cookieNonce !== parsed.nonce) throw new CrmAuthError('OAuth state did not match this browser session')

  return parsed
}

// ── route helpers ───────────────────────────────────────────────────────────
//
// These live here rather than beside the routes that use them because a Next.js
// route module may only export the handler names it recognizes (GET, POST,
// dynamic, …) — exporting a helper from route.ts fails the production build
// with "is not a valid Route export field", which neither tsc nor eslint flags.

/** Where the provider sends the user back. Must match the app registration exactly. */
export function redirectUriFor(provider: CrmProviderId): string {
  return `${appUrl()}/api/integrations/crm/${provider}/callback`
}

/** The nonce cookie backing the signed state — one per provider, so two
 *  half-finished connect flows in one browser cannot clobber each other. */
export function nonceCookieName(provider: CrmProviderId): string {
  return `crm-oauth-${provider}`
}

// ── the flow ────────────────────────────────────────────────────────────────

export function authorizeUrl(provider: CrmProviderId, redirectUri: string, state: string): string {
  const spec = OAUTH_SPECS[provider]
  const creds = oauthCredentials(provider)
  if (!creds) throw new CrmAuthError(`${spec.label} is not configured on this deployment`)

  const url = new URL(spec.authorizeUrl)
  url.searchParams.set('client_id', creds.clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  // HubSpot wants space-separated scopes; Pipedrive derives the grant from the
  // app registration and ignores a scope param, but sending it is harmless and
  // keeps one code path.
  url.searchParams.set('scope', spec.scopes.join(' '))
  if (provider === 'hubspot') url.searchParams.set('response_type', 'code')
  return url.toString()
}

interface RawTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scope?: string
  scopes?: string[]
  api_domain?: string
  hub_id?: number
  /** Pipedrive nests the company id here on some responses. */
  company_id?: number
}

async function postToken(provider: CrmProviderId, body: URLSearchParams): Promise<TokenSet> {
  const spec = OAUTH_SPECS[provider]
  const creds = oauthCredentials(provider)
  if (!creds) throw new CrmAuthError(`${spec.label} is not configured on this deployment`)

  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (provider === 'pipedrive') {
    // Register row 3: Pipedrive authenticates the CLIENT with HTTP Basic.
    headers.Authorization = `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64')}`
  } else {
    // HubSpot takes them as body parameters instead.
    body.set('client_id', creds.clientId)
    body.set('client_secret', creds.clientSecret)
  }

  const res = await fetch(spec.tokenUrl, { method: 'POST', headers, body })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    // Every failure here is terminal for this attempt: a bad code, a revoked
    // refresh token, a mis-registered redirect_uri. None are helped by a retry,
    // and CrmAuthError is what tells the caller to mark the connection revoked
    // rather than to try again.
    throw new CrmAuthError(`${spec.label} token endpoint ${res.status}: ${detail.slice(0, 300)}`)
  }

  const raw = (await res.json()) as RawTokenResponse
  if (!raw.access_token || !raw.refresh_token) {
    throw new CrmAuthError(`${spec.label} token response was missing a token`)
  }

  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    // expires_in is seconds and differs per provider (1800 / 3600). Stored as an
    // absolute instant so nothing downstream has to remember which is which. A
    // small safety margin is applied at read time, not here.
    expiresAt: new Date(Date.now() + raw.expires_in * 1000),
    scopes: raw.scopes ?? (raw.scope ? raw.scope.split(' ') : []),
    // Register row 8 — Pipedrive's per-install base URL. Persisting this is not
    // optional: calling the wrong company_domain with a valid token is how one
    // tenant's calls end up in another tenant's CRM.
    apiBaseUrl: raw.api_domain,
    externalAccountId: raw.hub_id?.toString() ?? raw.company_id?.toString(),
  }
}

export function exchangeCode(provider: CrmProviderId, code: string, redirectUri: string): Promise<TokenSet> {
  return postToken(
    provider,
    new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri })
  )
}

/**
 * Refresh. Pipedrive reissues THE SAME refresh token with its 60-day window
 * pushed out; HubSpot returns one in the response too. Either way the caller
 * writes back whatever came out — which is what keeps a Pipedrive connection
 * alive for an org whose calls are sporadic.
 */
export function refreshTokens(provider: CrmProviderId, refreshToken: string): Promise<TokenSet> {
  return postToken(provider, new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }))
}
