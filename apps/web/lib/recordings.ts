// Phase 22 — recording retention (architecture §12 Q4). Copy finished-call audio
// into a PRIVATE Supabase Storage bucket, serve it through short-lived signed
// URLs, delete it when the org's window runs out.
//
// The security property this file exists to hold:
//
//   A signed URL is a bearer capability. It bypasses RLS, it cannot be recalled,
//   and whoever holds it can read that object. So the org check has to happen
//   BEFORE one is minted, and the path we sign must come from a row the caller
//   was allowed to read — never from the request.
//
// Hence the shape of resolveRecording: the lookup runs on the CALLER's RLS-scoped
// client (org B simply gets no row for org A's call, which the route turns into a
// 404), and only then does the service client sign the path that row carried.
//
// Logic lives here rather than in the route/job so it can be tested against an
// in-memory Supabase without a live project — see recordings.test.ts.

import type { SupabaseClient } from '@voiceflow/db'
import type { VoiceEngine } from '@voiceflow/engine'

export const RECORDING_BUCKET = 'call-recordings'

// Long enough to play a call through and seek around in it (the browser keeps
// using this one URL for Range requests), short enough that a URL that leaks out
// of a screenshot, a proxy log or a shared tab is dead by the time anyone tries
// it. Playback re-requests /api/calls/{id}/audio, which re-checks the org.
export const SIGNED_URL_TTL_SECS = 300

const EXT_BY_TYPE: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
}

/** `audio/mpeg; charset=binary` → `audio/mpeg`. */
export function baseContentType(contentType: string): string {
  return (contentType.split(';')[0] ?? '').trim().toLowerCase()
}

/**
 * Object key for a call's audio. org_id leads so every object is filed under the
 * tenant that owns it: it makes the ownership check below a prefix comparison,
 * and it keeps an org's audio deletable as one prefix if we ever need to purge a
 * tenant wholesale.
 */
export function recordingObjectPath(orgId: string, callId: string, contentType = 'audio/mpeg'): string {
  return `${orgId}/${callId}.${EXT_BY_TYPE[baseContentType(contentType)] ?? 'mp3'}`
}

/** Expiry a recording archived at `at` gets under a `days`-day window. */
export function recordingExpiry(at: Date, days: number): Date {
  return new Date(at.getTime() + days * 86_400_000)
}

export type RecordingResolution =
  /** Archived and live: redirect the browser at this signed URL. */
  | { kind: 'signed'; url: string; expiresInSecs: number }
  /** Not archived yet (or retention is off): stream it from the provider. */
  | { kind: 'proxy'; providerCallId: string }
  /** Retention window ran out — the audio is deleted, or about to be. */
  | { kind: 'gone' }
  /** No such call FOR THIS CALLER. Another org's id lands here. */
  | { kind: 'not-found' }

/**
 * Decide what to serve for `callId`.
 *
 * `userDb` MUST be the RLS-scoped client for the signed-in user — it is the org
 * check, not a convenience. `service` only ever sees a path that came back from
 * that scoped read.
 */
export async function resolveRecording(
  userDb: SupabaseClient,
  service: SupabaseClient,
  callId: string,
  now: Date = new Date()
): Promise<RecordingResolution> {
  const { data: call } = await userDb
    .from('calls')
    .select('id, org_id, provider_call_id, recording_path, recording_expires_at')
    .eq('id', callId)
    .maybeSingle()
  // RLS returned nothing: either the call does not exist or it belongs to
  // someone else. We must not distinguish those — the difference is itself a
  // disclosure (it confirms a call id is real).
  if (!call) return { kind: 'not-found' }

  if (!call.recording_path) {
    // Archived once, then swept: recording_expires_at survives the sweep as a
    // tombstone precisely so this branch can tell "deleted on purpose" from
    // "never archived". Falling through to the provider here would re-serve the
    // audio retention just deleted — which is the whole feature, undone.
    if (call.recording_expires_at) return { kind: 'gone' }
    return { kind: 'proxy', providerCallId: call.provider_call_id }
  }

  // Fail closed. A path with no expiry is a data bug (the archive job always
  // writes both), and an object with no known expiry is exactly the thing this
  // phase exists to prevent — so refuse rather than serve it forever.
  if (!call.recording_expires_at) return { kind: 'gone' }
  if (new Date(call.recording_expires_at).getTime() <= now.getTime()) return { kind: 'gone' }

  // Defence in depth. The path already came from an RLS-scoped row, so this can
  // only fire if something else wrote a foreign path into the column — and that
  // is precisely the bug that would hand org B a signed URL to org A's audio.
  if (!call.org_id || !isPathOwnedBy(call.recording_path, call.org_id)) {
    console.error(`recording path ${call.recording_path} is not under org ${call.org_id} — refusing to sign`)
    return { kind: 'not-found' }
  }

  const { data, error } = await service.storage
    .from(RECORDING_BUCKET)
    .createSignedUrl(call.recording_path, SIGNED_URL_TTL_SECS)
  // A missing object (swept between the read and the sign) is 'gone', not a 500.
  if (error || !data?.signedUrl) return { kind: 'gone' }

  return { kind: 'signed', url: data.signedUrl, expiresInSecs: SIGNED_URL_TTL_SECS }
}

