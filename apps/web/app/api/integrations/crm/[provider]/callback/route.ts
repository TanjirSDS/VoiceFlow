import type { NextRequest } from 'next/server'
import { serviceClient } from '@voiceflow/db'
import { appUrl } from '../../../../../../lib/email'
import { currentUser } from '../../../../../../lib/auth'
import {
  exchangeCode,
  nonceCookieName,
  redirectUriFor,
  verifyState,
} from '../../../../../../lib/crm/oauth'
import { storeConnection } from '../../../../../../lib/crm/connections'
import { hubspotVerify } from '../../../../../../lib/crm/hubspot'
import { pipedriveVerify } from '../../../../../../lib/crm/pipedrive'
import { isCrmProvider, type CrmProviderId } from '../../../../../../lib/crm/types'

export const dynamic = 'force-dynamic'

function back(params: Record<string, string>): Response {
  const url = new URL('/integrations', appUrl())
  // Back to the tab the CRM cards live on, not the default one — landing on
  // "Connected" after connecting shows the user everything except the thing
  // they just did.
  url.searchParams.set('tab', 'available')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new Response(null, {
    status: 302,
    headers: { location: url.toString(), 'cache-control': 'private, no-store' },
  })
}

/** Prove the tokens actually work before we claim the CRM is connected. */
async function verifyCredentials(provider: CrmProviderId, accessToken: string, apiBaseUrl?: string) {
  const conn = { orgId: '', provider, accessToken, apiBaseUrl }
  if (provider === 'hubspot') return hubspotVerify(conn)
  return pipedriveVerify(conn)
}

// Phase 25 — step two: the provider redirects here with a code. Exchange it,
// prove it works, store it sealed.
export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params
  if (!isCrmProvider(provider)) return new Response('unknown CRM provider', { status: 404 })

  const url = new URL(req.url)
  // The user clicked Deny, or the provider refused. Not an error worth a stack
  // trace — send them back with the provider's own word for what happened.
  const denied = url.searchParams.get('error')
  if (denied) return back({ crm_error: `${provider}: ${denied}` })

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state) return back({ crm_error: `${provider}: callback was missing a code` })

  try {
    // Signature proves we minted this state (and carries the org id); the cookie
    // proves it came back in the browser we minted it for. Both, or a captured
    // callback URL could connect an attacker's CRM to this workspace — after
    // which every call this org takes would be logged into that CRM.
    const cookieNonce = req.cookies.get(nonceCookieName(provider))?.value
    const verified = verifyState(state, provider, cookieNonce)

    const tokens = await exchangeCode(provider, code, redirectUriFor(provider))

    // A token that parses is not a token that works: a consent screen completed
    // with the wrong scopes, or a Pipedrive install whose api_domain we cannot
    // reach, both produce a perfectly well-formed response. Better to find out
    // here, while the user is watching, than on their first real call.
    await verifyCredentials(provider, tokens.accessToken, tokens.apiBaseUrl)

    const user = await currentUser()
    // Service client: org_crm_connections is RLS-on-with-no-policies, so the
    // user's own client cannot write it by design.
    await storeConnection(serviceClient(), verified.orgId, provider, tokens, user?.email ?? undefined)

    const res = back({ crm_connected: provider })
    // Burn the nonce — it has done its job and must not authorize a second
    // callback.
    res.headers.append('set-cookie', `${nonceCookieName(provider)}=; Path=/; HttpOnly; Max-Age=0`)
    return res
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    console.error(`crm connect ${provider} failed:`, detail)
    // The message is shown to the owner, who is the person who can act on it
    // ("token endpoint 400: redirect_uri mismatch" is the actual fix).
    return back({ crm_error: `${provider}: ${detail}`.slice(0, 300) })
  }
}
