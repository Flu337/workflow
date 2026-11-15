import { SERVER_USERS_DB } from '../../utils/db'
import {
  clearServerSession,
  createServerSession,
  resolveSessionFromEvent,
  toSessionUserDto
} from '../../utils/auth'
import type { AuthSessionResponseDto, UserRole } from '../../../shared/types/workflow'

export default defineEventHandler((event): AuthSessionResponseDto => {
  const query = getQuery(event)
  const switchRole = typeof query.switchRole === 'string' ? query.switchRole : ''

  if (switchRole === 'expired') {
    clearServerSession(event, true)
    return {
      authenticated: false,
      expired: true,
      user: null
    }
  }

  if (switchRole && ['Client', 'Operator', 'Agent', 'Admin'].includes(switchRole)) {
    const role = switchRole as UserRole
    const found = SERVER_USERS_DB.find(u => u.role === role && u.isActive)
    if (found) {
      createServerSession(event, found)
      return {
        authenticated: true,
        expired: false,
        user: toSessionUserDto(found)
      }
    }
  }

  const state = resolveSessionFromEvent(event)
  return {
    authenticated: state.authenticated,
    expired: state.expired,
    user: state.user
  }
})
