import { z } from 'zod'

// The single env schema for the whole app (CLAUDE.md: "validated with zod in a single env.ts").
// Next.js loads .env.local itself; node scripts load it via dotenv before calling getEnv().
const schema = z.object({
  ELEVENLABS_API_KEY: z.string().min(1),
  ELEVENLABS_WEBHOOK_SECRET: z.string().min(1),
  /** Phase 20: simultaneous calls our ElevenLabs plan allows, shared by every
   *  tenant (Pro ≈ 20, Scale ≈ 30, Business ≈ 40). Raise this the moment the
   *  plan is upgraded — the dial guard and the 80% alert both read it. */
  ELEVENLABS_MAX_CONCURRENCY: z.coerce.number().int().positive().default(20),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  /** Phase 23: AES-256-GCM key sealing each org's Twilio subaccount auth token
   *  (32 bytes, base64 — `openssl rand -base64 32`). Required: without it the
   *  per-org credential path cannot open a single stored token. Rotating it does
   *  NOT lose data — the parent account can re-fetch every subaccount token. */
  CREDENTIAL_ENCRYPTION_KEY: z.string().min(1),
  /** Phase 21: Railway Postgres. Better Auth + auth-schema lookups connect
   *  directly; everything else goes through PostgREST. */
  DATABASE_URL: z.string().url(),
  /** Our private PostgREST (Railway: http://postgrest.railway.internal:3000). */
  POSTGREST_URL: z.string().url(),
  /** Shared with the PostgREST service as PGRST_JWT_SECRET (≥32 chars). */
  POSTGREST_JWT_SECRET: z.string().min(32),
  /** Signs Better Auth session cookies (≥32 chars). */
  BETTER_AUTH_SECRET: z.string().min(32),
  /** Stripe billing (Phase 5). Webhook secret comes from the endpoint config
   *  (dashboard or `stripe listen`). */
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  /** Optional: outcome extraction (Phase 3) is skipped when absent. */
  OPENAI_API_KEY: z.string().min(1).optional(),
  /** Optional: shared secret for /api/cron/* (sent as a Bearer token). */
  CRON_SECRET: z.string().min(1).optional(),
  /** Optional: reconciliation discrepancies are reported to Sentry when set. */
  SENTRY_DSN: z.string().url().optional(),
  /** Optional: transactional email (Phase 6) is skipped when absent. */
  RESEND_API_KEY: z.string().min(1).optional(),
  /** Optional: From header for transactional email, e.g. 'VoiceFlow <hello@voiceflow.io>'. */
  EMAIL_FROM: z.string().min(1).optional(),
  /** Optional: absolute origin used in email links, e.g. https://app.voiceflow.io. */
  APP_URL: z.string().url().optional(),
  /** Optional: Inngest (Phase 6 async jobs). Without them the SDK runs in dev mode. */
  INNGEST_EVENT_KEY: z.string().min(1).optional(),
  INNGEST_SIGNING_KEY: z.string().min(1).optional(),
  /** Optional: call-recording bucket (Phase 22) — a Railway Bucket, any S3 API.
   *  Absent → recordings aren't archived and stream from the provider instead.
   *  Railway: reference the bucket's ENDPOINT/BUCKET/REGION/ACCESS_KEY_ID/SECRET_ACCESS_KEY. */
  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().min(1).optional(),
  S3_REGION: z.string().min(1).default('auto'),
  S3_ACCESS_KEY_ID: z.string().min(1).optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  /** Set for path-style endpoints (older Railway buckets, MinIO). */
  S3_FORCE_PATH_STYLE: z.string().min(1).optional(),
  /** Optional: Upstash rate limiting (Phase 6). Limits are skipped when absent. */
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  /** Optional: shared secret agent tools send to /api/tools/* (Phase 7).
   *  Without it the tool route rejects everything and Cal.com connect errors. */
  AGENT_TOOLS_SECRET: z.string().min(16).optional(),
})

export type Env = z.infer<typeof schema>

let cached: Env | undefined

// Lazy so `next build` succeeds without secrets; validation happens at first use.
export function getEnv(): Env {
  cached ??= schema.parse(process.env)
  return cached
}
