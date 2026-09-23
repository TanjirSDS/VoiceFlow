-- Phase 22: recording retention — the answer to architecture §12 Q4
-- ("provider-hosted URLs vs. copying to Supabase Storage: retention control vs cost").
--
-- We copy. Provider-hosted URLs cost nothing and control nothing: we cannot say
-- how long ElevenLabs keeps a recording, cannot delete one when a customer asks,
-- and cannot answer §9's compliance question at all. Storage is ~$0.021/GB/mo and
-- a call is a few MB, so a 30-day window on a busy tenant is cents — the cost
-- side of the trade is real but small, and it is the side we can bound (below).
--
-- The copy is the ONLY thing we serve (see the audio route): a provider URL is a
-- bearer capability we did not mint, cannot scope to an org and cannot expire.

-- Where the archived copy lives, and when it dies. recording_url (0001) stays as
-- the provider's own link — kept for reconciliation/debugging, never served.
alter table calls add column recording_path text;              -- storage object key; null = not archived
alter table calls add column recording_bytes bigint;
alter table calls add column recording_archived_at timestamptz;
alter table calls add column recording_expires_at timestamptz; -- materialized archived_at + the org's window

-- The retention sweep's only read: "what is due?" across every tenant. Partial,
-- because rows that were never archived (or already swept) are the large majority
-- and must not sit in the index.
create index calls_recording_expiry_idx on calls (recording_expires_at)
  where recording_path is not null;

-- calls_org_rw (0004) is `for all to authenticated`, so a member holds INSERT /
-- UPDATE / DELETE on their own org's call rows, and PostgREST exposes all three.
-- That was survivable while every column was a record of something that already
-- happened. It is not survivable now: recording_expires_at is what the sweep
-- selects on and recording_path is what it deletes, so a member could PATCH
-- recording_path to null and strand the object in the bucket where no sweep can
-- ever find it — while the app went on answering 410 "deleted" for audio that is
-- still sitting there. A retention control a tenant can switch off is not one.
--
-- Revoked at the table, not per column: Postgres column-level REVOKE cannot
-- carve a hole out of a table-level grant (the grant simply keeps applying), so
-- the column form silently does nothing — the verifier catches it if anyone
-- tries. Table-wide is also the honest scope: nothing user-facing writes calls.
-- Every write is service-role — the webhook (elevenlabs-webhook.ts), reconcile,
-- the classify job and contact linking — and the service role has BYPASSRLS, so
-- none of them are affected. Members keep SELECT, which is all the dashboard,
-- the CSV export and the call detail page ever use.
revoke insert, update, delete on calls from anon, authenticated;

-- Per-org retention window. 0 keeps the cost side of §12 Q4 available as a
-- setting: archive nothing, accept provider-only retention.
alter table orgs add column recording_retention_days int not null default 30
  check (recording_retention_days between 0 and 3650);

comment on column orgs.recording_retention_days is
  'Days an archived call recording is kept. 0 = never archive. Read when a '
  'recording is archived and materialized into calls.recording_expires_at, '
  'which is the single thing the sweep deletes on. Changing this therefore '
  'applies to recordings archived AFTER the change; re-stamping existing rows '
  'belongs with the settings UI that edits it (neither exists yet).';

-- The no-policy design below is only safe while RLS is actually ON for
-- storage.objects. Supabase enables it out of the box, but "we assumed it" is
-- not a control: with RLS off, zero policies stops meaning "service role only"
-- and starts meaning "every authenticated user reads every tenant's audio". A
-- read-only assertion needs no table ownership and turns a silent assumption
-- into a migration that refuses to run.
do $$
begin
  if not (select rowsecurity from pg_tables where schemaname = 'storage' and tablename = 'objects') then
    raise exception
      'storage.objects has RLS disabled — the call-recordings bucket would be readable by every authenticated user';
  end if;
end $$;

-- The bucket. Private: no public URL exists for an object in it, so the only way
-- to read one is a signed URL, and the only thing that mints those is the service
-- role — after an RLS-scoped ownership check. 50MiB matches
-- supabase/config.toml's file_size_limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'call-recordings', 'call-recordings', false, 52428800,
  array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg']
)
on conflict (id) do nothing;

-- storage.objects has RLS enabled by Supabase and we deliberately add NO policy
-- for this bucket — the same "RLS on, zero policies = service role only" shape
-- 0004 uses for webhook_events.
--
-- This is the load-bearing decision, so it is worth stating plainly: a signed URL
-- BYPASSES RLS. It is a bearer token for one object, and a policy on
-- storage.objects cannot re-scope it after the fact. So a policy here would buy
-- nothing against the leak that matters (org B holding a URL to org A's audio)
-- while adding a second, weaker read path that skips our expiry check. Org
-- scoping therefore has to happen BEFORE we sign, against the calls row, under
-- the user's own RLS — that check lives in lib/recordings.ts and is what the
-- vitest pins.
