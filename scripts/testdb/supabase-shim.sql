-- TEST FIXTURE ONLY — never run this against a real Supabase project.
--
-- A stock `postgres` image has no `auth` schema, so the migrations' references
-- to auth.users / auth.uid() / the anon + authenticated roles would fail. Hosted
-- Supabase provides these; this recreates just enough of them to run the
-- migrations against a throwaway database. Used by scripts/verify-migrations.sh.

create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

create schema if not exists auth;

-- Only the columns our migrations actually reference (FKs to id).
create table auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

-- Same definition Supabase ships: reads the sub claim off the request JWT, so
-- RLS policies behave the same way here as they do in production.
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
