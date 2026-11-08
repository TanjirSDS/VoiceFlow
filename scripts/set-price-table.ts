// Give one agent a price list and its look_up_price tool, so it quotes prices from
// /api/tools/price instead of a table in its prompt.
//
//   npm run set-price-table -- --agent <uuid> --file scripts/price-tables/sds-manager-us.json           # dry run
//   npm run set-price-table -- --agent <uuid> --file scripts/price-tables/sds-manager-us.json --apply
//
// Operator-only (service-role DB, like adopt-number). --apply writes agents.config.priceTable
// plus a new version row (rule 4), THEN sets the provider tools to the agent's full set
// (agentTools: booking if live + price), which replaces any tools the agent already had.
// The prompt is not touched: replace its price table with "call look_up_price" in a Save.
import { config } from 'dotenv'
config({ path: '.env.local' })

import { readFileSync } from 'node:fs'
import { getEnv, serviceClient } from '@voiceflow/db'
import { normalizeStoredConfig, type StoredAgentConfig } from '@voiceflow/engine/templates'
import { agentTools } from '../apps/web/lib/agent-tools'
import { makeEngine } from '../apps/web/lib/engine'
import { lookupPrice, parsePriceTable } from '../apps/web/lib/price-table'

const arg = (name: string) => {
  const i = process.argv.indexOf(name)
  return i > 0 ? process.argv[i + 1] : undefined
}
const agentId = arg('--agent')
const file = arg('--file')
const apply = process.argv.includes('--apply')

async function main() {
  if (!agentId || !file) throw new Error('usage: --agent <uuid> --file <price-table.json> [--apply]')
  const table = parsePriceTable(JSON.parse(readFileSync(file, 'utf8')))
  for (const n of [50, 100, 101, 620, 10_000, 10_001]) console.log(`  ${n} → ${JSON.stringify(lookupPrice(table, n))}`)

  const env = getEnv()
  if (!env.APP_URL || !env.AGENT_TOOLS_SECRET) throw new Error('APP_URL and AGENT_TOOLS_SECRET must be set')
  const db = serviceClient()
  const { data: agent, error } = await db
    .from('agents')
    .select('id, provider, provider_agent_id, config')
    .eq('id', agentId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!agent) throw new Error(`agent ${agentId} not found`)

  const next: StoredAgentConfig = { ...normalizeStoredConfig(agent.config), priceTable: table }
  const tools = agentTools(agent.id, next, env.APP_URL, env.AGENT_TOOLS_SECRET)
  console.log(`agent ${agent.id} (${agent.provider} ${agent.provider_agent_id}): tools → ${tools.map((t) => t.name).join(', ')}`)
  if (!apply) return console.log('dry run: nothing written. Add --apply.')

  // DB first: the route reads the table, so it must exist before the tool can be called.
  const { error: updErr } = await db
    .from('agents')
    .update({ config: next, updated_by: 'set-price-table', updated_at: new Date().toISOString() })
    .eq('id', agent.id)
  if (updErr) throw new Error(updErr.message)
  const { data: last } = await db
    .from('agent_config_versions')
    .select('version')
    .eq('agent_id', agent.id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  const version = (last?.version ?? 0) + 1
  const { error: verErr } = await db
    .from('agent_config_versions')
    .insert({ agent_id: agent.id, version, config: next, label: 'Price table' })
  if (verErr) throw new Error(verErr.message)

  await makeEngine(agent.provider).setAgentTools(agent.provider_agent_id, tools)
  console.log(`applied: version ${version}, provider tools set`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
