import { SERVER_CATEGORIES_DB } from '../../utils/db'
import { requireAuthUser } from '../../utils/auth'
import type { CategoryDirectoryItemDto } from '../../../shared/types/workflow'

export default defineEventHandler((event): CategoryDirectoryItemDto[] => {
  requireAuthUser(event)
  return SERVER_CATEGORIES_DB
})
