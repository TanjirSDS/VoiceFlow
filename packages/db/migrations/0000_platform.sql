-- Phase 21: platform bootstrap for plain Postgres (Railway). Hosted Supabase
-- used to provide all of this; 0001+ were written against it and stay
-- untouched. Sorts first, so it runs before anything references auth.users,
-- auth.uid() or the roles below.

-- Roles are cluster-wide (not per database), so create only when missing.
do $$
begin
  -- Exists only because 0004/0006 revoke from it by name. PostgREST runs with
  -- no anon role, so a request without a JWT is rejected before SQL.
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  -- A signed-in member: every read/write filtered by the RLS policies.
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  -- Webhooks, cron, scripts. Never reachable from a browser.
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  -- What PostgREST logs in as; it SET ROLEs to the JWT's role per request.
  -- Password is set by scripts/migrate.ts from POSTGREST_DB_PASSWORD so it
  -- never lives in a committed file.
  if not exists (select from pg_roles where rolname = 'authenticator') then
    create role authenticator login noinherit;
  end if;
end
$$;

grant authenticated, service_role to authenticator;

-- Supabase's default grants, minus anon: RLS (not grants) is what scopes
-- `authenticated`. Default privileges cover tables later migrations create —
-- they apply to objects created by this same migration role.
grant usage on schema public to authenticated, service_role;
alter default privileges in schema public grant all on tables to authenticated, service_role;
alter default privileges in schema public grant all on sequences to authenticated, service_role;
alter default privileges in schema public grant all on functions to authenticated, service_role;

-- auth schema: never exposed by PostgREST (PGRST_DB_SCHEMAS=public). Members
-- need usage only so RLS policies can call auth.uid(); no table grants.
create schema if not exists auth;
grant usage on schema auth to authenticated, service_role;

-- Same contract as Supabase's: the sub claim of the JWT PostgREST verified.
-- nullif guards the '' a transaction-local setting reverts to afterwards.
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

-- Better Auth core schema (magic link only: its tokens live in verifications).
-- Column names mapped to snake_case in apps/web/lib/auth.ts; ids are
-- database-generated uuids (advanced.database.generateId = 'uuid') so the
-- existing references auth.users(id) keep their type.
create table auth.users (
  id             uuid primary key default gen_random_uuid(),
  name           text not null default '',
  email          text not null unique,
  email_verified boolean not null default false,
  image          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table auth.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  token       text not null unique,
  expires_at  timestamptz not null,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index sessions_user_id_idx on auth.sessions (user_id);

create table auth.accounts (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  account_id               text not null,
  provider_id              text not null,
  access_token             text,
  refresh_token            text,
  id_token                 text,
  access_token_expires_at  timestamptz,
  refresh_token_expires_at timestamptz,
  scope                    text,
  password                 text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index accounts_user_id_idx on auth.accounts (user_id);

create table auth.verifications (
  id          uuid primary key default gen_random_uuid(),
  identifier  text not null,
  value       text not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index verifications_identifier_idx on auth.verifications (identifier);
