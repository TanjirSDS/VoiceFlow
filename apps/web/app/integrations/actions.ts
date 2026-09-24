'use server'

import { randomBytes } from 'node:crypto'
import { serviceClient, type Db } from '@voiceflow/db'
import { revalidatePath } from 'next/cache'
import { listEventTypes } from '../../lib/calcom'
import { apiKeyInsert, generateApiKey } from '../../lib/api-keys'
import { revokeApiKey } from '../../lib/api-keys-db'
import { activeOrg, type ActiveOrg } from '../../lib/org'
import { userClient } from '../../lib/db'
import { currentUser } from '../../lib/auth'
import { isCrmProvider } from '../../lib/crm/types'

async function requireOrg(): Promise<ActiveOrg> {
  const org = await activeOrg()
  if (!org) throw new Error('You are not a member of any organization')
  return org
}

async function requireOwner(): Promise<ActiveOrg> {
  const org = await requireOrg()
  if (org.role !== 'owner') throw new Error('Only the workspace owner can manage integrations')
  return org
}

async function currentUserEmail(): Promise<string> {
  const user = await currentUser()
  return user?.email ?? 'system'
}

// ── Cal.com (org-level credentials; the per-agent enable toggle lives in the
//    agent builder — setAgentBookingAction). Moved here from the per-agent form. ──
export async function connectCalcomAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const org = await requireOwner()
    const apiKey = (formData.get('apiKey') as string | null)?.trim()
    const eventTypeId = Number(formData.get('eventTypeId'))
    if (!apiKey || !Number.isInteger(eventTypeId) || eventTypeId <= 0) {
      throw new Error('A Cal.com API key and event type id are required')
    }
    // Validate the key + id against Cal.com before storing anything.
    const eventTypes = await listEventTypes(apiKey).catch(() => {
      throw new Error('Cal.com rejected that API key')
    })
    if (!eventTypes.some((t) => t.id === eventTypeId)) {
      const available = eventTypes.map((t) => `${t.id} (${t.title})`).join(', ') || 'none'
      throw new Error(`Event type ${eventTypeId} not found for that key. Available: ${available}`)
    }
    // orgs are member-read-only under RLS — billing-style owner-gated service write.
    const { error } = await serviceClient()
      .from('orgs')
      .update({ calcom_api_key: apiKey, calcom_event_type_id: eventTypeId })
      .eq('id', org.orgId)
    if (error) throw new Error(error.message)
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  revalidatePath('/integrations')
  return {}
}

