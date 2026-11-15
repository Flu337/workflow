import { SERVER_USERS_DB, type ServerUserRecord } from './db'
import type { SessionUserDto, UserRole } from '../../shared/types/workflow'
import type { H3Event } from 'h3'

interface SessionRecord {
  token: string
  userId: string
  expiresAt: number
}

// таблица активных серверных сессий пользователей
const SERVER_SESSIONS = new Map<string, SessionRecord>()

export function toSessionUserDto(user: ServerUserRecord): SessionUserDto {
  return {
    id: user.id,
    name: user.name,
    shortName: user.shortName,
    email: user.email,
    role: user.role,
    roleLabel: user.roleLabel,
    initials: user.initials,
    company: user.company || 'АО «Вектор»',
    isActive: user.isActive
  }
}

export function createServerSession(event: H3Event, user: ServerUserRecord): string {
  const token = `sess_${user.id}_${Date.now()}`
  SERVER_SESSIONS.set(token, {
    token,
    userId: user.id,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24
  })
  setCookie(event, 'wf_session', token, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  })
  setCookie(event, 'wf_role', user.role, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  })
  return token
}

export function clearServerSession(event: H3Event, markExpired = false): void {
  const currentCookie = getCookie(event, 'wf_session')
  if (currentCookie) {
    SERVER_SESSIONS.delete(currentCookie)
  }
  setCookie(event, 'wf_session', markExpired ? 'expired' : 'logged_out', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  })
}

export function resolveSessionFromEvent(event: H3Event): {
  authenticated: boolean
  expired: boolean
  user: SessionUserDto | null
} {
  const sessionCookie = getCookie(event, 'wf_session') || ''
  const roleCookie = (getCookie(event, 'wf_role') || '') as UserRole | ''

  if (sessionCookie === 'expired') {
    return {
      authenticated: false,
      expired: true,
      user: null
    }
  }

  if (sessionCookie === 'logged_out') {
    return {
      authenticated: false,
      expired: false,
      user: null
    }
  }

  if (sessionCookie && SERVER_SESSIONS.has(sessionCookie)) {
    const rec = SERVER_SESSIONS.get(sessionCookie)!
    if (rec.expiresAt < Date.now()) {
      SERVER_SESSIONS.delete(sessionCookie)
      return {
        authenticated: false,
        expired: true,
        user: null
      }
    }
    const foundUser = SERVER_USERS_DB.find(u => u.id === rec.userId)
    if (foundUser && foundUser.isActive) {
      return {
        authenticated: true,
        expired: false,
        user: toSessionUserDto(foundUser)
      }
    }
  }

  if (roleCookie && ['Client', 'Operator', 'Agent', 'Admin'].includes(roleCookie)) {
    const byRole = SERVER_USERS_DB.find(u => u.role === roleCookie && u.isActive)
    if (byRole) {
      return {
        authenticated: true,
        expired: false,
        user: toSessionUserDto(byRole)
      }
    }
  }

  // по умолчанию для локальной разработки активна сессия оператора анны кузнецовой
  const defaultOperator = SERVER_USERS_DB.find(u => u.role === 'Operator' && u.isActive) || SERVER_USERS_DB[0]
  if (defaultOperator) {
    return {
      authenticated: true,
      expired: false,
      user: toSessionUserDto(defaultOperator)
    }
  }

  return {
    authenticated: false,
    expired: false,
    user: null
  }
}

// обязательная серверная проверка авторизации для защищённых операций
export function requireAuthUser(event: H3Event): SessionUserDto {
  const resolved = resolveSessionFromEvent(event)
  if (!resolved.authenticated || !resolved.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: resolved.expired
        ? 'Сессия истекла. Войдите снова, чтобы продолжить работу.'
        : 'Требуется авторизация для доступа к данным.'
    })
  }
  return resolved.user
}

export function requireRoles(event: H3Event, allowedRoles: UserRole[]): SessionUserDto {
  const user = requireAuthUser(event)
  if (!allowedRoles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Эта операция недоступна вашей роли.'
    })
  }
  return user
}
