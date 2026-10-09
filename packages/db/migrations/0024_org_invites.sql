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

-- ───────────────────────────────────── an unproven account's invites expire on proof
--
-- An invite accepted from a COPIED link proves nothing about the mailbox (the
-- inviter holds the link too), so those accounts start email_verified = false.
-- When the real owner of the address first proves it (magic link), Better Auth
-- drops the account's password and sessions (revokeUnprovenAccountAccess). This
-- drops the rest of what the link-holder attached: the memberships it gained by
-- accepting invites. Otherwise someone could invite a stranger's address to a
-- workspace they own, accept it themselves, and the stranger's first sign-in
-- would land them — and everything they then build — inside it.
-- (An unproven account cannot create workspaces either: lib/orgs-write.ts.)
create function drop_unproven_invite_memberships() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.org_members m
   using public.org_invites i
   where m.user_id = new.id and i.org_id = m.org_id and i.email = new.email and i.accepted_at is not null;
  return null;
end $$;

create trigger users_email_proven after update of email_verified on auth.users
  for each row when (old.email_verified = false and new.email_verified = true)
  execute function drop_unproven_invite_memberships();

-- ───────────────────────────────────── a password set by a manager
--
-- Owners/admins may set a member's password only while they manage EVERY
-- workspace that member is in (app/team/actions.ts). The setter knows that
-- password, so the rule must keep holding afterwards, not just at the moment
-- it was set: if the member later joins a workspace the setter does not
-- manage, becomes an owner where the setter is only an admin, or the setter
-- loses their role, the password the setter knows is deleted and its
-- sessions ended. A password the member has since changed themselves has a
-- different hash and is left alone.
create table org_password_grants (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  set_by        uuid not null references auth.users(id) on delete cascade,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
alter table org_password_grants enable row level security;
revoke all on org_password_grants from authenticated, anon;

-- Owner and reseller both outrank admin: a reseller reaches every client
-- sub-org (is_parent_reseller), so only an owner may hold their password.
create function password_grant_holds(p_user uuid, p_setter uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (
    select 1 from org_members t
    left join org_members a on a.org_id = t.org_id and a.user_id = p_setter
    where t.user_id = p_user
      and (a.role is null or a.role not in ('owner', 'admin')
           or (t.role in ('owner', 'reseller') and a.role <> 'owner'))
  );
$$;

create function enforce_password_grants() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  affected uuid := coalesce(new.user_id, old.user_id);
  g record;
begin
  for g in select * from org_password_grants where user_id = affected or set_by = affected loop
    if not password_grant_holds(g.user_id, g.set_by) then
      delete from org_password_grants where user_id = g.user_id;
      delete from auth.accounts
       where user_id = g.user_id and provider_id = 'credential' and password = g.password_hash;
      if found then
        delete from auth.sessions where user_id = g.user_id;
      end if;
    end if;
  end loop;
  return null;
end $$;

create trigger org_members_password_grants after insert or update or delete on org_members
  for each row execute function enforce_password_grants();
