import { readFileSync } from 'node:fs'
// Usage: OPENROUTER_API_KEY=… npx tsx scripts/bench/bench-learn.ts [model] [runs] [instructions-file]
import { classifyCall, type ClassifierConfig } from '../../apps/web/lib/outcome'
import { extractSuggestions, type CallForLearning } from '../../apps/web/lib/learning'
import { TRANSCRIPTS } from './transcripts'
const cfg: ClassifierConfig = { baseUrl: 'https://openrouter.ai/api/v1', model: process.argv[2] ?? 'typesafe/jev-router', apiKey: process.env.OPENROUTER_API_KEY! }
const instructions = process.argv[4]
  ? readFileSync(process.argv[4], 'utf8')
  : 'You are the phone assistant for SDS Manager (SDS management software). Pricing is by number of SDSs. Offer demos.'
async function main() {
  const calls: CallForLearning[] = []
  for (const [id, t] of Object.entries(TRANSCRIPTS)) {
    const c = await classifyCall(t, cfg)
    calls.push({ id, outcome: c?.outcome ?? null, transcript: t, judgement: c?.judgement ?? null })
  }
  console.log(`judged ${calls.filter((c) => c.judgement).length}/${calls.length} (model tag: ${calls[0]?.judgement?.model})`)
  for (let run = 1; run <= Number(process.argv[3] ?? 3); run++) {
    const t0 = Date.now()
    const r = await extractSuggestions({ instructions }, calls, cfg)
    console.log(`run ${run}: ${r ? r.suggestions.length + ' suggestions' : 'NULL'} in ${((Date.now() - t0) / 1000).toFixed(1)} s, ${r?.completionTokens} out tokens, ${r?.costCents.toFixed(3)}¢`)
    for (const s of r?.suggestions ?? []) console.log(`   - [${s.type}] ${JSON.stringify(s.suggestion).slice(0, 170)}  ← ${s.evidence.map((e) => e.callId).join(',')}`)
  }
}
main()
