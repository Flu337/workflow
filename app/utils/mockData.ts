import { SERVER_REQUESTS_DB } from '../../server/utils/db'
import { normalizeRequestItem } from './normalizeRequests'
import type { WorkFlowRequest } from '~/types/workflow'

export const MOCK_REQUESTS: WorkFlowRequest[] = SERVER_REQUESTS_DB.map(normalizeRequestItem)
