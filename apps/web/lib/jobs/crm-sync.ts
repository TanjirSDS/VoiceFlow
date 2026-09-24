import { serviceClient } from '@voiceflow/db'
import { activeConnections } from '../crm/connections'
import { syncCallToCrm } from '../crm/sync'
import { inngest } from '../inngest'

// Phase 25 — post-call CRM sync.
//
// Rides the existing `call/recorded` event, the way Phase 22's archiver does:
// the ElevenLabs webhook already emits it, so the webhook path is untouched and
// Inngest fans one event out to classify-call, archive-recording and this.
//
// Two things about the ordering matter.
//
// 1. `summary` and `outcome` are written by classify-call, which rides the SAME
//    event — so at the instant this function starts, both are reliably null.
//    Logging then would put a blank-bodied call in the customer's CRM and the
//    classifier's answer would arrive seconds later with nowhere to go. Hence
//    the bounded wait below: this is a genuine data dependency between two
//    functions triggered by one event, and waiting for it is cheaper than
//    logging twice (neither provider's update path is free, and an edit to an
//    already-logged activity is visible to the customer).
//
// 2. It gives up rather than waits forever. A call can legitimately never get an
//    outcome — no OPENAI_API_KEY, or a classifier that returned nothing — and a
//    call logged without a summary is far better than a call never logged.

const CLASSIFY_POLLS = 4
const CLASSIFY_POLL_INTERVAL = '15s'

const deadLetter = async ({ error, event }: { error: Error; event: { name: string } }) => {
  console.error(`inngest dead-letter (${event.name}):`, error)
  if (process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureException(error, { tags: { source: 'inngest' } })
  }
}

const crmSyncCall = inngest.createFunction(
  {
    id: 'crm-sync-call',
    // Three attempts, then Sentry. The inner client already absorbs short 429s
    // and 5xx itself; reaching this retry budget means something is wrong for
    // minutes, not milliseconds — a depleted Pipedrive daily budget, a provider
    // incident — which is what the outer loop's longer backoff is for.
    retries: 3,
    onFailure: deadLetter,
    triggers: [{ event: 'call/recorded' }],
  },
  async ({ event, step }) => {
    const providerCallId = event.data.providerCallId as string
    const db = serviceClient()

    const call = await step.run('load-call', async () => {
      const { data } = await db
        .from('calls')
        .select('id, org_id, outcome')
        .eq('provider_call_id', providerCallId)
        .maybeSingle()
      return data ?? null
    })
    if (!call) return 'call row gone'
    if (!call.org_id) return 'call has no org (pre-Phase-4 row)'
    const orgId = call.org_id as string
    const callId = call.id as string

    // Which providers this org has connected. Only the NAMES cross the step
    // boundary — never the connection rows themselves. Inngest memoizes step
    // return values in its own storage, and those rows carry the sealed OAuth
    // tokens; returning them here would copy every tenant's CRM credentials
    // into a third-party service on every call. The sync step re-reads them
    // from Postgres instead, where they belong.
    const providers = await step.run('load-connections', async () => {
      const conns = await activeConnections(db, orgId)
      return conns.map((c) => c.provider)
    })
    if (!providers.length) return 'no CRM connected for this org'

    // Wait for classify-call, but not indefinitely (see the header).
    let classified = call.outcome != null
    for (let i = 0; i < CLASSIFY_POLLS && !classified; i++) {
      await step.sleep(`await-classify-${i}`, CLASSIFY_POLL_INTERVAL)
      classified = await step.run(`check-classified-${i}`, async () => {
        const { data } = await db.from('calls').select('outcome').eq('id', callId).maybeSingle()
        return data?.outcome != null
      })
    }

    const results: Record<string, string> = {}
    for (const provider of providers) {
      // One step per provider: HubSpot failing and retrying must not re-post the
      // Pipedrive activity that already succeeded, and Inngest's memoization of
      // completed steps is what guarantees that.
      const result = await step.run(`sync-${provider}`, async () => {
        const conn = (await activeConnections(db, orgId)).find((c) => c.provider === provider)
        // Disconnected between the two steps — the org revoked it, or an earlier
        // provider's failure marked it revoked. Nothing to do and nothing wrong.
        if (!conn) return { provider, status: 'skipped' as const, detail: 'connection no longer active' }
        return syncCallToCrm(db, callId, conn)
      })
      results[provider] = result.status
    }

    return { callId, classified, ...results }
  }
)

export const crmJobs = [crmSyncCall]
