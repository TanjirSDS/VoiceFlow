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

-- Storage (Phase 22). Hosted Supabase ships the `storage` schema; a stock
-- postgres image does not, so 0018's bucket insert would fail the verifier.
-- Only what the migrations touch, with the real column names/types.
create schema if not exists storage;

create table storage.buckets (
  id                 text primary key,
  name               text not null,
  owner              uuid,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  public             boolean default false,
  avif_autodetection boolean default false,
  file_size_limit    bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id          uuid primary key default gen_random_uuid(),
  bucket_id   text references storage.buckets(id),
  name        text,
  owner       uuid,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  metadata    jsonb,
  path_tokens text[] generated always as (string_to_array(name, '/')) stored
);

-- Supabase enables RLS on storage.objects out of the box, and 0018 relies on
-- that default (it adds no policy, so the bucket is service-role only).
alter table storage.objects enable row level security;

-- Used by storage RLS policies to read the leading folder of an object key.
create or replace function storage.foldername(name text) returns text[]
language sql immutable as $$
  select string_to_array(name, '/');
$$;

grant usage on schema storage to anon, authenticated, service_role;

-- Supabase grants anon/authenticated broad table privileges by default, and
-- migrations narrow them back (0004 revokes function EXECUTE, 0018 revokes
-- column UPDATE). Without the grants those revokes are no-ops here and the
-- verifier would "prove" a restriction that was never exercised.
-- service_role is granted alongside them: BYPASSRLS skips row POLICIES, not table
-- PRIVILEGES, so without this the webhook/jobs/reconcile roles would look
-- unprivileged here and a revoke aimed at tenants would be indistinguishable
-- from one that broke every server-side write.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
