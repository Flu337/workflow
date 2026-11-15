import { SERVER_USERS_DB } from '../../utils/db'
import type { UserDirectoryItemDto } from '~/types/workflow'

export default defineEventHandler((): UserDirectoryItemDto[] => {
  return SERVER_USERS_DB
})
