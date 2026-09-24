import type { Db } from '@voiceflow/db'
import type { CallInput, CrmProviderId, FieldMappings } from './types'

// Phase 25 — which VoiceFlow value lands in which CRM property.
//
// Defaults live in code and overrides live in org_crm_field_mappings, because
// the common customization is one field for one customer ("we keep call
// outcomes in a custom property") and the alternative to a row is a code change
// per customer.
//
// Only OPTIONAL, content-ish fields are mappable. The structural ones — the
// timestamp, the duration, the direction, which contact the activity hangs off —
// are written by the client itself and are not up for remapping: they are what
// makes the record a call rather than a note, and a customer who points
// `duration` at a text property has not customized anything, they have broken
// the activity.

export const DEFAULT_MAPPINGS: Record<CrmProviderId, FieldMappings> = {
  hubspot: {
    contact: {
      // HubSpot's stock contact phone property. Its search normalization is the
      // subtle part and lives in hubspot.ts, not here.
      from_e164: 'phone',
    },
    call: {
      // The classifier's one-liner is the body of the logged call.
      summary: 'hs_call_body',
      recording_url: 'hs_call_recording_url',
      // `outcome` has no stock HubSpot property: hs_call_disposition takes
      // per-account GUIDs, not our labels (research, Unverified §3). It is
      // rendered into the call title instead, and an org that wants it as data
      // maps it to a custom property here.
    },
  },
  pipedrive: {
    contact: {
      from_e164: 'phone',
    },
    call: {
      summary: 'note',
    },
  },
}

/**
 * Defaults with the org's overrides applied.
 *
 * An override REPLACES the default for that source field rather than adding to
 * it — two properties fed by one value is a mapping the UI cannot express and
 * the reader cannot predict.
 */
export async function resolveMappings(db: Db, orgId: string, provider: CrmProviderId): Promise<FieldMappings> {
  const { data, error } = await db
    .from('org_crm_field_mappings')
    .select('target_object, source_field, target_property')
    .eq('org_id', orgId)
    .eq('provider', provider)
  if (error) throw new Error(`org_crm_field_mappings select: ${error.message}`)

  const base = DEFAULT_MAPPINGS[provider]
  const merged: FieldMappings = {
    contact: { ...base.contact },
    call: { ...base.call },
  }
  for (const m of data ?? []) {
    const bucket = m.target_object === 'contact' ? merged.contact : merged.call
    bucket[m.source_field as string] = m.target_property as string
  }
  return merged
}

/** The VoiceFlow-side value for a mappable source field, as a string. */
export function sourceValue(input: CallInput, field: string): string | null {
  switch (field) {
    case 'summary':
      return input.summary
    case 'outcome':
      return input.outcome
    case 'recording_url':
      return input.recordingUrl
    case 'duration_secs':
      return String(input.durationSecs)
    case 'direction':
      return input.direction
    case 'from_e164':
      return input.fromE164
    case 'to_e164':
      return input.toE164
    case 'agent_name':
      return input.agentName
    default:
      return null
  }
}

/**
 * Apply the call mappings onto a provider payload.
 *
 * Skips empty values rather than writing nulls: an unclassified call (no
 * OPENAI_API_KEY, or a classifier that returned nothing) should leave the CRM
 * property untouched, not overwrite whatever a human put there with a blank.
 */
export function applyCallMappings(input: CallInput, into: Record<string, unknown>): Record<string, unknown> {
  for (const [field, property] of Object.entries(input.mappings.call)) {
    const value = sourceValue(input, field)
    if (value !== null && value !== '') into[property] = value
  }
  return into
}

/** A human-readable title for the logged call, outcome included when we have one. */
export function callTitle(input: CallInput): string {
  // Phase 27: this text is written into the CUSTOMER's CRM, where it outlives
  // the session and is read by people who never see our UI. Naming the platform
  // there is the single most durable way a white-labelled deployment leaks, so
  // the fallback is generic and the branded name is passed in by the caller.
  const who = input.agentName ? `${input.agentName}` : `${input.productName} agent`
  const base = `${input.direction === 'inbound' ? 'Inbound' : 'Outbound'} call — ${who}`
  return input.outcome ? `${base} (${input.outcome.replace(/_/g, ' ')})` : base
}
