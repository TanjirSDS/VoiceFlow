// Usage: OPENROUTER_API_KEY=… npx tsx scripts/bench/quality.ts
import { buildMessages, parseOutcome } from '../../apps/web/lib/outcome'
import { TRANSCRIPTS } from './transcripts'
const EXPECT: Record<string, string> = { demo_booked: 'booked', price_objection: 'question_answered', support_resolved: 'question_answered', support_escalated: 'escalated', opt_out: 'opt_out', voicemail: 'voicemail', hangup: 'failed', spam: 'spam', callback_later: 'lead_captured', vague_curious: 'question_answered', competitor_switch: 'lead_captured', mixed_intent: 'question_answered' }
async function main() {
  for (const [name, t] of Object.entries(TRANSCRIPTS)) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'typesafe/jev-router', temperature: 0, max_tokens: 4000, response_format: { type: 'json_object' }, messages: buildMessages(t) }) })
    const d: any = await res.json(); const j = parseOutcome(d.choices?.[0]?.message?.content ?? '')?.judgement
    const mark = j?.outcome === EXPECT[name] ? 'ok ' : 'DIFF'
    console.log(`${mark} ${name.padEnd(18)} outcome=${j?.outcome} (want ${EXPECT[name]}) score=${j?.lead_score} obj=${j?.objection} next=${j?.next_action} sent=${j?.sentiment} | ${j?.reason}`)
  }
}
main()
