import type { Db } from '@voiceflow/db'
import { activeConnections, markRevoked, usableConnection } from './connections'
import { hubspotClient } from './hubspot'
import { resolveMappings } from './mappings'
import { externalNumber } from '../opt-out'
import { pipedriveClient } from './pipedrive'
import {
  CrmAuthError,
  CrmRetryableError,
  type CallInput,
  type CrmClient,
  type CrmConnection,
  type CrmProviderId,
} from './types'

// Phase 25 — one call, one CRM, provider-agnostic.
//
// The job calls this once per (call, connection). Everything provider-specific
// is behind the CrmClient the factory returns; what lives here is the part that
// is the same either way: claim the work idempotently, find or make the contact,
// log the call, record what happened.

function clientFor(conn: CrmConnection): CrmClient {
  return conn.provider === 'hubspot' ? hubspotClient(conn) : pipedriveClient(conn)
}

export interface SyncResult {
  provider: CrmProviderId
  status: 'ok' | 'skipped' | 'dead' | 'already'
  detail?: string
  crmContactId?: string
  crmActivityId?: string
}

interface CallRow {
  id: string
  org_id: string | null
  direction: string | null
  from_e164: string | null
  to_e164: string | null
  started_at: string | null
  duration_secs: number | null
  summary: string | null
  outcome: string | null
  recording_url: string | null
  agents: { name?: string } | null
}

const CALL_SELECT =
  'id, org_id, direction, from_e164, to_e164, started_at, duration_secs, summary, outcome, recording_url, agents(name)'

/**
 * Sync one call to one connected CRM.
 *
 * Idempotency (project rule 2, applied outbound): crm_sync_attempts has
 * unique (call_id, provider), and this claims that row BEFORE talking to the
 * provider. Inngest retries, the provider webhook replays, and the nightly
 * reconcile all re-ask for the same call — none of which should put a second
 * activity in the customer's CRM. Neither provider accepts an idempotency key,
 * so the ledger is the only place this can be enforced.
 *
 * Throwing means "retry me" (Inngest's job). Returning means "done deciding",
 * including the failures no retry can fix.
 */
