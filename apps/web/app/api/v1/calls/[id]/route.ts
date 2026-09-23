import { withApiAuth } from '../../../../../lib/api-v1/wrapper'
import { getCall } from '../../../../../lib/api-v1/handlers'

export const GET = withApiAuth(getCall)
