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
if ! npx vitest run packages/db/src/rls.test.ts; then
  echo "    FAIL rls.test.ts"
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
