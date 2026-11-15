import { SERVER_CATEGORIES_DB } from '../../utils/db'
import type { CategoryDirectoryItemDto } from '~/types/workflow'

export default defineEventHandler((): CategoryDirectoryItemDto[] => {
  return SERVER_CATEGORIES_DB
})
