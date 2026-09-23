import { serviceClient } from '@voiceflow/db'
import { poolPeak } from '../concurrency'
import { CONCURRENCY_WARN_PCT, concurrencyState } from '../concurrency-math'
import { inngest } from '../inngest'

// Phase 20 — the shared-pool alarm (architecture §3 + §8 row 6).
//
// ElevenLabs plans cap SIMULTANEOUS calls and every tenant draws on that one
// pool, so the failure mode is "busy-hour calls rejected" for ALL tenants at
// once. The mitigation §8 names is to upgrade the tier *ahead of the curve* —
// which only works if the warning lands before the ceiling does. Hence 80%.
//
// Hourly, measuring the last hour's PEAK rather than an instantaneous count: a
// shared pool is spiky, and a sample taken at :00 misses the 14:37 burst that
// actually exhausted it. The same window also bounds the noise — sustained
// pressure alerts once an hour, not every poll. This is a capacity-planning
// signal, not a page.
//
// Platform-level on purpose: the `alerts` table is org-scoped (org_id NOT NULL)
// and no tenant can act on this. It goes where the other operator alarms go —
// Sentry + the log, like status-poll's provider-down edge.

const WINDOW_MINS = 60

const deadLetter = async ({ error, event }: { error: Error; event: { name: string } }) => {
  console.error(`inngest dead-letter (${event.name}):`, error)
  if (process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureException(error, { tags: { source: 'inngest' } })
  }
}

export const poolConcurrencyWatch = inngest.createFunction(
  {
    id: 'pool-concurrency-watch',
    // retries:0 like status-poll — a retry would re-alert on the same window.
    retries: 0,
    onFailure: deadLetter,
    triggers: [{ cron: '0 * * * *' }],
  },
  async () => {
    const since = new Date(Date.now() - WINDOW_MINS * 60_000).toISOString()
    const { peak, limit, pct, at } = await poolPeak(serviceClient(), since)
    const state = concurrencyState(peak, limit)
    if (state === 'ok') return { peak, limit, pct, fired: false }

    const msg =
      `ElevenLabs concurrency pool at ${pct}% of its ceiling (alert at ${CONCURRENCY_WARN_PCT}%) — ` +
      `peak ${peak}/${limit} simultaneous calls in the last ${WINDOW_MINS}m` +
      `${at ? `, first reached ${at}` : ''}. Upgrade the plan before calls start being rejected.`
    console.error(msg)
    if (process.env.SENTRY_DSN) {
      const Sentry = await import('@sentry/nextjs')
      Sentry.captureMessage(msg, state === 'at_limit' ? 'error' : 'warning')
    }
    return { peak, limit, pct, state, fired: true }
  }
)
