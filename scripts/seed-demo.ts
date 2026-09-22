// Local demo seed: two agents (one single-prompt, one conversational flow) and a
// phone number, inserted STRAIGHT INTO POSTGRES — no ElevenLabs call, so it works
// with placeholder provider keys. provider_agent_id is fake, so anything that
// talks to the provider (test widget, simulate, save) will fail; the UI renders.
//
// Run LAST — seed-orgs resets the first org back to Starter, which re-gates
// KB/QA/adaptive behind upsell cards:
//
//   npm run seed-orgs && npm run seed-calls && npm run seed-orgs \
//     && npm run backfill-contacts && npm run seed-demo
//
// Idempotent: upserts on agents.name within the org.
// ponytail: the whole point is a browsable frontend without provider keys — when
// real keys exist, delete this and use the create modal / bootstrap.ts instead.

import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

import { serviceClient, type SupabaseClient } from '@voiceflow/db'
import {
  DEFAULT_ANALYSIS,
  END_NODE_ID,
  templates,
  validateWorkflow,
  WELCOME_NODE_ID,
  type BusinessProfile,
  type StoredAgentConfig,
  type WorkflowGraph,
} from '@voiceflow/engine/templates'

const EMAIL = 'demo@voiceflow.test'

const PROFILE: BusinessProfile = {
  businessName: "Joe's Plumbing",
  industry: 'plumbing',
  hours: 'Mon-Fri 8am-6pm, Sat 9am-1pm',
  services: ['drain cleaning', 'boiler service', 'emergency leaks'],
  faqs: [
    { q: 'Do you charge a call-out fee?', a: 'Yes, £45 which comes off the job price if you go ahead.' },
    { q: 'Which areas do you cover?', a: 'Springfield and everywhere within 15 miles.' },
  ],
  greetingStyle: 'friendly',
  escalationNumber: '+15551239999',
  // Fake voice id — listVoices needs a real key, and nothing resolves this offline.
  voiceId: 'demo-voice-id',
}

// A 4-node booking flow: more interesting on the canvas than defaultWorkflow(),
// and it exercises a branch (two conditional edges out of Welcome) + a transfer.
const DEMO_FLOW: WorkflowGraph = {
  startNodeId: WELCOME_NODE_ID,
  nodes: [
    {
      id: WELCOME_NODE_ID,
      type: 'conversation',
      label: 'Welcome',
      prompt: 'Greet the caller and find out whether they want to book a visit or have an emergency.',
      entryBehavior: 'generate_immediately',
      position: { x: 240, y: 40 },
    },
    {
      id: 'book',
      type: 'conversation',
      label: 'Book a visit',
      prompt:
        'Collect the job type, the address, and two preferred time windows. Confirm the details back to the caller.',
      position: { x: 40, y: 260 },
    },
    {
      id: 'transfer',
      type: 'transfer_number',
      label: 'Emergency transfer',
      transferTo: PROFILE.escalationNumber,
      position: { x: 440, y: 260 },
    },
    { id: END_NODE_ID, type: 'end', label: 'End call', position: { x: 240, y: 480 } },
  ],
  edges: [
    { from: WELCOME_NODE_ID, to: 'book', condition: 'The caller wants to book a routine appointment.' },
    { from: WELCOME_NODE_ID, to: 'transfer', condition: 'The caller has a burst pipe, flood, or gas smell.' },
    { from: 'book', to: END_NODE_ID, condition: 'The appointment details are confirmed.' },
  ],
}

async function upsertAgent(db: SupabaseClient, orgId: string, stored: StoredAgentConfig) {
  const name = stored.agentConfig.name
  const { data: existing } = await db
    .from('agents')
    .select('id')
    .eq('org_id', orgId)
    .eq('name', name)
    .maybeSingle()

  const row = {
    org_id: orgId,
    name,
    provider: 'elevenlabs',
    provider_agent_id: `demo-agent-${stored.agentType}`,
    config: stored,
    agent_type: stored.agentType,
    status: 'active',
    updated_by: EMAIL,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = existing
    ? await db.from('agents').update(row).eq('id', existing.id).select('id').single()
    : await db.from('agents').insert(row).select('id').single()
  if (error) throw new Error(`agent ${name}: ${error.message}`)

  // Rule 4: every config lands as a version row. Upsert keeps re-runs at v1.
  const { error: vErr } = await db
    .from('agent_config_versions')
    .upsert({ agent_id: data.id, version: 1, config: stored, label: 'demo seed' }, { onConflict: 'agent_id,version' })
  if (vErr) throw new Error(`version ${name}: ${vErr.message}`)
  return data.id as string
}

async function main() {
  const db = serviceClient()

  const { data: org, error: orgErr } = await db
    .from('orgs')
    .select('id, name')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (orgErr) throw new Error(`orgs: ${orgErr.message}`)
  if (!org) throw new Error('no orgs — run `npm run seed-orgs` first')

  // DEV_BYPASS_AUTH picks the first org, and Starter gates KB/QA/adaptive behind
  // upsell cards. Pro so the demo shows every surface.
  await db.from('orgs').update({ plan_id: 'pro', minutes_cap: 2500 }).eq('id', org.id)

  const single = templates.receptionist(PROFILE)
  const singleId = await upsertAgent(db, org.id, {
    agentType: 'single',
    template: 'receptionist',
    seed: PROFILE,
    agentConfig: { ...single, analysis: DEFAULT_ANALYSIS, widget: { public: true } },
  })

  const problems = validateWorkflow(DEMO_FLOW)
  if (problems.length) throw new Error(`demo flow is invalid: ${problems.join('; ')}`)
  const flowBase = templates.booking(PROFILE)
  await upsertAgent(db, org.id, {
    agentType: 'flow',
    template: 'booking',
    seed: PROFILE,
    agentConfig: {
      ...flowBase,
      name: 'Booking flow (demo)',
      workflow: DEMO_FLOW,
      analysis: DEFAULT_ANALYSIS,
      widget: { public: true },
    },
  })

  const { error: numErr } = await db.from('phone_numbers').upsert(
    {
      org_id: org.id,
      agent_id: singleId,
      e164: '+15551230000',
      twilio_sid: 'PNdemo0000000000000000000000000000',
      provider_number_id: 'demo-number-1',
      status: 'active',
    },
    { onConflict: 'e164' }
  )
  if (numErr) throw new Error(`phone_numbers: ${numErr.message}`)

  console.log(`✅ ${org.name} → Pro; agents: "${single.name}" (single) + "Booking flow (demo)" (flow); +15551230000`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
