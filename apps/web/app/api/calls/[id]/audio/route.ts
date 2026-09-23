import type { NextRequest } from 'next/server'
import { serviceClient } from '@voiceflow/db'
import { makeEngine } from '../../../../../lib/engine'
import { resolveRecording, SIGNED_URL_TTL_SECS } from '../../../../../lib/recordings'
import { userClient } from '../../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

// The only way to hear a call. Phase 22 put the audio in a private bucket, so
// this route hands out a short-lived signed URL for it — after resolveRecording
// has checked, on the CALLER's RLS-scoped client, that the call is theirs.
// Another org's call id 404s here and never reaches the signing step.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const found = await resolveRecording(await userClient(), serviceClient(), id)

  switch (found.kind) {
    // Does not exist, or is not yours. Deliberately the same answer for both.
    case 'not-found':
      return new Response('call not found', { status: 404 })

    // Existed, retention window ran out. 410 rather than 404 because the caller
    // is entitled to know the difference — they own the call — and the UI can
    // say "deleted after N days" instead of "missing".
    case 'gone':
      return new Response('recording deleted — past this org’s retention window', { status: 410 })

    case 'signed':
      // no-store is load-bearing: the signed URL in this Location header is a
      // bearer token. A shared cache holding this 302 would hand it to the next
      // caller, whoever they are.
      return new Response(null, {
        status: 302,
        headers: { location: found.url, 'cache-control': 'private, no-store' },
      })

    // Not archived yet (the job runs on call/recorded, so there is a window
    // right after a call) or the org keeps retention off — stream it through,
    // which is what this route did for every call before Phase 22.
    case 'proxy':
      try {
        const { audio, contentType } = await makeEngine().fetchRecording(found.providerCallId)
        return new Response(audio, {
          headers: {
            'content-type': contentType,
            'content-length': String(audio.byteLength),
            // Finished-call audio is immutable, but it is also someone's phone
            // call: private, and never longer than a signed URL would have lived.
            'cache-control': `private, max-age=${SIGNED_URL_TTL_SECS}`,
          },
        })
      } catch {
        return new Response('recording unavailable', { status: 404 })
      }
  }
}
