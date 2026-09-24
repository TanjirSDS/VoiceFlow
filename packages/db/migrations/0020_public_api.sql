-- Phase 24: the Pro-tier public API (build plan P8, "public API (Pro)").
--
-- Three things: the plan entitlement, the credentials table, and the one change
-- that lets a credential carry RLS — teaching is_org_member() about an org_id
-- claim, so a bearer key is scoped by Postgres exactly like a session is.

-- ---------------------------------------------------------------- entitlement
-- Plan gate, following the qa_enabled/max_numbers pattern (0012/0014): ADD
-- COLUMN with a default, then one UPDATE per plan that differs. Pro only —
-- Starter and Growth keep the default false.
alter table plans add column api_enabled boolean not null default false;
update plans set api_enabled = true where id = 'pro';

-- --------------------------------------------------------------- credentials
-- We store a SHA-256 of the key and never the key itself: a database dump must
-- not yield a working credential for a single tenant. The key is shown to the
-- user exactly once, at creation.
--
-- Why an unsalted fast hash is right here (and bcrypt/argon2 would be wrong):
-- the secret is 32 random bytes, not a human-chosen password, so there is no
-- dictionary to grind. It also keeps authentication a single indexed lookup —
-- a per-row salt would force a scan over every key in the table on every call.
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  -- Human label, so an owner can tell "CI" from "Zapier" before revoking.
  name text not null default 'API key',
  -- sha256(key), hex. UNIQUE doubles as the authentication lookup index.
  key_hash text not null unique,
  -- First few characters of the key, kept in the clear for display only
  -- ("vf_a1b2c3…"). Far too short to be usable as a credential.
  prefix text not null,
  -- Best-effort usage stamp, written on each authenticated request.
  last_used_at timestamptz,
  -- Set once; a revoked key authenticates no further request. Kept (not
  -- deleted) so the audit trail of what existed survives revocation.
  revoked_at timestamptz,
  created_by text,
  created_at timestamptz not null default now()
);
create index api_keys_org_idx on api_keys (org_id, created_at desc);

alter table api_keys enable row level security;
-- is_org_member() already ORs is_admin() (0006), so admins see every org.
create policy api_keys_org_read on api_keys for select to authenticated
  using (is_org_member(org_id));
create policy api_keys_org_create on api_keys for insert to authenticated
  with check (is_org_member(org_id));
-- Revocation only — the update grant below narrows this to revoked_at/name.
create policy api_keys_org_revoke on api_keys for update to authenticated
  using (is_org_member(org_id)) with check (is_org_member(org_id));

-- Column privileges, on top of RLS. 0000 grants members table-level SELECT on
-- every public table, which would include key_hash; revoking the table grant and
-- re-granting per column is the only way to hold one column back. A member never
-- needs to read a digest, and a session that leaks must not be able to exfiltrate
-- one for offline comparison.
revoke select, update, delete on api_keys from authenticated;
grant select (id, org_id, name, prefix, last_used_at, revoked_at, created_by, created_at)
  on api_keys to authenticated;
-- Revoke (and rename); nothing else is settable after creation, so a member can
-- never re-point an existing key's hash at a secret they chose.
grant update (name, revoked_at) on api_keys to authenticated;
-- No DELETE: revocation is the modelled operation, and it keeps the trail.

-- ------------------------------------------------------- RLS for a bearer key
-- An API key belongs to an ORG, not a user, so its PostgREST token carries
-- org_id and no sub. Deliberately NOT keyed to the creating user: a key that
-- died (or kept working) because someone left the org is a bug in both
-- directions.
--
-- Fails closed by construction. The claim is absent for a session token, so this
-- returns NULL; `p_org = NULL` is NULL, and a USING/WITH CHECK clause treats
-- NULL as false. Only our server signs these tokens (POSTGREST_JWT_SECRET), and
-- userDb() never puts org_id in one — so a session can never forge org scope.
create or replace function auth.api_key_org() returns uuid
language sql stable
as $$
  -- Cast mirrors auth.uid()'s: the claim arrives as jsonb text. NULL when the
  -- claim is absent (every session token), which is what makes this fail closed.
  select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'org_id')::uuid
$$;

-- The one-line extension. Note what a key still cannot reach: auth.uid() is NULL
-- for it, so is_admin() is false and the own_memberships/own_admin_row policies
-- match nothing. A key is confined to exactly one org and can never hold the
-- platform-admin powers its creator might have.
create or replace function is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from org_members where org_id = p_org and user_id = auth.uid())
      or is_admin()
      or p_org = auth.api_key_org();
$$;
