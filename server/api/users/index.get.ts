import { SERVER_USERS_DB } from '../../utils/db'
import { requireAuthUser } from '../../utils/auth'
import type { UserDirectoryItemDto } from '../../../shared/types/workflow'

export default defineEventHandler((event): UserDirectoryItemDto[] => {
  requireAuthUser(event)
  return SERVER_USERS_DB.map(({ password: _password, ...publicUser }) => publicUser)
})
