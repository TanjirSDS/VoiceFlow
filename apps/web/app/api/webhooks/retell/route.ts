import type { NextRequest } from 'next/server'
import { getEnv, serviceClient } from '@voiceflow/db'
import { handleCallWebhook } from '../../../../lib/call-webhook'
import { makeEngine } from '../../../../lib/engine'
import { emit } from '../../../../lib/events'
import { classifyCall } from '../../../../lib/outcome'
import { rateLimit } from '../../../../lib/ratelimit'
import { enqueueWebhookEvent } from '../../../../lib/webhooks-out'

// Phase 26. The twin of the ElevenLabs route — same rule-2 pipeline, different
// signature header and provider tag. Retell stamps this URL on each agent at
// create/update time (it has no workspace-level call webhook), so an agent
// created before RETELL_API_KEY/APP_URL were set will not deliver here until
// its next save.
//
// Retell fires call_ended at hangup and call_analyzed once analysis is done.
// Both land here and both get a webhook_events row; only call_analyzed writes
// the calls row, because only it carries call_analysis.
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!(await rateLimit('webhook', `retell:${ip}`)).success) {
    return new Response('rate limited', { status: 429 })
  }
  const rawBody = await req.text() // raw body needed for HMAC verification
  const db = serviceClient()
  const res = await handleCallWebhook(
    'retell',
    rawBody,
    req.headers.get('x-retell-signature'),
    makeEngine('retell'),
    db,
    (transcript) => classifyCall(transcript, getEnv().OPENAI_API_KEY),
    (providerCallId) => emit('call/recorded', { providerCallId }),
    (orgId, ev) =>
      enqueueWebhookEvent(db, { orgId, eventType: 'call.completed', eventKey: ev.providerCallId, payload: ev })
  )
  return new Response(res.body, { status: res.status })
}
