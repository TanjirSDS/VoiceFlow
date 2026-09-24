-- Phase 25: real CRM sync — per-org OAuth connections, field mappings, and the
-- per-call idempotency ledger the post-call job writes through.
--
-- Numbered 0021, not 0020: 0020_public_api.sql is Phase 24, which is built but
-- not yet merged. Two migrations sharing a number is not a git conflict — git
-- merges them both, happily, and the runner then applies one of them twice or
-- neither, depending on ordering. Leaving the number reserved costs nothing and
-- the sequence already has a hole at 0017.
--
-- Replaces the "Register interest" waitlist added by 0015. Shapes below follow
-- docs/phase-25-crm-sync-research.md; the rows cited as [n] are its register.

-- ── Connections ─────────────────────────────────────────────────────────────
--
-- Own table, service-role only, for exactly the reason 0019 gives: `orgs` carries
-- orgs_member_read from 0004, so any column on orgs is readable by every member
-- of that org through PostgREST. OAuth tokens on orgs would be a credential any
-- logged-in member could curl out. Postgres cannot revoke a single column out of
-- a table-level grant, so the credential needs its own table or nothing.
create table org_crm_connections (
  org_id uuid not null references orgs(id) on delete cascade,
  provider text not null check (provider in ('hubspot', 'pipedrive')),

  -- AES-256-GCM via packages/db/src/crypto.ts, sealed with the org id as AAD —
  -- so a ciphertext lifted from org A's row and pasted into org B's fails to
  -- open. Unlike Phase 23's Twilio token this is NOT a recoverable cache: there
  -- is no parent credential that can re-fetch it. Losing CREDENTIAL_ENCRYPTION_KEY
  -- means every org reconnects by hand, which is why both halves are sealed and
  -- neither is ever selected into anything that reaches a browser.
  access_token_sealed text not null,
  refresh_token_sealed text not null,

  -- When the access token dies. Both providers are short-lived and differ:
  -- HubSpot 1800s, Pipedrive 3600s (register rows 5). Stored as an absolute
  -- instant rather than the provider's relative expires_in so the refresh check
  -- is a comparison, not arithmetic against a row we would have to also stamp.
  access_expires_at timestamptz not null,

  -- Pipedrive only. Its token response carries api_domain — "the base URL path,
  -- including the company_domain, where the requests can be sent to" (register
  -- row 8). It is per-INSTALL, so it cannot be a constant or an env var; calling
  -- the wrong company's domain with a valid token is how one tenant's calls get
  -- logged into another tenant's CRM. Null for HubSpot, whose base is fixed.
  api_base_url text,

  -- What the user actually granted, as returned by the provider. Kept because a
  -- scope can be narrowed at install time by an admin: when a write 403s, the
  -- question "did they grant us contacts:full?" is answerable from a row instead
  -- of from a support call.
  scopes jsonb not null default '[]'::jsonb,

  -- HubSpot hub_id / Pipedrive company id. Support identifier only — never a
  -- tenancy boundary. org_id is the boundary.
  external_account_id text,

  -- 'revoked' is a state we EXPECT to reach, not an error state. Pipedrive's
  -- refresh token "will expire if it isn't used in 60 days" (register row 6), so
  -- an org that takes no calls over a quiet summer loses its connection through
  -- nobody's fault. HubSpot's refresh expiry is undocumented — research marks it
  -- UNVERIFIED — so the same handling covers it. The job flips this and the UI
  -- shows "Reconnect"; nothing pages.
  status text not null default 'active' check (status in ('active', 'revoked')),
  status_detail text,

  connected_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One connection per provider per org. Not a surrogate id: a second row for
  -- the same pair is never meaningful, and a unique constraint that IS the key
  -- cannot be forgotten by a later upsert that omits the ON CONFLICT target.
  primary key (org_id, provider)
);

alter table org_crm_connections enable row level security;
-- RLS on with zero policies = service-role only (the 0004 / 0018 / 0019 shape).
-- The grant is revoked as well as the policy withheld: RLS decides rows, but the
-- table-level GRANT is what PostgREST consults first, and a later migration that
-- adds a read policy "just for the status column" would otherwise quietly expose
-- the sealed tokens beside it.
revoke all on org_crm_connections from anon, authenticated;

comment on table org_crm_connections is
  'Per-org CRM OAuth credentials (Phase 25). Service-role only: RLS enabled with no '
  'policies, no grant to anon/authenticated. Both tokens are AES-256-GCM sealed and '
  'bound to org_id — see packages/db/src/crypto.ts. Never select this from anything '
  'that can reach a browser; the UI reads org_crm_connection_status instead.';

-- The projection the dashboard is allowed to see: everything except the secrets.
-- A view, rather than splitting the table, because the alternative is a second
-- table kept in sync by hand — and the sync would be wrong the first time a
-- refresh failed. security_invoker so the reader's own RLS applies.
create view org_crm_connection_status
  with (security_invoker = true)
  as select org_id, provider, status, status_detail, scopes, external_account_id,
            connected_by, created_at, updated_at
     from org_crm_connections;

comment on view org_crm_connection_status is
  'Secret-free projection of org_crm_connections for the /integrations UI.';

