import { serviceClient } from '@voiceflow/db'
import { normalizeStoredConfigSafe } from '@voiceflow/engine/templates'
import { NextResponse, type NextRequest } from 'next/server'
import { toolSecretOk } from '../../../../lib/agent-tools'
import { lookupPrice, parsePriceTable } from '../../../../lib/price-table'

export const runtime = 'nodejs'

// The agent's look_up_price tool lands here mid-call. Same contract as the calcom tool:
// static secret header, ?agent=<uuid> picks the price list (agents.config.priceTable),
// errors return 200 {error} so the agent recovers verbally instead of getting a dead tool.

const speak = (body: Record<string, unknown>) => NextResponse.json(body)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  if (!toolSecretOk(req)) return new NextResponse('unauthorized', { status: 401 })

  const agentId = req.nextUrl.searchParams.get('agent')
  if (!agentId || !UUID.test(agentId)) return speak({ error: 'tool misconfigured: no agent' })

  const { data: agent } = await serviceClient().from('agents').select('config').eq('id', agentId).maybeSingle()
  const raw = normalizeStoredConfigSafe(agent?.config)?.priceTable
  const noTable = { error: 'No price list is set up. Offer to have someone follow up with a quote.' }
  if (!raw) return speak(noTable)
  let table
  try {
    table = parsePriceTable(raw)
  } catch (e) {
    console.error(`price tool: agent ${agentId} has an invalid price table:`, e)
    return speak(noTable)
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return speak({ error: 'invalid request' })
  }
  return speak(lookupPrice(table, body?.count, body?.plan))
}
