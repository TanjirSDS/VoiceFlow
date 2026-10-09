// Usage: OPENROUTER_API_KEY=… npx tsx scripts/bench/bench-judge.ts <model> <max_tokens> json|plain [rounds]
// Benchmarks a model on the REAL judging prompt (outcome.ts) — parse rate, latency, tokens.
import { buildMessages, parseOutcome } from '../../apps/web/lib/outcome'
import { TRANSCRIPTS } from './transcripts'
const KEY = process.env.OPENROUTER_API_KEY!
async function one(model: string, transcript: any, opts: { maxTokens: number; jsonMode: boolean; extra?: object }) {
  const t0 = Date.now()
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST', headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, temperature: 0, max_tokens: opts.maxTokens, ...(opts.jsonMode && { response_format: { type: 'json_object' } }), ...opts.extra, messages: buildMessages(transcript) }),
    signal: AbortSignal.timeout(90_000),
  })
  const d: any = await res.json()
  const content: string = d.choices?.[0]?.message?.content ?? ''
  return { ms: Date.now() - t0, ok: !!parseOutcome(content), finish: d.choices?.[0]?.finish_reason, out: d.usage?.completion_tokens, cost: d.usage?.cost, routed: d.model, tail: content.slice(-160).replace(/\s+/g, ' '), err: d.error?.message }
}
async function main() {
  const [model, maxTokens, jsonMode, rounds, extra] = [process.argv[2], Number(process.argv[3]), process.argv[4] === 'json', Number(process.argv[5] ?? 1), process.argv[6] ? JSON.parse(process.argv[6]) : undefined]
  let ok = 0, n = 0; const ms: number[] = []; let cost = 0
  for (let r = 0; r < rounds; r++) for (const [name, t] of Object.entries(TRANSCRIPTS)) {
    const x = await one(model, t, { maxTokens, jsonMode, extra }); n++; ms.push(x.ms); cost += x.cost ?? 0
    if (x.ok) ok++; else console.log(`  FAIL ${name}: finish=${x.finish} out=${x.out} routed=${x.routed} ${x.err ?? ''} …${x.tail}`)
  }
  ms.sort((p, q) => p - q)
  console.log(`${model} max=${maxTokens} json=${jsonMode} ${JSON.stringify(extra ?? {})}: ${ok}/${n} parsed, p50 ${ms[Math.floor(n / 2)]} ms, p90 ${ms[Math.floor(n * 0.9)]} ms, $${cost.toFixed(5)} total`)
}
main()
