import { withApiAuth } from '../../../../../lib/api-v1/wrapper'
import { getAgent } from '../../../../../lib/api-v1/handlers'

export const GET = withApiAuth(getAgent)
