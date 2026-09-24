import { withApiAuth } from '../../../../lib/api-v1/wrapper'
import { createCall, listCalls } from '../../../../lib/api-v1/handlers'

export const GET = withApiAuth(listCalls)
export const POST = withApiAuth(createCall)
