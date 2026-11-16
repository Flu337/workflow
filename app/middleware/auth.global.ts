import { useAuthStore } from '~/stores/auth'
import { canUserAccessDashboard } from '../../shared/utils/permissions'

// глобальный клиентский и серверный middleware проверки сессии и доступа к приватным маршрутам
export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ['/', '/login', '/register', '/faq', '/help', '/articles']
  if (publicPaths.includes(to.path) || to.path.startsWith('/articles/')) {
    return
  }

  const authStore = useAuthStore()

  // проверка актуального состояния сессии при первом входе перезагрузке страницы или после выхода
  if (!authStore.sessionRestored || !authStore.authenticated || !authStore.user) {
    await authStore.fetchSession()
  }

  if (import.meta.client && typeof document !== 'undefined') {
    const rawCookies = document.cookie || ''
    if (rawCookies.includes('wf_session=logged_out')) {
      authStore.authenticated = false
      authStore.expired = false
      authStore.user = null
    } else if (rawCookies.includes('wf_session=expired')) {
      authStore.authenticated = false
      authStore.expired = true
      authStore.user = null
    }
  }

  if (!authStore.authenticated || !authStore.user) {
    if (authStore.expired) {
      return navigateTo('/login?expired=1', { replace: true })
    }
    return navigateTo('/login', { replace: true })
  }

  if (to.path === '/dashboard' && !canUserAccessDashboard(authStore.currentRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Нет доступа',
      message: 'Эта страница недоступна вашей роли.'
    })
  }
})
