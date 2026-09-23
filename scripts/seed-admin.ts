// Grant platform-admin (support) access: npm run seed-admin -- person@company.com
// Creates the auth user if needed (same as seed-orgs) and inserts admin_users.
import { config } from 'dotenv'
config({ path: '.env.local' })

import { ensureAuthUser, pool, serviceClient } from '@voiceflow/db'

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error('usage: npm run seed-admin -- person@company.com')
    process.exit(1)
  }
  const userId = await ensureAuthUser(email)
  const { error } = await serviceClient().from('admin_users').upsert({ user_id: userId })
  if (error) throw error
  console.log(`✅ ${email} is a platform admin (user ${userId})`)
}

main()
  .then(() => pool().end())
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
