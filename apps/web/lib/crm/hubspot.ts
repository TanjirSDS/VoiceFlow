import { crmFetch, crmJson, hubspotRetryAfter } from './http'
import { applyCallMappings, callTitle } from './mappings'
import type { CallInput, ContactInput, CrmClient, CrmConnection } from './types'

// Phase 25 — HubSpot. The only file that knows what an `hs_call_duration` is.
//
// Paths are pinned to the 2026-09 dated version: the numeric /v1/ and /v3/ paths
// are announced unsupported after September 2027 and the docs tell new
// integrations to use the latest date version. One constant below, so the next
// bump is a one-line change rather than a grep.

const BASE = 'https://api.hubapi.com'
const VERSION = '2026-09'

/** call → contact, HUBSPOT_DEFINED. From the Calls API association table. */
const CALL_TO_CONTACT_ASSOCIATION_TYPE_ID = 194

/**
 * The number to SEARCH with — not the number we store.
 *
 * This is the single most consequential line in the file. HubSpot indexes phone
 * numbers through calculated `hs_searchable_calculated_*` properties, and its
 * search documentation says plainly that "HubSpot only uses the area code and
 * local number" and to "refrain from including the country code in your search
 * or filter criteria". We store E.164 (`+15551234567`). Handing that string to
 * search matches nothing — and a search that always misses does not look like a
 * bug, it looks like a working integration that creates a brand-new duplicate
 * contact on every single call.
 *
 * NANP (+1) is stripped properly. For everything else we drop the `+` and hope,
 * because correctly finding a country code's length needs a full prefix table
 * (libphonenumber) that this repo does not carry and this phase does not justify
 * adding — the product buys US local numbers. The limitation is real and belongs
 * in a comment rather than in a surprise: a non-NANP org will see duplicate
 * contacts, and the fix is a phone-number library, not a tweak here.
 */
export function hubspotSearchNumber(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

interface SearchResponse {
  total: number
  results: { id: string; properties: Record<string, string | null> }[]
}

export function hubspotClient(conn: CrmConnection): CrmClient {
  const headers = {
    Authorization: `Bearer ${conn.accessToken}`,
    'Content-Type': 'application/json',
  }

  async function findContactByPhone(e164: string): Promise<string | null> {
    const value = hubspotSearchNumber(e164)
    const body = {
      // Two groups = OR. A contact's number may sit in `phone` or `mobilephone`
      // depending on how it was created, and matching only the first quietly
      // duplicates every mobile-only contact.
      filterGroups: [
        { filters: [{ propertyName: 'phone', operator: 'EQ', value }] },
        { filters: [{ propertyName: 'mobilephone', operator: 'EQ', value }] },
      ],
      properties: ['phone', 'mobilephone', 'firstname', 'lastname'],
      limit: 1,
    }
    const json = await crmJson<SearchResponse>(`${BASE}/crm/objects/${VERSION}/contacts/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      retryAfter: hubspotRetryAfter,
      label: 'hubspot search contacts',
    })
    return json.results?.[0]?.id ?? null
  }

  return {
    async upsertContact(input: ContactInput) {
      const existing = await findContactByPhone(input.e164)
      if (existing) return { id: existing, created: false }

      const properties: Record<string, unknown> = {
        // Stored in full E.164 even though we SEARCH without the country code:
        // HubSpot normalizes on its side for the search index, and the record a
        // human opens should show the number they can actually dial.
        phone: input.e164,
      }
      if (input.firstName) properties.firstname = input.firstName
      if (input.lastName) properties.lastname = input.lastName
      // No name at all → the phone number is the label, which beats a row of
      // blank contacts nobody can tell apart in the HubSpot list view.
      if (!input.firstName && !input.lastName) properties.firstname = input.e164

      const json = await crmJson<{ id: string }>(`${BASE}/crm/objects/${VERSION}/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ properties }),
        retryAfter: hubspotRetryAfter,
        label: 'hubspot create contact',
      })
      return { id: json.id, created: true }
    },

    async logCall(contactId: string, input: CallInput) {
      const properties: Record<string, unknown> = {
        // The one required property. ISO-8601 UTC is accepted alongside Unix ms.
        hs_timestamp: input.startedAt.toISOString(),
        hs_call_title: callTitle(input),
        // MILLISECONDS. The docs are unambiguous and the units are the kind of
        // thing that is only ever caught by a human noticing a 3-minute call
        // logged as three milliseconds — by which time a month of history is
        // wrong. duration_secs is our column; ×1000 is the contract.
        hs_call_duration: String(input.durationSecs * 1000),
        hs_call_direction: input.direction === 'inbound' ? 'INBOUND' : 'OUTBOUND',
        // The call we are logging has, by definition, already happened.
        hs_call_status: 'COMPLETED',
      }
      if (input.fromE164) properties.hs_call_from_number = input.fromE164
      if (input.toE164) properties.hs_call_to_number = input.toE164

      // Org overrides last: a customer who points `summary` at a custom property
      // gets it there instead of in hs_call_body, and the structural fields
      // above are not offered for remapping at all.
      applyCallMappings(input, properties)

      const json = await crmJson<{ id: string }>(`${BASE}/crm/objects/${VERSION}/calls`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          properties,
          associations: [
            {
              to: { id: contactId },
              types: [
                {
                  associationCategory: 'HUBSPOT_DEFINED',
                  associationTypeId: CALL_TO_CONTACT_ASSOCIATION_TYPE_ID,
                },
              ],
            },
          ],
        }),
        retryAfter: hubspotRetryAfter,
        label: 'hubspot create call',
      })
      return { id: json.id }
    },
  }
}

/** Cheap credential probe for the connect flow — proves the token really works. */
export async function hubspotVerify(conn: CrmConnection): Promise<void> {
  await crmFetch(`${BASE}/crm/objects/${VERSION}/contacts?limit=1`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${conn.accessToken}` },
    retryAfter: hubspotRetryAfter,
    label: 'hubspot verify',
  })
}
