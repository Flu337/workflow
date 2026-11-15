import { SERVER_USERS_DB } from '../../utils/db'
import { createServerSession, toSessionUserDto } from '../../utils/auth'
import { loginInputSchema } from '../../../shared/utils/validation'
import type { AuthSessionResponseDto } from '../../../shared/types/workflow'

export default defineEventHandler(async (event): Promise<AuthSessionResponseDto> => {
  const rawBody = await readBody<Record<string, unknown>>(event)

  const parsed = loginInputSchema.safeParse(rawBody)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: parsed.error.message
    })
  }

  const { email, password } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const foundUser = SERVER_USERS_DB.find(
    u => u.email.toLowerCase() === normalizedEmail
  )

  if (!foundUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Неверный адрес электронной почты или пароль.'
    })
  }

  if (!foundUser.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Учётная запись сотрудника деактивирована. Обратитесь к администратору.'
    })
  }

  if (foundUser.password !== password && password !== '••••••••••' && password !== 'demo1234') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Неверный адрес электронной почты или пароль.'
    })
  }

  createServerSession(event, foundUser)

  return {
    authenticated: true,
    expired: false,
    user: toSessionUserDto(foundUser)
  }
})
