#!/usr/bin/env bash
# Proves packages/db/migrations applies cleanly to an empty database.
#
#   npm run migrate:verify
#
# Spins up a throwaway Postgres 17 + PostgREST pair (the Railway stack, Phase
# 21), runs every migration — 0000 bootstraps roles + the auth schema, no shim —
# checks the schema landed, runs the live RLS isolation tests through PostgREST,
# and confirms a second migrate is a no-op. Needs Docker. Tears everything down
# on any exit path.

set -euo pipefail

CONTAINER=voiceflow-migrate-verify
PGRST_CONTAINER=voiceflow-migrate-verify-postgrest
NETWORK=voiceflow-migrate-verify
# Postgres 17 to match Railway + docker-compose.yml. Override only to reuse an
# image you already have locally (VERIFY_PG_IMAGE=postgres:16 etc.).
IMAGE=${VERIFY_PG_IMAGE:-postgres:17}
PGRST_IMAGE=${VERIFY_PGRST_IMAGE:-postgrest/postgrest:v16.3}
PORT=${VERIFY_PG_PORT:-55532}
PGRST_PORT=${VERIFY_PGRST_PORT:-55534}
PASSWORD=verify
export DATABASE_URL="postgresql://postgres:${PASSWORD}@127.0.0.1:${PORT}/postgres"
export POSTGREST_DB_PASSWORD=verify-authenticator
export POSTGREST_JWT_SECRET=verify-postgrest-jwt-secret-32-chars-minimum
export POSTGREST_URL="http://127.0.0.1:${PGRST_PORT}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

cleanup() {
  docker rm -f "$CONTAINER" "$PGRST_CONTAINER" >/dev/null 2>&1 || true
  docker network rm "$NETWORK" >/dev/null 2>&1 || true
}
trap cleanup EXIT
cleanup

# Refuse to start if anything already answers on our ports. Docker Desktop can
# bind 0.0.0.0:PORT while a native Postgres holds 127.0.0.1:PORT, and then every
# "throwaway" migration silently lands in THAT database instead (it happened —
# Phase 21 log). Checked after cleanup so our own stale containers don't count.
for p in "$PORT" "$PGRST_PORT"; do
  if (exec 3<>"/dev/tcp/127.0.0.1/$p") 2>/dev/null; then
    echo "port $p is already in use — pick free ones via VERIFY_PG_PORT / VERIFY_PGRST_PORT" >&2
    exit 1
  fi
done

echo "==> starting ${IMAGE} on :${PORT}"
docker network create "$NETWORK" >/dev/null
docker run -d --name "$CONTAINER" --network "$NETWORK" \
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -p "${PORT}:5432" "$IMAGE" >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$CONTAINER" pg_isready -U postgres -q 2>/dev/null; then break; fi
  sleep 1
done
docker exec "$CONTAINER" pg_isready -U postgres -q

psql_q() { docker exec -i "$CONTAINER" psql -U postgres -tAq -v ON_ERROR_STOP=1 "$@"; }

