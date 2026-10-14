// Phase 12: defaults for the agent-settings accordion. Browser-safe (pure, see
// shared.ts) so the builder UI, the create action, and any script share ONE
// source of truth. Never mutate these constants — clone before editing.

import type { AgentConfig } from '../types'

/** ElevenLabs' documented TTS voice defaults (verified 2026-07-13). Used for the
 *  Speech Settings sliders + their "reset to default" button. */
export const SPEECH_DEFAULTS = { stability: 0.5, similarityBoost: 0.8, speed: 1 } as const

/** Default voice for new agents (2026-10-14, chosen by ear): ElevenLabs library voice
 *  "Jerry B. - Hyper-Real Conversational", male, American, trained on real conversation.
 *  Used only when it is in the workspace's voice list; otherwise the first voice. */
export const DEFAULT_VOICE_ID = '1t1EeRixsJrKbiF1zwM6'

/** ElevenLabs call defaults (verified 2026-07-13): 10 min cap, silence-hangup off. */
// Humanized turn-taking by default (2026-10-09): wait for callers to finish their thought,
// and fill a slow answer with a short phrase instead of silence.
export const CALL_DEFAULTS = {
  maxDurationSecs: 600,
  endOnSilenceSecs: -1,
  patience: 'patient',
  fillers: true,
} as const

/**
 * Retell-parity starter analysis for NEW agents: one success criterion + two
 * extracted fields (summary, sentiment). Existing agents pick these up on their
 * next save (never a mass-PATCH — Phase 12 item 5). "Call Summary" overlaps EL's
 * native transcript_summary but is kept for Retell parity in the UI.
 */
export const DEFAULT_ANALYSIS: NonNullable<AgentConfig['analysis']> = {
  dataCollection: [
    { name: 'Call Summary', type: 'string', description: 'A concise summary of the call.' },
    {
      name: 'User Sentiment',
      type: 'string',
      description: "The caller's overall sentiment: positive, neutral, or negative.",
    },
  ],
  successCriteria: [
    {
      name: 'Call Successful',
      prompt: 'Was the call successful — did the assistant help the caller accomplish what they called for?',
    },
  ],
}
