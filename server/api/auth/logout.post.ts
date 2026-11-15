import { clearServerSession } from '../../utils/auth'
import type { AuthSessionResponseDto } from '../../../shared/types/workflow'

export default defineEventHandler(async (event): Promise<AuthSessionResponseDto> => {
  const body = await readBody<{ expired?: boolean }>(event).catch(() => ({ expired: false }))
  const markExpired = Boolean(body?.expired)
  clearServerSession(event, markExpired)

  return {
    authenticated: false,
    expired: markExpired,
    user: null
  }
})
