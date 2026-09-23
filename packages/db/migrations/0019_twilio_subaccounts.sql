-- Phase 23: a Twilio subaccount per org — the answer to architecture §12 Q3
-- ("Twilio numbers in one account vs. subaccount-per-tenant").
--
-- Subaccounts. The deciding line is Twilio's own, from the subaccounts API doc:
-- "You can't use a subaccount's credentials to access resources in your main
-- Twilio account or any other subaccounts." That is the isolation this phase is
-- asked to deliver, and it is enforced by Twilio rather than by our own WHERE
-- clauses — which matters, because every isolation bug we have shipped so far was
-- a missing filter, not a missing feature. Under one shared account the only thing
-- standing between org A and org B's numbers is our query discipline; under
-- subaccounts, org A's token is refused by Twilio even if our code asks wrongly.
--
-- The cost is the plumbing below plus a documented ceiling: "A main account can
-- only have up to 1000 subaccounts by default." At 1000 orgs that needs raising
-- with Twilio — see docs/phase-23-twilio-subaccounts-research.md, which also
-- records what the migration of existing numbers costs (A2P registrations and
-- toll-free verifications must be resubmitted after a transfer).

-- Credentials live in their own table, NOT as columns on orgs.
--
-- This is the load-bearing choice. orgs carries `orgs_member_read` (0004), which
-- is `for select to authenticated using (is_org_member(id))` — so every member of
-- an org can read every column of their org row, and PostgREST will happily serve
-- it. A token column on orgs would therefore be readable by any logged-in member
-- with a REST client, which is the exact thing the phase forbids. A separate
-- table lets the grant be "nobody", which is not expressible per-column: Postgres
-- column-level REVOKE cannot carve a hole out of a table-level grant (0018 hit
-- the same wall from the other side).
create table org_twilio_subaccounts (
  org_id uuid primary key references orgs(id) on delete cascade,
  -- The subaccount's own ACxxx SID. Unique because two orgs sharing one
  -- subaccount would silently rebuild the shared-account problem this phase exists
  -- to remove — and it would look correct in every row.
  subaccount_sid text not null unique,
  -- AES-256-GCM, sealed by packages/db/src/crypto.ts with the org id as AAD.
  -- The AAD is why this is not merely "encrypted": a ciphertext lifted from org
  -- A's row and pasted into org B's fails to open, so write access to this table
  -- cannot be turned into cross-tenant credential theft.
  --
  -- This is a cache, not the system of record. Twilio returns auth_token on
  -- GET /2010-04-01/Accounts/{Sid}.json to the PARENT credentials, so a lost
  -- encryption key is recoverable by re-fetching — it is not a data-loss event.
  auth_token_sealed text not null,
  -- Deliberately no 'closed'. Twilio: "When you close a subaccount, Twilio will
  -- release all phone numbers assigned to it" — and "you can't reopen a closed
  -- account". Closing is therefore a way to destroy a customer's phone number by
  -- writing one word into a status column, with no undo. Offboarding suspends;
  -- closing, if it is ever wanted, needs its own deliberate path and its own
  -- confirmation, not a value that fits in this constraint.
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS on with ZERO policies = service-role only, the same shape 0004 uses for
-- webhook_events and 0018 uses for the recordings bucket. The service role has
-- BYPASSRLS, so every legitimate reader (the numbers actions, the backfill
-- script) is unaffected; everyone else gets nothing.
alter table org_twilio_subaccounts enable row level security;

-- Belt as well as braces. RLS decides row visibility, but the table-level GRANT
-- is what PostgREST consults before it ever gets there, and a future migration
-- that adds a policy "just for reads" would otherwise quietly open this table.
-- Revoking the grant means such a policy still resolves to nothing.
revoke all on org_twilio_subaccounts from anon, authenticated;

comment on table org_twilio_subaccounts is
  'Per-org Twilio subaccount credentials (architecture §12 Q3). Service-role only: '
  'RLS is enabled with no policies and anon/authenticated hold no grant. The token '
  'is sealed with AES-256-GCM bound to org_id — see packages/db/src/crypto.ts. '
  'Never select this table from anything that can reach a browser.';

-- Which Twilio account a number actually lives in.
--
-- Null means "still in the shared parent account" — i.e. bought before this phase
-- and not yet moved. The backfill sets it as each number transfers, which is what
-- makes that script idempotent and re-runnable: it can ask the database what is
-- left to do instead of interrogating Twilio for every number on every run. It is
-- also the assertion the runtime needs — if this column disagrees with the org's
-- subaccount, we are about to call Twilio with credentials that cannot see the
-- number, and failing early with that sentence beats a bare 404 from Twilio.
alter table phone_numbers add column twilio_account_sid text;

comment on column phone_numbers.twilio_account_sid is
  'The Twilio account (ACxxx) this number currently lives in. Null = still in the '
  'shared parent account, pre-Phase-23; scripts/migrate-numbers-to-subaccounts.ts '
  'fills it as numbers transfer.';

-- The backfill's only query: "which numbers are still in the parent account?"
-- Partial, because once the migration is done every row is non-null and a full
-- index would be dead weight on a table the purchase path writes.
create index phone_numbers_unmigrated_idx on phone_numbers (org_id)
  where twilio_account_sid is null;
