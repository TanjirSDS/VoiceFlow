import { crmFetch, crmJson, pipedriveRetryAfter } from './http'
import { applyCallMappings, callTitle } from './mappings'
import { CrmAuthError, type CallInput, type ContactInput, type CrmClient, type CrmConnection } from './types'

// Phase 25 — Pipedrive. The only file that knows what an `api_domain` is.
//
// Endpoints are v2. v2 also tightened validation (booleans accept only true and
// false, not 1/0) and renamed the contact fields: "'phone', 'email' and 'im'
// fields have been renamed to 'phones', 'emails' and 'ims' as they contain
// multiple elements". Sending v1's singular `phone` to a v2 endpoint is a silent
// no-op on a field the API does not have — the person is created without a
// number, and every later call then fails to find them and creates another one.

const API_PREFIX = '/api/v2'

/**
 * Pipedrive's base URL is per-INSTALL, not per-deployment: the token response
 * carries `api_domain`, "the base URL path, including the company_domain, where
 * the requests can be sent to". There is no safe constant to fall back on —
 * guessing a domain means either a 404 or, far worse, a valid call against
 * whichever company that domain belongs to. Missing api_domain is a hard stop.
 */
function baseUrl(conn: CrmConnection): string {
  if (!conn.apiBaseUrl) {
    throw new CrmAuthError(
      'Pipedrive connection has no api_domain — reconnect the integration to capture it'
    )
  }
  return conn.apiBaseUrl.replace(/\/+$/, '')
}

/**
 * Seconds → Pipedrive's `HH:MM` duration string.
 *
 * The format cannot express seconds, so this is lossy by the API's design. It
 * rounds to the nearest minute but never rounds a real call down to `00:00`: a
 * 20-second call that logs as zero duration reads as "no call happened", which
 * is worse than the 40 seconds of imprecision that avoiding it costs.
 */
export function pipedriveDuration(durationSecs: number): string {
  if (durationSecs <= 0) return '00:00'
  const minutes = Math.max(1, Math.round(durationSecs / 60))
  const hh = Math.floor(minutes / 60)
  const mm = minutes % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/** Local date/time parts in UTC, matching Pipedrive's YYYY-MM-DD + HH:MM fields. */
export function pipedriveDueParts(startedAt: Date): { due_date: string; due_time: string } {
  const iso = startedAt.toISOString()
  return { due_date: iso.slice(0, 10), due_time: iso.slice(11, 16) }
}

interface SearchResponse {
  success: boolean
  data?: { items?: { item?: { id?: number } }[] }
}

export function pipedriveClient(conn: CrmConnection): CrmClient {
  const base = baseUrl(conn)
  const headers = {
    Authorization: `Bearer ${conn.accessToken}`,
    'Content-Type': 'application/json',
  }

  async function findPersonByPhone(e164: string): Promise<string | null> {
    const url = new URL(`${base}${API_PREFIX}/persons/search`)
    // Pipedrive matches the stored string, so unlike HubSpot the full E.164 is
    // the right query — it is what we wrote when we created the person.
    url.searchParams.set('term', e164)
    url.searchParams.set('fields', 'phone')
    url.searchParams.set('exact_match', 'true')
    url.searchParams.set('limit', '1')

    const json = await crmJson<SearchResponse>(url.toString(), {
      method: 'GET',
      headers,
      retryAfter: pipedriveRetryAfter,
      label: 'pipedrive search persons',
    })
    const id = json.data?.items?.[0]?.item?.id
    return id ? String(id) : null
  }

  return {
    async upsertContact(input: ContactInput) {
      const existing = await findPersonByPhone(input.e164)
      if (existing) return { id: existing, created: false }

      const name = [input.firstName, input.lastName].filter(Boolean).join(' ').trim()
      const json = await crmJson<{ data?: { id?: number } }>(`${base}${API_PREFIX}/persons`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          // `name` is the only required field. Falling back to the number keeps
          // the person identifiable in a list view instead of blank.
          name: name || input.e164,
          // Plural, v2. See the file header — the singular form is accepted and
          // ignored, which is the worst of both outcomes.
          phones: [{ value: input.e164, primary: true, label: 'work' }],
        }),
        retryAfter: pipedriveRetryAfter,
        label: 'pipedrive create person',
      })
      const id = json.data?.id
      if (!id) throw new Error('pipedrive create person: response had no id')
      return { id: String(id), created: true }
    },

    async logCall(personId: string, input: CallInput) {
      const { due_date, due_time } = pipedriveDueParts(input.startedAt)
      const body: Record<string, unknown> = {
        subject: callTitle(input),
        type: 'call',
        due_date,
        due_time,
        duration: pipedriveDuration(input.durationSecs),
        person_id: Number(personId),
        // The call already happened, so the activity is logged complete rather
        // than as a task someone has to tick off. v2: true, never 1.
        done: true,
      }
      // Default mapping puts the classifier's summary in `note`; an override can
      // send it somewhere else. Structural fields above are not remappable.
      applyCallMappings(input, body)

      const json = await crmJson<{ data?: { id?: number } }>(`${base}${API_PREFIX}/activities`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        retryAfter: pipedriveRetryAfter,
        label: 'pipedrive create activity',
      })
      const id = json.data?.id
      if (!id) throw new Error('pipedrive create activity: response had no id')
      return { id: String(id) }
    },
  }
}

/** Cheap credential probe for the connect flow. */
export async function pipedriveVerify(conn: CrmConnection): Promise<void> {
  await crmFetch(`${baseUrl(conn)}${API_PREFIX}/persons?limit=1`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${conn.accessToken}` },
    retryAfter: pipedriveRetryAfter,
    label: 'pipedrive verify',
  })
}
