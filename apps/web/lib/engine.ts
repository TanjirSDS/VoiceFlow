import { getEnv } from '@voiceflow/db'
import { ElevenLabsEngine, RetellEngine, type VoiceEngine } from '@voiceflow/engine'

/** The providers this deployment can drive — the vocabulary of agents.provider. */
export type Provider = 'elevenlabs' | 'retell'

/**
 * The one place apps/web picks a provider. Everything else sees VoiceEngine.
 *
 * Phase 26: pass the agent row's `provider` column and the right adapter comes
 * back, so a Retell agent is never driven by the ElevenLabs client. Callers that
 * aren't about one specific agent (listing voices during signup, importing a
 * number) omit it and get the deployment default.
 */
export function makeEngine(provider?: string | null): VoiceEngine {
  const env = getEnv()
  const chosen = provider || env.DEFAULT_VOICE_PROVIDER
  switch (chosen) {
    case 'elevenlabs':
      return new ElevenLabsEngine({
        apiKey: env.ELEVENLABS_API_KEY,
        webhookSecret: env.ELEVENLABS_WEBHOOK_SECRET,
        twilioAccountSid: env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: env.TWILIO_AUTH_TOKEN,
      })
    case 'retell':
      if (!env.RETELL_API_KEY) {
        throw new Error('RETELL_API_KEY is not set — this deployment cannot drive Retell agents')
      }
      return new RetellEngine({
        apiKey: env.RETELL_API_KEY,
        // Retell has no workspace-level call webhook: the URL is stamped on each
        // agent at create/update time, so it has to be known here.
        ...(env.APP_URL && { webhookUrl: `${env.APP_URL}/api/webhooks/retell` }),
      })
    default:
      // A provider string we don't implement must fail loudly. Falling back to
      // ElevenLabs would drive someone else's agent id into our account.
      throw new Error(`Unknown voice provider "${chosen}" (agents.provider)`)
  }
}

/**
 * The provider's in-browser test widget, or null where it has none. Retell's
 * browser test is a WebRTC session that needs a freshly minted access token,
 * not a static <tag>, so it cannot be rendered this way. Returning null keeps
 * the provider name out of the pages — they just don't show a test panel.
 */
export function tryTestWidgetEmbed(
  engine: VoiceEngine,
  providerAgentId: string
): ReturnType<VoiceEngine['testWidgetEmbed']> | null {
  try {
    return engine.testWidgetEmbed(providerAgentId)
  } catch {
    return null
  }
}
