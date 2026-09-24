import { withApiAuth } from '../../../../lib/api-v1/wrapper'
import { listAgents } from '../../../../lib/api-v1/handlers'

export const GET = withApiAuth(listAgents)
