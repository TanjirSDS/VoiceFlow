import { serviceClient } from '@voiceflow/db'
import { makeEngine } from '../engine'
import { recordingStore } from '../object-store'
import { inngest } from '../inngest'
import { archiveCallRecording, sweepExpiredRecordings } from '../recordings'

// Phase 22 — the two halves of recording retention (architecture §12 Q4).
//
// Archive: the provider's audio URL is outside our control — we cannot say how
// long it lives, cannot scope it to a tenant and cannot delete it on request. So
// on every finished call we take our own copy into a private bucket, and that
// copy is the one the app serves.
//
// Sweep: a copy we never delete is worse than no copy at all — it turns a §9
// compliance answer ("gone after N days") into a lie. The archive half is
// pointless without this one, which is why they ship in the same file.

const deadLetter = async ({ error, event }: { error: Error; event: { name: string } }) => {
  console.error(`inngest dead-letter (${event.name}):`, error)
  if (process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureException(error, { tags: { source: 'inngest' } })
  }
}

/**
 * Riding the existing `call/recorded` event (the webhook already emits it for
 * classify-call), so the webhook path is untouched — Inngest fans one event out
 * to both functions. NOT in step.run: each retry must genuinely re-fetch and
 * re-upload, and archiveCallRecording is idempotent on the row's recording_path.
 */
const archiveRecording = inngest.createFunction(
  { id: 'archive-recording', retries: 3, onFailure: deadLetter, triggers: [{ event: 'call/recorded' }] },
  ({ event }) => archiveCallRecording(serviceClient(), recordingStore(), makeEngine(), event.data.providerCallId as string)
)

// One batch is one storage delete call plus one UPDATE; 20 of them is 10k
// recordings a night, far above any plausible backlog. Hitting the cap is
// logged rather than swallowed — a silent cap here reads as "everything expired
// was deleted" when it wasn't.
const SWEEP_BATCH = 500
const MAX_BATCHES = 20

/**
 * 04:00 UTC, an hour after reconcile-daily. Deletes every archived recording
 * past its expiry. Idempotent — a retry or an extra run just finds less to do —
 * so retries are safe here in a way they are not for the alert evaluator.
 */
const recordingRetentionSweep = inngest.createFunction(
  {
    id: 'recording-retention-sweep',
    retries: 2,
    onFailure: deadLetter,
    triggers: [{ cron: 'TZ=UTC 0 4 * * *' }],
  },
  async ({ step }) => {
    const store = recordingStore()
    // No bucket configured → nothing was ever archived, so nothing can be due.
    if (!store) return { deleted: 0, mbFreed: 0, skipped: 'no recording bucket configured' }
    let deleted = 0
    let bytes = 0
    for (let i = 0; i < MAX_BATCHES; i++) {
      const res = await step.run(`sweep-${i}`, () => sweepExpiredRecordings(serviceClient(), store, new Date(), SWEEP_BATCH))
      deleted += res.deleted
      bytes += res.bytes
      if (res.deleted < SWEEP_BATCH) return { deleted, mbFreed: round(bytes) }
    }
    console.warn(
      `recording sweep hit its ${MAX_BATCHES}-batch cap after deleting ${deleted} — ` +
        `expired audio REMAINS in the bucket until tomorrow's run`
    )
    return { deleted, mbFreed: round(bytes), cappedWithMoreDue: true }
  }
)

const round = (bytes: number) => Math.round((bytes / 1_048_576) * 10) / 10

export const recordingJobs = [archiveRecording, recordingRetentionSweep]
