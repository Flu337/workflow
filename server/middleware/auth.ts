import { resolveSessionFromEvent } from '../utils/auth'

// серверный middleware проверяющий сессию пользователя для защищённых api маршрутов
export default defineEventHandler((event) => {
  const sessionState = resolveSessionFromEvent(event)
  event.context.auth = sessionState

  const path = event.path || ''
  const isProtectedApi =
    path.startsWith('/api/requests') ||
    path.startsWith('/api/users') ||
    path.startsWith('/api/customers') ||
    path.startsWith('/api/categories') ||
    path.startsWith('/api/comments')

  if (isProtectedApi && (!sessionState.authenticated || !sessionState.user)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: sessionState.expired
        ? 'Сессия истекла. Войдите снова, чтобы продолжить работу.'
        : 'Доступ запрещён для неавторизованных пользователей.'
    })
  }
})