export async function disconnectCalcomAction(): Promise<{ error?: string }> {
  try {
    const org = await requireOwner()
    // ponytail: this only clears the org key — agents already toggled to live
    // booking keep the tool attached and will error at call time until a key is
    // reconnected. Disable booking per-agent in the builder to fully turn it off.
    const { error } = await serviceClient()
      .from('orgs')
      .update({ calcom_api_key: null, calcom_event_type_id: null })
      .eq('id', org.orgId)
    if (error) throw new Error(error.message)
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  revalidatePath('/integrations')
  return {}
}

// ── Outbound webhook endpoints ──────────────────────────────────────────────
export async function createWebhookEndpointAction(input: {
  url: string
  events: string[]
}): Promise<{ error?: string; secret?: string }> {
  const db = await userClient()
  try {
    const org = await requireOrg()
    const url = input.url?.trim()
    if (!url || !/^https:\/\//i.test(url)) throw new Error('Endpoint URL must be an https:// address')
    const events = (input.events ?? []).filter((e) => e === 'call.completed' || e === 'alert.fired')
    if (!events.length) throw new Error('Select at least one event to send')
    const secret = `whsec_${randomBytes(24).toString('hex')}`
    const { error } = await db.from('webhook_endpoints').insert({
      org_id: org.orgId,
      url,
      secret,
      events,
      created_by: await currentUserEmail(),
    })
    if (error) throw new Error(error.message)
    revalidatePath('/integrations')
    // Reveal-once: the secret is returned here and masked on every later read.
    return { secret }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

// The org filter on the next two is the boundary, not RLS: is_org_member() spans
// every workspace the caller belongs to, so an id-only statement reaches rows in
// workspaces this request never authorized (same defect as Phase 24's api_keys).
// A zero-row result is reported, never silently treated as success.
export async function setWebhookEndpointEnabledAction(id: string, enabled: boolean): Promise<{ error?: string }> {
  const db = await userClient()
  const org = await requireOrg()
  // Kill switch (rule 3 spirit): attemptDelivery re-checks `enabled` per attempt,
  // so flipping this off stops in-flight and future deliveries immediately.
  const { data, error } = await db
    .from('webhook_endpoints')
    .update({ enabled })
    .eq('id', id)
    .eq('org_id', org.orgId)
    .select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Endpoint not found.' }
  revalidatePath('/integrations')
  return {}
}

export async function deleteWebhookEndpointAction(id: string): Promise<{ error?: string }> {
  const db = await userClient()
  const org = await requireOrg()
  const { data, error } = await db
    .from('webhook_endpoints')
    .delete()
    .eq('id', id)
    .eq('org_id', org.orgId)
    .select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Endpoint not found.' }
  revalidatePath('/integrations')
  return {}
}

// ── CRM connections (Phase 25) ──────────────────────────────────────────────
//
// Connecting is a redirect, not a server action — OAuth needs a top-level
// navigation to the provider, so the Connect button is a plain link to
// /api/integrations/crm/[provider]/connect. Only the teardown lives here.
export async function disconnectCrmAction(provider: string): Promise<{ error?: string }> {
  try {
    const org = await requireOwner()
    if (!isCrmProvider(provider)) throw new Error('Unknown CRM provider')
    // org_crm_connections is RLS-on-with-no-policies, so this has to be the
    // service client (the user's own client sees nothing there, by design).
    //
    // Deleting rather than flipping status to 'revoked': 'revoked' means "the
    // provider stopped accepting us and you should reconnect", which is a
    // prompt. A deliberate disconnect should leave no prompt behind — and it
    // should take the sealed tokens with it.
    const { error } = await serviceClient()
      .from('org_crm_connections')
      .delete()
      .eq('org_id', org.orgId)
      .eq('provider', provider)
    if (error) throw new Error(error.message)

    // Forget the cached CRM record ids too. They point into an account we can no
    // longer reach, and a later reconnect — possibly to a different CRM account
    // — must not log calls against ids from the old one.
    const { data: contacts } = await serviceClient()
      .from('contacts')
      .select('id, crm_ids')
      .eq('org_id', org.orgId)
      .not('crm_ids', 'eq', '{}')
    for (const c of contacts ?? []) {
      const rest = { ...((c.crm_ids ?? {}) as Record<string, string>) }
      if (!(provider in rest)) continue
      delete rest[provider]
      await serviceClient().from('contacts').update({ crm_ids: rest }).eq('id', c.id)
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  revalidatePath('/integrations')
  return {}
}

/** Point one VoiceFlow value at a different CRM property (or clear the override). */
export async function setCrmFieldMappingAction(input: {
  provider: string
  targetObject: 'contact' | 'call'
  sourceField: string
  targetProperty: string
}): Promise<{ error?: string }> {
  try {
    const org = await requireOwner()
    if (!isCrmProvider(input.provider)) throw new Error('Unknown CRM provider')
    const db = await userClient()
    const targetProperty = input.targetProperty.trim()

    if (!targetProperty) {
      // Empty = fall back to the built-in default, which is what DELETE means
      // here; storing '' would map the value onto a property with no name.
      const { error } = await db
        .from('org_crm_field_mappings')
        .delete()
        .eq('org_id', org.orgId)
        .eq('provider', input.provider)
        .eq('target_object', input.targetObject)
        .eq('source_field', input.sourceField)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await db.from('org_crm_field_mappings').upsert(
        {
          org_id: org.orgId,
          provider: input.provider,
          target_object: input.targetObject,
          source_field: input.sourceField,
          target_property: targetProperty,
        },
        { onConflict: 'org_id,provider,target_object,source_field' }
      )
      if (error) throw new Error(error.message)
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  revalidatePath('/integrations')
  return {}
}

// ── Public API keys (Phase 24) ──────────────────────────────────────────────
// Owner-gated, unlike webhook endpoints: a webhook endpoint only RECEIVES data
// we push, while an API key reads every call in the workspace and can spend
// money placing outbound calls. That is an owner's decision.

async function requireApiPlan(): Promise<ActiveOrg> {
  const org = await requireOwner()
  // The page renders an upsell for lower tiers, but the action is the gate —
  // a hand-rolled POST from a Starter workspace must not mint a key.
  if (!org.plan.apiEnabled) throw new Error('The public API is available on the Pro plan')
  return org
}

export async function createApiKeyAction(input: { name?: string }): Promise<{ error?: string; key?: string }> {
  const db = await userClient()
  try {
    const org = await requireApiPlan()
    const generated = generateApiKey()
    const { error } = await db.from('api_keys').insert(
      apiKeyInsert({
        orgId: org.orgId,
        name: input.name,
        createdBy: await currentUserEmail(),
        generated,
      })
    )
    if (error) throw new Error(error.message)
    revalidatePath('/integrations')
    // Reveal-once: this is the only moment the key exists outside the caller's
    // hands. Nothing persists it, and no later read can reconstruct it.
    return { key: generated.key }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

export async function revokeApiKeyAction(id: string): Promise<{ error?: string }> {
  const db = await userClient()
  try {
    const org = await requireApiPlan()
    // Scoped to the org this action actually authorized. RLS would allow the
    // update for EVERY workspace the caller is a member of, which is wider than
    // the owner-on-Pro check above — see the comment in lib/api-keys-db.ts.
    // Permanent by design: 0020 grants members UPDATE on (name, revoked_at) only
    // and no DELETE, so a key can be retired but never rewritten or erased.
    const revoked = await revokeApiKey(db, org.orgId, id)
    if (!revoked) throw new Error('That key is already revoked, or does not exist in this workspace')
    revalidatePath('/integrations')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}