-- ── Field mappings ──────────────────────────────────────────────────────────
--
-- Not secret, so this one gets ordinary member RLS. The defaults live in code
-- (lib/crm/mappings.ts), and a row here overrides one field for one org: the
-- common case is an org that keeps call outcomes in a custom property rather
-- than the stock one, which otherwise needs a code change per customer.
create table org_crm_field_mappings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  provider text not null check (provider in ('hubspot', 'pipedrive')),

  -- Which CRM record the property hangs off. Contact and call are the only two
  -- objects this phase writes; a mapping naming anything else has nowhere to go.
  target_object text not null check (target_object in ('contact', 'call')),

  -- The VoiceFlow value being mapped. Constrained on purpose — a free-text
  -- source field is a mapping that silently maps nothing when it is misspelled,
  -- and the failure surfaces as "the CRM field is empty", which reads like a
  -- provider bug. Extend this list when the job learns to send more.
  source_field text not null check (source_field in (
    'summary', 'outcome', 'transcript_url', 'recording_url',
    'duration_secs', 'direction', 'from_e164', 'to_e164', 'agent_name'
  )),

  -- The provider-side property name, e.g. 'hs_call_body' or a custom
  -- 'outcome__c'. Unvalidated here because only the provider knows its own
  -- schema; the job surfaces a rejected property as a sync error on the call.
  target_property text not null,

  created_at timestamptz not null default now(),

  -- One mapping per source field per object per provider per org. Two rows
  -- pointing the same source at different properties is not "write both", it is
  -- an ambiguity the job would resolve by row order — i.e. arbitrarily.
  unique (org_id, provider, target_object, source_field)
);
create index org_crm_field_mappings_org_idx on org_crm_field_mappings (org_id, provider);

alter table org_crm_field_mappings enable row level security;
create policy org_crm_field_mappings_rw on org_crm_field_mappings for all to authenticated
  using (is_org_member(org_id)) with check (is_org_member(org_id));

-- ── Per-call sync ledger ────────────────────────────────────────────────────
--
-- Rule 2 applied to an outbound integration. The job is triggered by an Inngest
-- event and Inngest retries, so "log this call" WILL be asked for more than once
-- — on retry after a 429, on a replayed provider webhook, and on the nightly
-- reconcile re-emitting a call it just repaired. None of those should produce a
-- second activity in the customer's CRM, and neither provider offers an
-- idempotency key we could pass instead.
--
-- unique (call_id, provider) is what makes the job safe to re-run: the row is
-- claimed before the API call and carries the resulting ids, so a retry that
-- finds status='ok' returns instead of re-posting.
create table crm_sync_attempts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  call_id uuid not null references calls(id) on delete cascade,
  provider text not null check (provider in ('hubspot', 'pipedrive')),

  status text not null default 'pending'
    check (status in ('pending', 'ok', 'failed', 'dead', 'skipped')),

  -- What we created on the other side. Kept so support can answer "where did
  -- this call go?" with a link rather than a search, and so a future backfill
  -- can tell an already-synced call from an unsynced one without asking the CRM.
  crm_contact_id text,
  crm_activity_id text,

  attempts int not null default 0,
  last_error text,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),

  unique (call_id, provider)
);
-- The job's own lookup ("what is still pending for this org?") and the UI's
-- recent-activity list share this index.
create index crm_sync_attempts_org_idx on crm_sync_attempts (org_id, created_at desc);

alter table crm_sync_attempts enable row level security;
-- Members read their org's sync history; only the job (service role) writes it.
create policy crm_sync_attempts_read on crm_sync_attempts for select to authenticated
  using (is_org_member(org_id));

comment on table crm_sync_attempts is
  'One row per (call, provider) — the idempotency ledger for CRM sync (Phase 25). '
  'Claimed before the provider call so an Inngest retry cannot double-log an activity.';

-- ── Contact-id cache ────────────────────────────────────────────────────────
--
-- Which CRM record each of our contacts already is, per provider:
--   { "hubspot": "701", "pipedrive": "44" }
--
-- This is not an optimization, it closes a race. HubSpot's search is eventually
-- consistent — "It may take a few moments for newly created or updated CRM
-- objects to appear in search results" — so two calls from the same number
-- inside that window both search, both miss, and both create. The customer gets
-- duplicate contacts and their call history splits across them, which is exactly
-- the failure this integration exists to prevent.
--
-- With the id cached, only the FIRST call for a number ever searches. That also
-- removes a request from the tightest budget either provider has: search is
-- capped at 5/s (HubSpot) and 10 per 2s (Pipedrive), far below their general
-- limits, and search was otherwise on the path of every single call.
--
-- Lives on contacts rather than in its own table because contacts is already
-- unique (org_id, e164) — the exact identity the cache is keyed by — so a new
-- table would be that unique constraint, copied, plus a join.
alter table contacts add column crm_ids jsonb not null default '{}'::jsonb;

comment on column contacts.crm_ids is
  'Provider → CRM record id for this contact, e.g. {"hubspot":"701"}. Written by '
  'the post-call sync job so repeat callers are never searched for twice.';

-- ── Retire the waitlist ─────────────────────────────────────────────────────
--
-- 0015 added orgs.integration_interest for the "Register interest" button, whose
-- whole purpose was to collect names until this phase existed. It does now.
--
-- Dropped rather than left dormant: a column the UI no longer writes and no job
-- reads is one a later reader mistakes for live state. The interest list itself
-- is not worth migrating — every org on it is being offered the real connect
-- flow on the same page the button used to be.
--
-- Ordering note for deploy: this drop must land WITH the app code that stops
-- selecting it (same PR), not before it.
alter table orgs drop column integration_interest;
