#!/usr/bin/env bash
# Proves packages/db/migrations applies cleanly to an empty database.
#
#   npm run migrate:verify
#
# Spins up a throwaway Postgres 17 container (matching supabase/config.toml's
# major_version), installs the test-only Supabase shim, runs every migration,
# then checks the schema landed and that a second run is a no-op. Needs Docker.
# Tears the container down on any exit path.

set -euo pipefail

CONTAINER=voiceflow-migrate-verify
# Postgres 17 to match supabase/config.toml's major_version. Override only to
# reuse an image you already have locally (VERIFY_PG_IMAGE=postgres:16 etc.).
IMAGE=${VERIFY_PG_IMAGE:-postgres:17}
PORT=${VERIFY_PG_PORT:-55432}
PASSWORD=verify
export DATABASE_URL="postgresql://postgres:${PASSWORD}@127.0.0.1:${PORT}/postgres"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

echo "==> starting ${IMAGE} on :${PORT}"
docker run -d --name "$CONTAINER" \
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -p "${PORT}:5432" "$IMAGE" >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$CONTAINER" pg_isready -U postgres -q 2>/dev/null; then break; fi
  sleep 1
done
docker exec "$CONTAINER" pg_isready -U postgres -q

psql_q() { docker exec -i "$CONTAINER" psql -U postgres -tAq -v ON_ERROR_STOP=1 "$@"; }

echo "==> installing the test-only Supabase shim (auth schema, roles)"
psql_q < scripts/testdb/supabase-shim.sql >/dev/null

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
echo "==> PASS — ${EXPECTED} migrations applied cleanly to an empty ${IMAGE} database"
