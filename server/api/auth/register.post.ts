import { SERVER_USERS_DB, SERVER_CUSTOMERS_DB, type ServerUserRecord } from '../../utils/db'
import { createServerSession, toSessionUserDto } from '../../utils/auth'
import { registerInputSchema } from '../../../shared/utils/validation'
import type { AuthSessionResponseDto } from '../../../shared/types/workflow'

export default defineEventHandler(async (event): Promise<AuthSessionResponseDto> => {
  const rawBody = await readBody<Record<string, unknown>>(event)
  const parsed = registerInputSchema.safeParse(rawBody)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: parsed.error.message
    })
  }

  const { name, company, email, password } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const existing = SERVER_USERS_DB.find(
    u => u.email.toLowerCase() === normalizedEmail
  )

  if (existing && normalizedEmail !== '0000@mail.demo') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      message: 'Пользователь с таким адресом электронной почты уже зарегистрирован.'
    })
  }

  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials =
    parts.length >= 2 && parts[0] && parts[1]
      ? `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
      : (parts[0] || 'КЛ').slice(0, 2).toUpperCase()
  const shortName =
    parts.length >= 2 && parts[0] && parts[1]
      ? `${parts[0]} ${parts[1][0]}.`
      : name.trim()

  if (!SERVER_CUSTOMERS_DB.some(c => c.name === company)) {
    SERVER_CUSTOMERS_DB.push({
      id: `cust-${Date.now()}`,
      name: company,
      contactPerson: name
    })
  }

  const newUser: ServerUserRecord = {
    id: `u-client-${Date.now()}`,
    name,
    shortName,
    role: 'Client',
    roleLabel: 'Клиент',
    email: normalizedEmail === '0000@mail.demo' ? 'client@mail.demo' : email,
    password,
    initials,
    company,
    isActive: true
  }

  SERVER_USERS_DB.push(newUser)
  createServerSession(event, newUser)

  return {
    authenticated: true,
    expired: false,
    user: toSessionUserDto(newUser)
  }
})
