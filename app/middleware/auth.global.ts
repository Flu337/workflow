import { useAuthStore } from '~/stores/auth'
import { canUserAccessDashboard } from '../../shared/utils/permissions'

// глобальный клиентский middleware проверки сессии и доступа по ролям
export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ['/', '/login', '/register']
  if (publicPaths.includes(to.path)) {
    return
  }

  const authStore = useAuthStore()
  if (!authStore.authenticated || !authStore.user) {
    await authStore.fetchSession()
  }

  if (!authStore.authenticated || !authStore.user) {
    if (authStore.expired) {
      return navigateTo('/login?expired=1')
    }
    return navigateTo('/login')
  }

  if (to.path === '/dashboard' && !canUserAccessDashboard(authStore.currentRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Нет доступа',
      message: 'Эта страница недоступна вашей роли.'
    })
  }
})
