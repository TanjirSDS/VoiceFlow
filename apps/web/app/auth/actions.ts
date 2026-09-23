'use server'

import { headers } from 'next/headers'
import { pool } from '@voiceflow/db'
import { getAuth } from '../../lib/auth'
import { rateLimit } from '../../lib/ratelimit'

export interface MagicLinkState {
  sent?: boolean
  error?: string
}

/**
 * The one place magic links are sent (login AND signup) — server-side so it
 * can be rate limited per IP and per email. signup creates the auth user;
 * login keeps Phase 4's no-silent-signup behavior.
 */
export async function sendMagicLinkAction(
  _prev: MagicLinkState | null,
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const mode = formData.get('mode') === 'signup' ? 'signup' : 'login'
  if (!/.+@.+\..+/.test(email)) return { error: 'Enter a valid email address.' }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const [byIp, byEmail] = await Promise.all([
    rateLimit('auth', `otp:${ip}`),
    rateLimit('auth', `otp:${email}`),
  ])
  if (!byIp.success || !byEmail.success) {
    return { error: 'Too many attempts — try again in a few minutes.' }
  }

  // Better Auth can only disable signup globally (and creates the user when the
  // link is CLICKED), so login's no-silent-signup check happens here.
  if (mode === 'login') {
    const { rowCount } = await pool().query('select 1 from auth.users where email = $1', [email])
    if (!rowCount) return { error: 'No account for that email — sign up instead.' }
  }
  try {
    await getAuth().api.signInMagicLink({
      // Fixed destinations, never user input, so no open-redirect check needed.
      body: { email, callbackURL: mode === 'signup' ? '/signup/org' : '/dashboard', errorCallbackURL: '/login' },
      headers: h,
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not send the sign-in link.' }
  }
  return { sent: true }
}
