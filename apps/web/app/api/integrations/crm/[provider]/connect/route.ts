import type { NextRequest } from 'next/server'
import { appUrl } from '../../../../../../lib/email'
import {
  authorizeUrl,
  nonceCookieName,
  oauthCredentials,
  redirectUriFor,
  signState,
} from '../../../../../../lib/crm/oauth'
import { activeOrg } from '../../../../../../lib/org'
import { isCrmProvider } from '../../../../../../lib/crm/types'

export const dynamic = 'force-dynamic'

// Phase 25 — step one of the connect flow: send the owner to the provider's
// consent screen with a state we can later prove we minted.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params
  if (!isCrmProvider(provider)) return new Response('unknown CRM provider', { status: 404 })

  const org = await activeOrg()
  if (!org) return new Response('you are not a member of any organization', { status: 403 })
  // Owner-gated like the other credential-bearing integrations (Cal.com, billing).
  // Connecting a CRM exports every call this workspace takes into an external
  // system; that is an owner's decision, not any member's.
  if (org.role !== 'owner') {
    return new Response('only the workspace owner can connect a CRM', { status: 403 })
  }

  if (!oauthCredentials(provider)) {
    // No client id/secret on this deployment. Answered here rather than at the
    // provider, where the user would meet an opaque consent-screen error.
    return new Response(`${provider} is not configured on this deployment`, { status: 501 })
  }

  const { state, nonce } = signState(org.orgId, provider)

  return new Response(null, {
    status: 302,
    headers: {
      location: authorizeUrl(provider, redirectUriFor(provider), state),
      // SameSite=Lax, deliberately: the callback is a top-level GET navigation
      // from the provider's domain, which Lax permits and Strict would drop —
      // and a dropped nonce fails every connection attempt. HttpOnly because no
      // script needs it; Secure in production only, so localhost still works.
      'set-cookie':
        `${nonceCookieName(provider)}=${nonce}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600` +
        (appUrl().startsWith('https://') ? '; Secure' : ''),
      'cache-control': 'private, no-store',
    },
  })
}