/** True when `path` is inside `orgId`'s folder — a real segment match, not a bare prefix. */
export function isPathOwnedBy(path: string, orgId: string): boolean {
  return path.split('/')[0] === orgId && path.length > orgId.length + 1
}

export type ArchiveResult =
  | { kind: 'archived'; path: string; bytes: number; expiresAt: string }
  | { kind: 'skipped'; reason: string }

/**
 * Copy one finished call's audio from the provider into the private bucket and
 * stamp the row with where it went and when it dies. `db` must be the service
 * client. Idempotent: a call that already has a path is left alone, so an Inngest
 * retry or a replayed webhook re-uploads nothing.
 */
export async function archiveCallRecording(
  db: SupabaseClient,
  engine: VoiceEngine,
  providerCallId: string,
  now: Date = new Date()
): Promise<ArchiveResult> {
  const { data: call } = await db
    .from('calls')
    .select('id, org_id, provider_call_id, recording_path, recording_expires_at')
    .eq('provider_call_id', providerCallId)
    .maybeSingle()
  if (!call) return { kind: 'skipped', reason: 'call row gone' }
  if (call.recording_path) return { kind: 'skipped', reason: 'already archived' }
  // Swept already (tombstone: no path, but an expiry). A replayed webhook or a
  // late reconcile must not resurrect deleted audio.
  if (call.recording_expires_at) return { kind: 'skipped', reason: 'already swept' }
  // No org means no folder to file it under and no retention window to apply —
  // and an unowned object is one nothing will ever delete.
  if (!call.org_id) return { kind: 'skipped', reason: 'call has no org' }

  const { data: org } = await db
    .from('orgs')
    .select('recording_retention_days')
    .eq('id', call.org_id)
    .maybeSingle()
  if (!org) return { kind: 'skipped', reason: 'org gone' }
  const days = org.recording_retention_days as number
  // The cost side of §12 Q4, kept as a real setting: 0 archives nothing and
  // leaves the org on provider-hosted audio.
  if (!days) return { kind: 'skipped', reason: 'retention disabled for org' }

  const { audio, contentType } = await engine.fetchRecording(call.provider_call_id)
  const path = recordingObjectPath(call.org_id, call.id, contentType)
  const { error: upErr } = await db.storage.from(RECORDING_BUCKET).upload(path, audio, {
    contentType: baseContentType(contentType) || 'audio/mpeg',
    // A retry that got past the idempotency check above (row updated, upload
    // half-done) must overwrite rather than fail.
    upsert: true,
  })
  if (upErr) throw new Error(`recording upload failed for call ${call.id}: ${upErr.message}`)

  const expiresAt = recordingExpiry(now, days)
  const { error: updErr } = await db
    .from('calls')
    .update({
      recording_path: path,
      recording_bytes: audio.byteLength,
      recording_archived_at: now.toISOString(),
      recording_expires_at: expiresAt.toISOString(),
    })
    .eq('id', call.id)
  // Leaving an uploaded object with no row pointing at it means nothing will
  // ever sweep it — bin it and let the retry re-do both halves.
  if (updErr) {
    await db.storage.from(RECORDING_BUCKET).remove([path])
    throw new Error(`recording stamp failed for call ${call.id}: ${updErr.message}`)
  }

  return { kind: 'archived', path, bytes: audio.byteLength, expiresAt: expiresAt.toISOString() }
}

/**
 * Delete every archived recording whose expiry has passed, then clear the row's
 * pointers. `db` must be the service client.
 *
 * Objects first, row second: if the process dies between the two, the row still
 * points at a deleted object (resolveRecording turns that into 'gone') and the
 * next sweep re-runs harmlessly. The other order would orphan audio nothing ever
 * deletes — the one outcome a retention feature must not produce.
 */
export async function sweepExpiredRecordings(
  db: SupabaseClient,
  now: Date = new Date(),
  batch = 500
): Promise<{ deleted: number; bytes: number }> {
  const { data: due, error } = await db
    .from('calls')
    .select('id, recording_path, recording_bytes')
    .not('recording_path', 'is', null)
    .lte('recording_expires_at', now.toISOString())
    .limit(batch)
  if (error) throw new Error(error.message)
  if (!due?.length) return { deleted: 0, bytes: 0 }

  const paths = due.map((c) => c.recording_path as string)
  const { error: rmErr } = await db.storage.from(RECORDING_BUCKET).remove(paths)
  // Storage refused the batch: stop. Clearing the rows now would strand the
  // audio in the bucket with nothing left pointing at it.
  if (rmErr) throw new Error(`recording sweep failed to delete ${paths.length} object(s): ${rmErr.message}`)

  const { error: updErr } = await db
    .from('calls')
    // recording_expires_at and recording_archived_at deliberately SURVIVE: they
    // are the tombstone resolveRecording reads to answer 410 instead of falling
    // back to the provider's copy. The partial index only covers rows with a
    // path, so a swept row leaves it and is never re-selected here.
    .update({ recording_path: null, recording_bytes: null })
    .in(
      'id',
      due.map((c) => c.id)
    )
  if (updErr) throw new Error(updErr.message)

  return {
    deleted: due.length,
    bytes: due.reduce((n, c) => n + ((c.recording_bytes as number | null) ?? 0), 0),
  }
}
