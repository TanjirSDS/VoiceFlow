# VoiceFlow

Thin control plane over ElevenLabs Agents for small-business AI voice agents. See `CLAUDE.md` for architecture rules and `voiceflow-build-plan.md` for the roadmap.

## Layout

- `apps/web` — Next.js 15 dashboard, webhooks, Better Auth (magic-link login)
- `packages/engine` — `VoiceEngine` interface + `ElevenLabsEngine` adapter (the only place provider APIs are touched)
- `packages/db` — PostgREST + Postgres clients, zod-validated env, SQL migrations (the single source of truth for the schema)
- `scripts/` — `migrate.ts`, seeds, `bootstrap.ts` (agent + number, prints live phone number), `outbound-test.ts`

## Local setup

1. `npm install`
2. `cp .env.example .env.local` — the database/auth defaults already match `docker-compose.yml`; fill in provider keys (ElevenLabs, Twilio, Stripe).
3. `docker compose up -d && npm run migrate` — Postgres 17 + PostgREST, then every migration in `packages/db/migrations`.
4. `npm run seed-orgs && npm run dev`, sign in as `owner-a@voiceflow.test`. Without `RESEND_API_KEY` the magic link is printed in the `next dev` log.
5. `npm run bootstrap` → prints a live phone number to call; `npm run outbound-test -- +1XXXXXXXXXX` rings your phone.

## Deploy (Railway)

Four resources in one Railway project:

| Service | Source | Networking |
|---|---|---|
| `Postgres` | Railway Postgres | private |
| `postgrest` | Docker image `postgrest/postgrest:v16.3` | **private only — never generate a domain** |
| `web` | this repo (root directory `/`, config `railway.json`) | public domain |
| `recordings` | Railway Bucket (Phase 22 call audio) | private — buckets can't be public; audio is served via 300s presigned URLs |

Project **shared variables** (both services read them): `POSTGREST_JWT_SECRET` and
`POSTGREST_DB_PASSWORD` — `openssl rand -hex 32` each (hex: the password sits inside a URL).

`postgrest` variables:

```
PGRST_DB_URI=postgresql://authenticator:${{shared.POSTGREST_DB_PASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
PGRST_DB_SCHEMAS=public
PGRST_JWT_SECRET=${{shared.POSTGREST_JWT_SECRET}}
PGRST_DB_MAX_ROWS=20000
PGRST_SERVER_HOST=*
PGRST_SERVER_PORT=3000
```

`web` variables: everything in `.env.example`, with `DATABASE_URL=${{Postgres.DATABASE_URL}}`,
`POSTGREST_URL=http://postgrest.railway.internal:3000`, `APP_URL=https://<web domain>`,
`POSTGREST_JWT_SECRET=${{shared.POSTGREST_JWT_SECRET}}`,
`POSTGREST_DB_PASSWORD=${{shared.POSTGREST_DB_PASSWORD}}` and a fresh `BETTER_AUTH_SECRET`.
`RESEND_API_KEY` is required — sign-in links go out through it. Recording archive:
`S3_ENDPOINT=${{recordings.ENDPOINT}}`, `S3_BUCKET=${{recordings.BUCKET}}`,
`S3_REGION=${{recordings.REGION}}`, `S3_ACCESS_KEY_ID=${{recordings.ACCESS_KEY_ID}}`,
`S3_SECRET_ACCESS_KEY=${{recordings.SECRET_ACCESS_KEY}}` (without them, calls stay
unarchived and the audio route streams from ElevenLabs).

First deploy order: `web` first (its pre-deploy migrate creates the `authenticator` role and
sets its password), then `postgrest` — until then PostgREST just retries its connection.

Every deploy runs `npm run migrate` first (`preDeployCommand`); a failed migration stops the
deploy. The healthcheck is `/api/health?scope=db` (app → PostgREST → Postgres only, so a
provider outage can't block deploying a fix). Afterwards: point the ElevenLabs post-call
webhook at `https://<web domain>/api/webhooks/elevenlabs`, the Stripe webhook at
`/api/webhooks/stripe`, and sync Inngest at `/api/inngest`.

**Scripts against production** (`seed-admin`, `stripe-setup`, `backfill-contacts`): PostgREST is
private, so run one locally against Railway's public Postgres URL — enable it on the Postgres
service, then `PGRST_DB_URI=<public url with authenticator creds> docker compose up postgrest`
and run the script with `DATABASE_URL=<public url>` and `POSTGREST_URL=http://127.0.0.1:54321`.

## Migrations

`packages/db/migrations` is the only place schema lives. `0000_platform.sql` bootstraps what
hosted Supabase used to provide (the `anon` / `authenticated` / `service_role` / `authenticator`
roles, default grants, the `auth` schema with `auth.uid()` and Better Auth's tables).

- `npm run migrate` — apply everything pending (also sets the `authenticator` password from `POSTGREST_DB_PASSWORD` and tells PostgREST to reload its schema)
- `npm run migrate -- --status` — list applied vs pending, change nothing
- `npm run migrate -- --dry-run` — same, without touching the database
- `npm run migrate:verify` — throwaway Postgres 17 + PostgREST containers: apply everything, assert the schema, run the live RLS isolation tests, confirm a re-run is a no-op (needs Docker)

Applied migrations are recorded in `migrations.schema_migrations`, in their own schema so they
stay off the PostgREST API. Each file runs in its own transaction. Once a migration has been
applied its contents are frozen — the runner compares checksums and refuses to continue if an
applied file was edited; add a new migration instead.

## Public API (Pro)

Pro workspaces can create API keys under **Integrations → API keys**. The key is shown once
at creation — we store only a SHA-256 of it, so it cannot be recovered, only revoked.

```
curl -H "Authorization: Bearer vf_..." https://<app>/api/v1/agents
```

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/agents` | `limit` (max 200), `offset` |
| `GET` | `/api/v1/agents/{id}` | |
| `GET` | `/api/v1/calls` | `agent_id`, `direction`, `from`, `to`, `limit`, `offset` |
| `GET` | `/api/v1/calls/{id}` | |
| `GET` | `/api/v1/usage` | current UTC month |
| `POST` | `/api/v1/calls` | `{ agent_id, to, variables? }` — places an outbound call |

`POST /api/v1/calls` answers `202` with the provider call id; the call row itself is written
at hangup by the post-call webhook, so poll `GET /api/v1/calls` or subscribe to the
`call.completed` webhook. It refuses (and never dials) a number on the workspace opt-out
list, an agent outside the key's workspace, a paused agent, a past-due workspace, or a
request over the simultaneous-call ceiling.

Errors are `{ "error": { "code", "message" } }`. `401` invalid or revoked key, `403`
`plan_upgrade_required` on a non-Pro plan or `opted_out`, `429` rate limited or at the
call ceiling. A key is scoped to one workspace by Postgres RLS and never carries admin
rights, even when its creator is a platform admin.

## Checks

- `npm test` — vitest (webhook HMAC, payload normalization, idempotency, money math; RLS tests run when `POSTGREST_URL` is set)
- `npm run typecheck`
- `npm run lint` — also enforces the provider fence
- `npm run migrate:verify` — migrations + RLS against a real empty stack
