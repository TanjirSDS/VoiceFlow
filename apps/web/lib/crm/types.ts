// Phase 25 — the provider-agnostic shapes CRM sync speaks in.
//
// Same rule the VoiceEngine adapter follows (CLAUDE.md rule 1): no HubSpot or
// Pipedrive types past this boundary. lib/crm/sync.ts, the job and the UI all
// deal in these; hubspot.ts and pipedrive.ts are the only files that know what
// an `hs_call_duration` or an `api_domain` is.

export const CRM_PROVIDERS = ['hubspot', 'pipedrive'] as const
export type CrmProviderId = (typeof CRM_PROVIDERS)[number]

export function isCrmProvider(v: string): v is CrmProviderId {
  return (CRM_PROVIDERS as readonly string[]).includes(v)
}

/** What a token endpoint gave us, normalized. */
export interface TokenSet {
  accessToken: string
  refreshToken: string
  /** Absolute instant, not the provider's relative expires_in. */
  expiresAt: Date
  scopes: string[]
  /** Pipedrive's per-install api_domain; undefined for fixed-base providers. */
  apiBaseUrl?: string
  externalAccountId?: string
}

/** A live connection, decrypted, as the clients consume it. */
export interface CrmConnection {
  orgId: string
  provider: CrmProviderId
  accessToken: string
  apiBaseUrl?: string | null
}

export interface ContactInput {
  /** E.164, as we store it. Providers normalize differently — see research §12. */
  e164: string
  firstName?: string | null
  lastName?: string | null
}

export interface CallInput {
  /** When the call started. */
  startedAt: Date
  durationSecs: number
  direction: 'inbound' | 'outbound'
  fromE164: string | null
  toE164: string | null
  /** The classifier's one-line summary (may be absent — see the job). */
  summary: string | null
  /** The classifier's outcome label (may be absent). */
  outcome: string | null
  agentName: string | null
  recordingUrl: string | null
  /**
   * Phase 27: what this org calls the product. Used only where a name has to
   * appear in the CUSTOMER's own CRM — a record that outlives the session and
   * is read by people who never see our UI, which makes it the most durable
   * way a white-labelled deployment can leak.
   */
  productName: string
  /** Resolved per-org overrides: source_field → target_property. */
  mappings: FieldMappings
}

export interface FieldMappings {
  contact: Record<string, string>
  call: Record<string, string>
}

export interface CrmClient {
  /** Find the contact by phone or create it. Returns the provider-side id. */
  upsertContact(input: ContactInput): Promise<{ id: string; created: boolean }>
  /** Log the finished call against that contact. Returns the activity id. */
  logCall(contactId: string, input: CallInput): Promise<{ id: string }>
}

/**
 * A 429 or 5xx we intend to retry. Carries the provider's own wait hint when it
 * gave one — HubSpot sends Retry-After, Pipedrive sends nothing (research
 * "Rate limits"), which is exactly why this is one field and not an assumption.
 */
export class CrmRetryableError extends Error {
  constructor(
    message: string,
    readonly retryAfterMs?: number
  ) {
    super(message)
    this.name = 'CrmRetryableError'
  }
}

/** The connection is gone: refresh failed, app uninstalled, scope revoked. */
export class CrmAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CrmAuthError'
  }
}
