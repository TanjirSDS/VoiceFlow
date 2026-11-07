// POST /api/tools/price: the calcom tool's auth contract (secret header, ?agent=) plus input
// validation, and the registration rule (an agent with a price table gets look_up_price).
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const SECRET = 'tools-secret-0123456789'
const AGENT = '3f46bd9f-0000-4000-8000-000000000001'
const priceTable = {
  plans: { Premium: [{ up_to: 100, annual_usd: 468 }, { up_to: 800, annual_usd: 1768 }], Basic: [{ up_to: 100, annual_usd: 228 }] },
  custom_quote_above: 800,
  default_plan: 'Premium',
}
const agentConfig = { name: 'A', systemPrompt: 'p', firstMessage: '', voiceId: 'v' }
const db = { row: null as unknown, askedFor: '' }

vi.mock('@voiceflow/db', () => ({
  getEnv: () => ({ AGENT_TOOLS_SECRET: SECRET }),
  serviceClient: () => ({
    from: () => ({
      select: () => ({
        eq: (_col: string, id: string) => ({
          maybeSingle: async () => ((db.askedFor = id), { data: db.row, error: null }),
        }),
      }),
    }),
  }),
}))

import { agentTools } from '../../../../lib/agent-tools'
import { POST } from './route'

const call = (body: unknown, { secret = SECRET as string | null, agent = AGENT as string | null } = {}) =>
  POST(
    new NextRequest(`http://localhost/api/tools/price${agent ? `?agent=${agent}` : ''}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(secret && { 'x-voiceflow-tools-secret': secret }) },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  )
const json = async (res: Response) => (expect(res.status).toBe(200), res.json())

beforeEach(() => {
  db.row = { config: { agentType: 'single', template: null, agentConfig, priceTable } }
  db.askedFor = ''
})

describe('POST /api/tools/price auth', () => {
  it('401s without the secret header, or with a wrong one', async () => {
    expect((await call({ count: 50 }, { secret: null })).status).toBe(401)
    expect((await call({ count: 50 }, { secret: 'tools-secret-0123456780' })).status).toBe(401)
    expect((await call({ count: 50 }, { secret: 'short' })).status).toBe(401)
    expect(db.askedFor).toBe('') // never reached the DB
  })

  it('a missing or malformed ?agent= is a spoken error, not a crash', async () => {
    expect(await json(await call({ count: 50 }, { agent: null }))).toHaveProperty('error')
    expect(await json(await call({ count: 50 }, { agent: 'abc' }))).toHaveProperty('error')
  })
})

describe('POST /api/tools/price lookup', () => {
  it('prices the count from THIS agent’s table', async () => {
    expect(await json(await call({ count: 620 }))).toEqual({
      plan: 'Premium',
      count: 620,
      annual_usd: 1768,
      spoken: 'seventeen sixty-eight a year',
    })
    expect(db.askedFor).toBe(AGENT)
    expect(await json(await call({ count: 50, plan: 'basic' }))).toMatchObject({ plan: 'Basic', annual_usd: 228 })
    expect(await json(await call({ count: 801 }))).toEqual({ plan: 'Premium', count: 801, custom_quote: true })
  })

  it.each([[{ count: -5 }], [{ count: '620' }], [{ count: 2.5 }], [{}], [{ count: 50, plan: 'Gold' }], ['not json']])(
    'answers %j with 200 {error}',
    async (body) => {
      expect(await json(await call(body))).toHaveProperty('error')
    }
  )

  it('no table, or a broken one, says so instead of guessing', async () => {
    db.row = { config: { agentType: 'single', template: null, agentConfig } }
    expect(await json(await call({ count: 50 }))).toHaveProperty('error')
    db.row = null
    expect(await json(await call({ count: 50 }))).toHaveProperty('error')
    db.row = { config: { agentType: 'single', template: null, agentConfig, priceTable: { plans: {} } } }
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await json(await call({ count: 50 }))).toHaveProperty('error')
  })
})

describe('agentTools registration', () => {
  const stored = { agentType: 'single' as const, template: null, agentConfig }
  it('an agent with a price table gets look_up_price (count required, plan optional)', () => {
    const [tool, ...rest] = agentTools(AGENT, { ...stored, priceTable }, 'https://app.example', SECRET)
    expect(rest).toEqual([])
    expect(tool.name).toBe('look_up_price')
    expect(tool.url).toBe(`https://app.example/api/tools/price?agent=${AGENT}`)
    expect(tool.secretHeader).toEqual({ name: 'x-voiceflow-tools-secret', value: SECRET })
    expect(tool.params.map((p) => [p.name, p.type, !!p.required])).toEqual([
      ['count', 'number', true],
      ['plan', 'string', false],
    ])
    expect(tool.description).toMatch(/EVERY price/)
    expect(tool.description).toMatch(/Plans: Premium, Basic\./)
  })

  it('no table → no price tool; live booking keeps its tool next to it', () => {
    expect(agentTools(AGENT, stored, 'https://app.example', SECRET)).toEqual([])
    const seed = { liveBooking: true } as never
    const names = agentTools(AGENT, { ...stored, seed, priceTable }, 'https://app.example', SECRET).map((t) => t.name)
    expect(names).toEqual(['check_availability_and_book', 'look_up_price'])
  })
})
