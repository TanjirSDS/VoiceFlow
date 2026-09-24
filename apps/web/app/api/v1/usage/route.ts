import { withApiAuth } from '../../../../lib/api-v1/wrapper'
import { getUsage } from '../../../../lib/api-v1/handlers'

export const GET = withApiAuth(getUsage)
