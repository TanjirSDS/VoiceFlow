import { timingSafeEqual } from 'node:crypto'
import { getEnv } from '@voiceflow/db'
import type { AgentTool } from '@voiceflow/engine'
import type { PriceTable, StoredAgentConfig } from '@voiceflow/engine/templates'
import { calcomBookingTool, TOOLS_SECRET_HEADER } from './calcom'

/** Tool routes (/api/tools/*) authenticate the provider by the static secret header. */
export function toolSecretOk(req: Request): boolean {
  const secret = getEnv().AGENT_TOOLS_SECRET
  const got = req.headers.get(TOOLS_SECRET_HEADER)
  if (!secret || !got) return false
  const a = Buffer.from(got)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** look_up_price: the agent asks /api/tools/price for every price instead of reading one from its prompt. */
export function priceLookupTool(agentId: string, appUrl: string, secret: string, table: PriceTable): AgentTool {
  return {
    name: 'look_up_price',
    description:
      'Look up the exact annual price for a quantity. Call this for EVERY price you mention, every time, ' +
      'even one you quoted earlier in the call; never work out or remember a price yourself. ' +
      'Say only the price it returns, worded as its "spoken" field. ' +
      'If it returns custom_quote, offer a custom quote instead of a number. ' +
      `Plans: ${Object.keys(table.plans).join(', ')}.`,
    url: `${appUrl}/api/tools/price?agent=${agentId}`,
    secretHeader: { name: TOOLS_SECRET_HEADER, value: secret },
    params: [
      { name: 'count', type: 'number', description: 'How many the caller needs priced, as a whole number (e.g. 620).', required: true },
      { name: 'plan', type: 'string', description: 'Plan name, only if the caller asked about a specific plan.' },
    ],
  }
}

/** Every server tool this agent should have. setAgentTools REPLACES the provider's whole set,
 *  so each caller passes this full list, never just the tool it changed. */
export function agentTools(agentId: string, stored: StoredAgentConfig, appUrl: string, secret: string): AgentTool[] {
  return [
    ...(stored.seed?.liveBooking ? [calcomBookingTool(agentId, appUrl, secret)] : []),
    ...(stored.priceTable ? [priceLookupTool(agentId, appUrl, secret, stored.priceTable)] : []),
  ]
}