EXPECTED=$(ls packages/db/migrations/*.sql | wc -l | tr -d ' ')

echo "==> applying ${EXPECTED} migrations"
npx tsx scripts/migrate.ts

echo "==> checking results"
fail=0
check() { # check <label> <expected> <sql>
  local got
  got=$(psql_q -c "$3" | tr -d '[:space:]')
  if [ "$got" = "$2" ]; then
    echo "    ok   $1 ($got)"
  else
    echo "    FAIL $1: expected $2, got $got"
    fail=1
  fi
}

check "migrations recorded" "$EXPECTED" \
  "select count(*) from migrations.schema_migrations"
check "ledger is off the API schema" "0" \
  "select count(*) from information_schema.tables where table_schema='public' and table_name='schema_migrations'"
# Phase 1 through Phase 17 tables, one per migration era.
check "core + latest tables exist" "8" \
  "select count(*) from information_schema.tables where table_schema='public' and table_name in
   ('agents','calls','webhook_events','orgs','campaigns','kb_documents','contacts','alerts')"
check "RLS on every tenant table" "0" \
  "select count(*) from pg_tables t where t.schemaname='public' and t.rowsecurity=false
   and exists (select 1 from information_schema.columns c
               where c.table_schema='public' and c.table_name=t.tablename and c.column_name='org_id')"
check "no migration left a broken view" "0" \
  "select count(*) from pg_class where relkind='v' and relnamespace='public'::regnamespace
   and pg_get_viewdef(oid) is null"
check "auth schema has Better Auth's tables" "4" \
  "select count(*) from information_schema.tables where table_schema='auth'
   and table_name in ('users','sessions','accounts','verifications')"
check "anon can touch no public table" "0" \
  "select count(*) from information_schema.role_table_grants where grantee='anon' and table_schema='public'"
check "auth tables are not granted to members" "0" \
  "select count(*) from information_schema.role_table_grants where grantee in ('authenticated','anon') and table_schema='auth'"

echo "==> starting ${PGRST_IMAGE} as authenticator (password set by migrate)"
docker run -d --name "$PGRST_CONTAINER" --network "$NETWORK" \
  -e PGRST_DB_URI="postgresql://authenticator:${POSTGREST_DB_PASSWORD}@${CONTAINER}:5432/postgres" \
  -e PGRST_DB_SCHEMAS=public \
  -e PGRST_JWT_SECRET="$POSTGREST_JWT_SECRET" \
  -e PGRST_DB_MAX_ROWS=20000 \
  -p "${PGRST_PORT}:3000" "$PGRST_IMAGE" >/dev/null
# A tokenless request answering 401 (no anon role) proves PostgREST is up AND
# connected, so it doubles as the readiness probe.
code=000
for _ in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "${POSTGREST_URL}/orgs" || true)
  [ "$code" = "401" ] && break
  sleep 1
done
if [ "$code" = "401" ]; then
  echo "    ok   tokenless request rejected (401)"
else
  echo "    FAIL PostgREST not ready or answered a tokenless request ($code)"
  fail=1
fi

echo "==> live RLS isolation tests through PostgREST"
# api-keys-db.live.test.ts belongs here too: it proves the settings UI's reads
# and revokes are scoped to ONE org, which RLS alone does not do (it narrows to
# every org the viewer is a member of).
# agency-db.live.test.ts is here for the same reason: it proves the /agency
# screen's queries are scoped to ONE parent org. RLS does not do that — since
# 0022 it returns true for every org the caller RESELLS as well as every org
# they are a member of, so an unscoped query would cross two agencies.
if ! npx vitest run packages/db/src/rls.test.ts apps/web/lib/api-keys-db.live.test.ts apps/web/lib/agency-db.live.test.ts; then
  echo "    FAIL live tests"
  fail=1
fi

# Phase 22 retention (0018). These are access-control invariants, not schema
# trivia: each one, broken, is a way for call audio to outlive its window or
# reach the wrong tenant — so they are asserted here rather than left to review.
# (The bucket's privacy is Railway's — buckets there cannot be public — so
# there is no storage schema to assert since Phase 21.)
check "the retention sweep's index is partial" "1" \
  "select count(*) from pg_indexes where schemaname='public'
   and indexname='calls_recording_expiry_idx'
   and indexdef like '%WHERE (recording_path IS NOT NULL)%'"
# A tenant that can write calls can extend its own retention or orphan the object.
check "tenants cannot write calls" "0" \
  "select count(*) from (values ('anon'),('authenticated')) r(role), (values ('INSERT'),('UPDATE'),('DELETE')) p(priv)
   where has_table_privilege(r.role, 'public.calls', p.priv)"
# anon holds nothing at all since Phase 21 (0000 grants it no table), so only
# members read — through RLS.
check "members can still read calls" "t" \
  "select has_table_privilege('authenticated', 'public.calls', 'SELECT')"
# ...and the revoke must not have reached the webhook/jobs/reconcile role.
check "service_role keeps its writes to calls" "3" \
  "select count(*) from (values ('INSERT'),('UPDATE'),('DELETE')) p(priv)
   where has_table_privilege('service_role', 'public.calls', p.priv)"

# Phase 23 subaccount credentials (0019). The whole phase rests on one claim —
# an org's Twilio token is reachable only by the service role — so it is asserted
# here rather than trusted to review. Each failure below is a live credential
# leak, not a style problem.
check "tenants hold NO privilege on subaccount creds" "0" \
  "select count(*) from (values ('anon'),('authenticated')) r(role),
   (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE')) p(priv)
   where has_table_privilege(r.role, 'public.org_twilio_subaccounts', p.priv)"
check "no policy re-opens subaccount creds" "0" \
  "select count(*) from pg_policies where schemaname='public' and tablename='org_twilio_subaccounts'"
check "subaccount creds have RLS on" "t" \
  "select rowsecurity from pg_tables where schemaname='public' and tablename='org_twilio_subaccounts'"
check "service_role can still read subaccount creds" "1" \
  "select count(*) from (values ('SELECT')) p(priv)
   where has_table_privilege('service_role', 'public.org_twilio_subaccounts', p.priv)"
# Closing a subaccount releases its phone numbers and cannot be undone, so the
# value must not be reachable through a normal status write.
check "subaccount status cannot be set to closed" "0" \
  "select count(*) from pg_constraint where conname like '%org_twilio_subaccounts_status%'
   and pg_get_constraintdef(oid) like '%closed%'"
check "the backfill's index is partial" "1" \
  "select count(*) from pg_indexes where schemaname='public'
   and indexname='phone_numbers_unmigrated_idx'
   and indexdef like '%WHERE (twilio_account_sid IS NULL)%'"

# Phase 24 public API (0020). The key table is a credential store and the org_id
# claim is a new way into RLS, so both are asserted here rather than left to
# review. Each failure below is either a credential leak or a tenancy breach.
check "members cannot read a key hash" "0" \
  "select count(*) from information_schema.column_privileges
   where grantee='authenticated' and table_schema='public' and table_name='api_keys'
   and column_name='key_hash' and privilege_type='SELECT'"
check "members can still read a key's display columns" "1" \
  "select count(*) from information_schema.column_privileges
   where grantee='authenticated' and table_schema='public' and table_name='api_keys'
   and column_name='prefix' and privilege_type='SELECT'"
# Revocation must be permanent: deleting the row would let a tenant erase the
# record, and re-writing key_hash would let them re-point a key at a chosen secret.
check "members cannot delete keys (revoke is the only exit)" "0" \
  "select count(*) from (values ('anon'),('authenticated')) r(role)
   where has_table_privilege(r.role, 'public.api_keys', 'DELETE')"
check "members cannot rewrite a key hash" "0" \
  "select count(*) from information_schema.column_privileges
   where grantee='authenticated' and table_schema='public' and table_name='api_keys'
   and column_name='key_hash' and privilege_type='UPDATE'"
check "api_keys has RLS on" "t" \
  "select rowsecurity from pg_tables where schemaname='public' and tablename='api_keys'"
check "anon holds nothing on api_keys" "0" \
  "select count(*) from information_schema.role_table_grants
   where grantee='anon' and table_schema='public' and table_name='api_keys'"
# The authentication lookup runs as service_role, so it must keep full read.
check "service_role can still read key hashes" "t" \
  "select has_column_privilege('service_role', 'public.api_keys', 'key_hash', 'SELECT')"
# The hash lookup must be indexed — authentication does it on every API request.
check "key_hash lookup is indexed and unique" "1" \
  "select count(*) from pg_indexes where schemaname='public' and tablename='api_keys'
   and indexdef like '%UNIQUE%' and indexdef like '%key_hash%'"
# Pro and Agency. A wrong seed here silently opens the API to every tenant, so
# this asserts the exact list rather than a count — adding a plan that happens to
# carry the flag has to be a deliberate edit here too.
# (Phase 27 widened this from "pro" alone: the Agency tier is sold above Pro and
# includes everything Pro has, the API among them.)
check "only the pro and agency plans have API access" "agency,pro" \
  "select string_agg(id, ',' order by id) from plans where api_enabled"

# Phase 27: the agency tier's own gate, asserted the same way and for the same
# reason — agency_enabled is what lets an org create OTHER orgs and read their
# data through is_parent_reseller(), so it spreading to a cheaper plan is a
# tenancy breach, not a pricing mistake.
check "only the agency plan can resell" "agency" \
  "select string_agg(id, ',' order by id) from plans where agency_enabled"
# Rule 5: nothing is unlimited. A sub-org ceiling of 0 on every non-agency plan
# is what makes agency_enabled the only door.
check "no non-agency plan may hold sub-orgs" "0" \
  "select count(*) from plans where max_sub_orgs > 0 and not agency_enabled"

# Phase 25: the CRM OAuth tokens get the same treatment as the Twilio creds —
# and for the same reason. These are bearer credentials for a customer's CRM;
# a single readable column here exports every tenant's sales system.
check "tenants hold NO privilege on CRM creds" "0" \
  "select count(*) from (values ('anon'),('authenticated')) r(role),
   (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE')) p(priv)
   where has_table_privilege(r.role, 'public.org_crm_connections', p.priv)"
check "no policy re-opens CRM creds" "0" \
  "select count(*) from pg_policies where schemaname='public' and tablename='org_crm_connections'"
check "CRM creds have RLS on" "t" \
  "select rowsecurity from pg_tables where schemaname='public' and tablename='org_crm_connections'"
# The UI reads this view instead of the table. If a later migration widens it to
# select *, the tokens ship to the browser — so assert the columns it must NOT
# have, rather than the ones it should.
check "the CRM status view exposes no token" "0" \
  "select count(*) from information_schema.columns
   where table_schema='public' and table_name='org_crm_connection_status'
     and column_name like '%token%'"
# Field mappings are configuration, not secrets: members must be able to read
# and write their own org's. A regression to service-role-only would look like
# 'nothing saves' with no error.
check "members can manage their CRM field mappings" "1" \
  "select count(*) from pg_policies
   where schemaname='public' and tablename='org_crm_field_mappings'"
# One activity per (call, provider) is what stops an Inngest retry from logging
# the same call twice in the customer's CRM.
check "CRM sync is unique per call+provider" "1" \
  "select count(*) from pg_indexes
   where schemaname='public' and tablename='crm_sync_attempts'
     and indexdef like '%UNIQUE%' and indexdef like '%call_id%' and indexdef like '%provider%'"

# ── Phase 27: the white-label tier ──────────────────────────────────────────
#
# Three properties, each one a way this phase could quietly become a breach.

# (1) SENDER VERIFICATION IS OURS TO ASSERT. email_sender_verified says "we
# checked that this tenant controls this sending domain". A reseller able to
# write it can send mail as any domain they like from our infrastructure, which
# is a spoofing primitive rather than a branding feature. The rest of the row is
# theirs to edit, so this is a COLUMN grant and has to be asserted as one.
check "members cannot mark their own sending domain verified" "0" \
  "select count(*) from information_schema.column_privileges
   where table_schema='public' and table_name='org_branding'
     and column_name='email_sender_verified' and grantee='authenticated'
     and privilege_type='UPDATE'"
check "members can still edit the rest of their branding" "8" \
  "select count(*) from information_schema.column_privileges
   where table_schema='public' and table_name='org_branding' and grantee='authenticated'
     and privilege_type='UPDATE'"
check "org_branding has RLS on" "t" \
  "select rowsecurity from pg_tables where schemaname='public' and tablename='org_branding'"
check "anon holds nothing on org_branding" "0" \
  "select count(*) from (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE')) p(priv)
   where has_table_privilege('anon', 'public.org_branding', p.priv)"

# (2) THE COLOUR IS INTERPOLATED INTO A <style> BLOCK. The app validates it on
# write AND on read, but the database is the backstop for every writer that is
# not the app — a restored dump, a console, a later migration. Without this
# constraint the whole chain rests on application code.
check "brand_color is constrained to a hex literal" "1" \
  "select count(*) from pg_constraint
   where conrelid='public.org_branding'::regclass and pg_get_constraintdef(oid) like '%brand_color%~%'"
# A CLAIMED hostname is not a PROVEN one. Branding resolves by host BEFORE it
# resolves by session, so a tenant able to mark their own claim verified could
# write our own hostname here and repaint the real product, on the real domain,
# for every visitor. Same shape as email_sender_verified, same treatment.
# (Found by the phase's security review, not by the build.)
check "members cannot verify their own vanity host" "0" \
  "select count(*) from information_schema.column_privileges
   where table_schema='public' and table_name='org_branding'
     and column_name='custom_domain_verified_at' and grantee='authenticated'
     and privilege_type='UPDATE'"
# product_name is interpolated into RFC 5322 From and Subject headers, where a
# bare CR or LF appends an attacker-chosen header to every message the workspace
# sends. Length was never the limit — the payload fits in 24 characters.
check "product_name cannot carry a control character" "1" \
  "select count(*) from pg_constraint
   where conrelid='public.org_branding'::regclass
     and pg_get_constraintdef(oid) like '%cntrl%'"
# The stamp certifies a HOSTNAME but lives on a ROW, so it must not survive the
# hostname changing — otherwise a tenant whose first host was verified repoints
# the column at a rival's host and keeps the verification. Enforced in the DB
# because `authenticated` deliberately cannot write the stamp to clear it.
check "changing a vanity host re-arms verification" "1" \
  "select count(*) from pg_trigger where tgrelid='public.org_branding'::regclass
     and tgname='org_branding_reverify_trg' and not tgisinternal"
# The tier's core promise: a client inherits its agency's branding. A sub-org's
# member is NOT a member of the parent, so without this second read policy the
# parent's row is invisible to them and every unbranded client falls back to
# the platform name — the exact thing the tier is sold to prevent.
check "a client can read the branding it inherits" "2" \
  "select count(*) from pg_policies where schemaname='public' and tablename='org_branding'
     and cmd='SELECT'"
# INSERT needs the same column treatment UPDATE got: 0000 grants members
# table-level INSERT, so a first write could otherwise set a verification flag.
check "members cannot set a verification flag on insert" "0" \
  "select count(*) from information_schema.column_privileges
   where table_schema='public' and table_name='org_branding' and grantee='authenticated'
     and privilege_type='INSERT'
     and column_name in ('email_sender_verified','custom_domain_verified_at')"
check "a vanity host can belong to exactly one org" "1" \
  "select count(*) from pg_indexes where schemaname='public' and tablename='org_branding'
     and indexdef like '%UNIQUE%' and indexdef like '%custom_domain%'"

# (3) ROLLUP IS BILLING (rule 5), so members read it and nothing else. A member
# who can write agency_periods writes their own invoice.
check "agency_periods has RLS on" "t" \
  "select rowsecurity from pg_tables where schemaname='public' and tablename='agency_periods'"
check "members cannot write the rollup they are billed from" "0" \
  "select count(*) from (values ('anon'),('authenticated')) r(role),
   (values ('INSERT'),('UPDATE'),('DELETE')) p(priv)
   where has_table_privilege(r.role, 'public.agency_periods', p.priv)"
check "members can read their own rollup" "t" \
  "select has_table_privilege('authenticated', 'public.agency_periods', 'SELECT')"
check "the rollup recompute is service-role only" "0" \
  "select count(*) from (values ('anon'),('authenticated')) r(role)
   where has_function_privilege(r.role, 'public.recompute_agency_usage(uuid,date)', 'EXECUTE')"

# Tenancy stays exactly one level deep. Every rule in this phase — who a reseller
# sees, whose minutes roll up where — is written as ONE hop, so a grandchild does
# not make them wrong loudly; it makes them wrong silently.
check "the one-level trigger is installed" "1" \
  "select count(*) from pg_trigger where tgrelid='public.orgs'::regclass
     and tgname='orgs_one_level_deep_trg' and not tgisinternal"
check "reseller is a real role" "1" \
  "select count(*) from pg_constraint
   where conrelid='public.org_members'::regclass and pg_get_constraintdef(oid) like '%reseller%'"

echo "==> re-running (must be a no-op)"
rerun=$(npx tsx scripts/migrate.ts)
echo "$rerun" | sed 's/^/    /'
if ! echo "$rerun" | grep -q "up to date"; then
  echo "    FAIL second run was not a no-op"
  fail=1
fi
check "still exactly ${EXPECTED} rows" "$EXPECTED" \
  "select count(*) from migrations.schema_migrations"

if [ "$fail" -ne 0 ]; then
  echo "==> FAILED"
  exit 1
fi
echo "==> PASS — ${EXPECTED} migrations + RLS tests clean on empty ${IMAGE} + ${PGRST_IMAGE}"
