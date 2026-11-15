import { SERVER_CUSTOMERS_DB } from '../../utils/db'
import { requireAuthUser } from '../../utils/auth'
import type { CustomerDirectoryItemDto } from '../../../shared/types/workflow'

export default defineEventHandler((event): CustomerDirectoryItemDto[] => {
  requireAuthUser(event)
  return SERVER_CUSTOMERS_DB
})
