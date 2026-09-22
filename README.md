# VoiceFlow

Thin control plane over ElevenLabs Agents for small-business AI voice agents. See `CLAUDE.md` for architecture rules and `voiceflow-build-plan.md` for the roadmap.

## Layout

- `apps/web` — Next.js 15 (health check + ElevenLabs webhook; UI from Phase 2)
- `packages/engine` — `VoiceEngine` interface + `ElevenLabsEngine` adapter (the only place provider APIs are touched)
- `packages/db` — Supabase client, zod-validated env, SQL migrations (the single source of truth for the schema)
- `scripts/` — `bootstrap.ts` (agent + number, prints live phone number), `outbound-test.ts`

## Setup

1. `npm install`
2. `cp .env.example .env.local` and fill in real keys (ElevenLabs, Twilio, Supabase).
3. `npm run migrate` — applies every migration in `packages/db/migrations` (needs `DATABASE_URL`).
4. `npm run bootstrap` → prints a live phone number to call.
5. In the ElevenLabs dashboard, point the post-call webhook at `https://<your-vercel-app>/api/webhooks/elevenlabs` and set `ELEVENLABS_WEBHOOK_SECRET`.
6. `npm run outbound-test -- +1XXXXXXXXXX` rings your phone.

## Migrations

`packages/db/migrations` is the only place schema lives. There is no
`supabase/migrations` mirror — it existed once, froze at `0008` while the real
set ran on to `0015`, and was deleted in Phase 19.

- `npm run migrate` — apply everything pending
- `npm run migrate -- --status` — list applied vs pending, change nothing
- `npm run migrate -- --dry-run` — same, without touching the database
- `npm run migrate:verify` — apply all of them to a throwaway Postgres 17
  container and assert the schema landed (needs Docker)

Applied migrations are recorded in `migrations.schema_migrations`, in their own
schema so they stay off the PostgREST API. Each file runs in its own
transaction. Once a migration has been applied its contents are frozen — the
runner compares checksums and refuses to continue if an applied file was
edited; add a new migration instead.

The Supabase CLI can only read migrations from `supabase/migrations`, which is
not configurable, so `supabase db push` and `supabase db reset` no longer apply
this project's schema — `[db.migrations] enabled = false` in
`supabase/config.toml` keeps them from reporting success while doing nothing.
Use `npm run migrate`.

## Checks

- `npm test` — vitest (webhook HMAC, payload normalization, idempotency)
- `npm run typecheck`
- `npm run migrate:verify` — migrations apply cleanly to an empty database
