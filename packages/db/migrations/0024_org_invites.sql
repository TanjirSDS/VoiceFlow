-- User management: an 'admin' role and email invites.
--
-- admin = manages this workspace's people (invite, remove, roles, passwords) and
-- nothing an owner alone may do (billing, numbers, integrations stay owner-only:
-- every existing gate is `role = 'owner'`). An admin can never act on an owner;
-- apps/web/app/team/actions.ts enforces that and the last-owner rule.
--
-- The constraint is dropped and recreated, as 0022 did, keeping 'reseller'.
alter table org_members drop constraint org_members_role_check;
alter table org_members add constraint org_members_role_check
  check (role in ('owner', 'admin', 'member', 'reseller'));

-- "Joined" on /team. Rows that predate this column take their account's
-- creation time — for an owner that IS when they signed up and made the org.
alter table org_members add column created_at timestamptz;
update org_members m set created_at = u.created_at from auth.users u where u.id = m.user_id;
alter table org_members alter column created_at set default now(), alter column created_at set not null;

comment on column org_members.role is
  'owner = full control incl. billing; admin = manages this org''s users but '
  'never an owner; reseller = may manage this org''s sub-orgs and see their '
  'rollup, but not its billing; member = day-to-day use.';

-- One row per invite. The link carries a random token; only its sha256 is
-- stored, so a database leak hands out no live invite. Single use is the
-- accept statement's `accepted_at is null and revoked_at is null and
-- expires_at > now()` guard on an UPDATE, not an application read.
create table org_invites (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  email       text not null check (email = lower(email)),
  role        text not null check (role in ('owner', 'admin', 'member')),
  token_hash  text not null unique,
  expires_at  timestamptz not null default now() + interval '7 days',
  -- set null, not cascade: an invite outlives the account that sent it.
  invited_by  uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- At most one live invite per address per workspace: re-inviting rotates the
-- existing row's token instead of leaving two working links around.
create unique index org_invites_pending_uniq on org_invites (org_id, email)
  where accepted_at is null and revoked_at is null;

-- RLS on with ZERO policies, like webhook_events: nothing reaches this table
-- through PostgREST. Every read and write is a server action on the pg pool
-- that has just re-read the caller's role for that org (or, on accept, holds
-- the token). The revoke undoes 0000's default grant — belt and braces.
alter table org_invites enable row level security;
revoke all on org_invites from authenticated, anon;
