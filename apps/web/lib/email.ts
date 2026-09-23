import type { ReactElement } from 'react'
import { getEnv, pool } from '@voiceflow/db'

// Resend's sandbox sender — works without domain verification, dev only.
const FROM_FALLBACK = 'VoiceFlow <onboarding@resend.dev>'

/** Origin for links inside emails. */
export function appUrl(): string {
  return getEnv().APP_URL ?? 'http://localhost:3000'
}

/**
 * Send one transactional email via Resend. No RESEND_API_KEY → skipped
 * (returns false), same pattern as the optional OpenAI key. Failures throw so
 * the Inngest wrapper can retry.
 */
export async function sendEmail(to: string[], subject: string, react: ReactElement): Promise<boolean> {
  const env = getEnv()
  if (!env.RESEND_API_KEY || to.length === 0) return false
  const { Resend } = await import('resend')
  const resend = new Resend(env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM ?? FROM_FALLBACK,
    to,
    subject,
    react,
  })
  if (error) throw new Error(`resend: ${error.message}`)
  return true
}

/** Email addresses of an org's owners. auth.users is off PostgREST, so direct SQL. */
export async function orgOwnerEmails(orgId: string): Promise<string[]> {
  const { rows } = await pool().query<{ email: string }>(
    `select u.email from public.org_members m join auth.users u on u.id = m.user_id
     where m.org_id = $1 and m.role = 'owner'`,
    [orgId]
  )
  return rows.map((r) => r.email)
}