export async function syncCallToCrm(
  db: Db,
  callId: string,
  stored: Awaited<ReturnType<typeof activeConnections>>[number]
): Promise<SyncResult> {
  const provider = stored.provider

  // Already done? A retry that finds 'ok' must not re-post. Read before write,
  // because the write below would otherwise bump attempts on a settled row.
  const { data: existing } = await db
    .from('crm_sync_attempts')
    .select('status, attempts, crm_contact_id, crm_activity_id')
    .eq('call_id', callId)
    .eq('provider', provider)
    .maybeSingle()
  if (existing?.status === 'ok') {
    return {
      provider,
      status: 'already',
      crmContactId: existing.crm_contact_id ?? undefined,
      crmActivityId: existing.crm_activity_id ?? undefined,
    }
  }

  const { data: callRaw, error: callErr } = await db
    .from('calls')
    .select(CALL_SELECT)
    .eq('id', callId)
    .maybeSingle()
  if (callErr) throw new Error(`calls select: ${callErr.message}`)
  const call = callRaw as CallRow | null
  if (!call) return { provider, status: 'skipped', detail: 'call row gone' }

  const e164 = externalNumber(call)
  if (!e164) {
    // Nothing to attach the activity to. Recorded as skipped rather than failed:
    // a call with no external number (a test fixture, a malformed provider
    // payload) is not a fault anyone can act on, and retrying cannot invent one.
    await settle(db, call, provider, 'skipped', { error: 'call has no external phone number' })
    return { provider, status: 'skipped', detail: 'no external number' }
  }

  // Claim. attempts increments on every genuine try, so a row sitting at
  // attempts=5/failed is visibly different from one nobody has tried.
  const attempts = (existing?.attempts ?? 0) + 1
  await db.from('crm_sync_attempts').upsert(
    {
      org_id: call.org_id,
      call_id: call.id,
      provider,
      status: 'pending',
      attempts,
      last_attempt_at: new Date().toISOString(),
    },
    { onConflict: 'call_id,provider' }
  )

  try {
    // Refreshes the access token when it is at or near expiry; throws
    // CrmAuthError (having already marked the connection revoked) if the
    // refresh itself is rejected.
    const conn = await usableConnection(db, stored)
    const mappings = await resolveMappings(db, stored.orgId, provider)
    const client = clientFor(conn)

    // The local contacts table (Phase 14) does two jobs here. It is where a
    // human may have put a real name against this number — so the CRM record
    // says "Dana Whitby" rather than "+15551234567" whenever we know better —
    // and it caches which CRM record this number already is.
    const { data: local } = await db
      .from('contacts')
      .select('id, first_name, last_name, crm_ids')
      .eq('org_id', stored.orgId)
      .eq('e164', e164)
      .maybeSingle()

    const cache = (local?.crm_ids ?? {}) as Record<string, string>
    const cachedId = cache[provider]

    let contactId: string
    if (cachedId) {
      // Known caller: no search, no create. This is what stops two calls from
      // the same number inside HubSpot's search-indexing window from creating
      // two contacts, and it keeps the scarcest request either provider meters
      // off the per-call path entirely.
      contactId = cachedId
    } else {
      const contact = await client.upsertContact({
        e164,
        firstName: local?.first_name ?? null,
        lastName: local?.last_name ?? null,
      })
      contactId = contact.id
      // Write the id back so the next call skips the lookup. Only when we have a
      // local contact row to hang it on; a call whose contact row has not been
      // created yet simply searches again next time, which is correct but slower.
      if (local?.id) {
        await db
          .from('contacts')
          .update({ crm_ids: { ...cache, [provider]: contactId } })
          .eq('id', local.id)
      }
    }

    const input: CallInput = {
      startedAt: call.started_at ? new Date(call.started_at) : new Date(),
      durationSecs: call.duration_secs ?? 0,
      direction: call.direction === 'outbound' ? 'outbound' : 'inbound',
      fromE164: call.from_e164,
      toE164: call.to_e164,
      summary: call.summary,
      outcome: call.outcome,
      agentName: call.agents?.name ?? null,
      recordingUrl: call.recording_url,
      mappings,
    }

    const activity = await client.logCall(contactId, input)

    await settle(db, call, provider, 'ok', {
      crmContactId: contactId,
      crmActivityId: activity.id,
    })
    return { provider, status: 'ok', crmContactId: contactId, crmActivityId: activity.id }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)

    if (e instanceof CrmAuthError) {
      // The connection is gone — a revoked grant, an uninstalled app, a
      // Pipedrive refresh token 60 days unused. Retrying is pointless by
      // definition, so this is terminal for the attempt and does NOT rethrow:
      // dead-lettering an expected state to Sentry would train everyone to
      // ignore Sentry. The org sees "Reconnect" on /integrations instead.
      await markRevoked(db, stored.orgId, provider, detail)
      await settle(db, call, provider, 'dead', { error: detail })
      return { provider, status: 'dead', detail }
    }

    await db
      .from('crm_sync_attempts')
      .update({ status: 'failed', last_error: detail.slice(0, 1000) })
      .eq('call_id', call.id)
      .eq('provider', provider)

    // Rethrow so Inngest retries with backoff and, at the cap, dead-letters to
    // Sentry. CrmRetryableError is the expected shape here (429, 5xx, network);
    // anything else is a bug worth the same treatment rather than swallowing.
    if (e instanceof CrmRetryableError) throw e
    throw new Error(`${provider} sync failed for call ${call.id}: ${detail}`)
  }
}

async function settle(
  db: Db,
  call: { id: string; org_id: string | null },
  provider: CrmProviderId,
  status: 'ok' | 'dead' | 'skipped',
  extra: { crmContactId?: string; crmActivityId?: string; error?: string }
): Promise<void> {
  await db.from('crm_sync_attempts').upsert(
    {
      org_id: call.org_id,
      call_id: call.id,
      provider,
      status,
      crm_contact_id: extra.crmContactId ?? null,
      crm_activity_id: extra.crmActivityId ?? null,
      last_error: extra.error?.slice(0, 1000) ?? null,
      last_attempt_at: new Date().toISOString(),
    },
    { onConflict: 'call_id,provider' }
  )
}

/** Every active connection for the call's org. Empty = nothing connected yet. */
export async function connectionsForCall(db: Db, orgId: string) {
  return activeConnections(db, orgId)
}
