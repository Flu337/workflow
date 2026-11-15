import { SERVER_CUSTOMERS_DB } from '../../utils/db'
import type { CustomerDirectoryItemDto } from '~/types/workflow'

export default defineEventHandler((): CustomerDirectoryItemDto[] => {
  return SERVER_CUSTOMERS_DB
})
