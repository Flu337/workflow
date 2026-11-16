import { defineStore } from 'pinia'
import { usePreferencesStore } from './preferences'
import type {
  AuthSessionResponseDto,
  LoginPayloadDto,
  RegisterPayloadDto,
  SessionUserDto,
  UserRole
} from '../../shared/types/workflow'

// локальный список seed аккаунтов для резервного входа
const FALLBACK_USERS: SessionUserDto[] = [
  {
    id: 'u-1',
    name: 'Анна Кузнецова',
    shortName: 'Анна К.',
    email: '0000@mail.demo',
    role: 'Operator',
    roleLabel: 'Оператор',
    initials: 'АК',
    company: 'WorkFlow Support',
    isActive: true
  },
  {
    id: 'u-2',
    name: 'Брунгильда Брунгильдовна',
    shortName: 'Брунгильда Б.',
    email: 'agent@mail.demo',
    role: 'Agent',
    roleLabel: 'Исполнитель',
    initials: 'ББ',
    company: 'WorkFlow Support',
    isActive: true
  },
  {
    id: 'u-3',
    name: 'Олег Соколов',
    shortName: 'Олег С.',
    email: 'oleg@mail.demo',
    role: 'Agent',
    roleLabel: 'Исполнитель',
    initials: 'ОС',
    company: 'WorkFlow Support',
    isActive: false
  },
  {
    id: 'u-4',
    name: 'Мария Смирнова',
    shortName: 'Мария С.',
    email: 'client@mail.demo',
    role: 'Client',
    roleLabel: 'Клиент',
    initials: 'МС',
    company: 'АО «Вектор»',
    isActive: true
  },
  {
    id: 'u-5',
    name: 'Кирилл Серёгин',
    shortName: 'Кирилл С.',
    email: 'admin@mail.demo',
    role: 'Admin',
    roleLabel: 'Администратор',
    initials: 'КС',
    company: 'WorkFlow Support',
    isActive: true
  }
]

// глобальное хранилище авторизации и текущей роли пользователя
export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUserDto | null>({
    id: 'u-1',
    name: 'Анна Кузнецова',
    shortName: 'Анна К.',
    email: '0000@mail.demo',
    role: 'Operator',
    roleLabel: 'Оператор',
    initials: 'АК',
    company: 'WorkFlow Support',
    isActive: true
  })
  const authenticated = ref<boolean>(true)
  const expired = ref<boolean>(false)
  const sessionRestored = ref<boolean>(false)

  const syncWithPreferences = (sessionUser: SessionUserDto | null) => {
    if (!sessionUser) return
    const preferencesStore = usePreferencesStore()
    preferencesStore.name = sessionUser.name
    preferencesStore.email = sessionUser.email
    preferencesStore.initials = sessionUser.initials
    preferencesStore.role = sessionUser.roleLabel
  }

  const applySessionResponse = (res: AuthSessionResponseDto | null | undefined) => {
    if (!res) return
    authenticated.value = Boolean(res.authenticated && res.user)
    expired.value = Boolean(res.expired)
    user.value = res.user || null
    sessionRestored.value = true
    syncWithPreferences(res.user || null)
  }

  const handleUnauthorizedError = async (): Promise<void> => {
    authenticated.value = false
    expired.value = true
    user.value = null
    sessionRestored.value = true
    if (import.meta.client) {
      await navigateTo('/login?expired=1', { replace: true })
    }
  }

  const fetchSession = async (): Promise<AuthSessionResponseDto> => {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const res = await $fetch<AuthSessionResponseDto>('/api/auth/session', {
        headers
      })
      applySessionResponse(res)
      return res
    } catch {
      sessionRestored.value = true
      return {
        authenticated: authenticated.value,
        expired: expired.value,
        user: user.value
      }
    }
  }

  const login = async (payload: LoginPayloadDto): Promise<AuthSessionResponseDto> => {
    try {
      const res = await $fetch<AuthSessionResponseDto>('/api/auth/login', {
        method: 'POST',
        body: payload
      })
      applySessionResponse(res)
      return res
    } catch (err) {
      const status = (err as { statusCode?: number; status?: number })?.statusCode ||
        (err as { statusCode?: number; status?: number })?.status
      if (status === 404) {
        const normalizedEmail = payload.email.trim().toLowerCase()
        const fallbackUser =
          FALLBACK_USERS.find(u => u.email.toLowerCase() === normalizedEmail) ||
          FALLBACK_USERS[0]
        if (fallbackUser && !fallbackUser.isActive) {
          throw new Error('Учётная запись сотрудника деактивирована. Обратитесь к администратору.')
        }
        const fallbackRes: AuthSessionResponseDto = {
          authenticated: true,
          expired: false,
          user: fallbackUser || null
        }
        applySessionResponse(fallbackRes)
        return fallbackRes
      }
      throw err
    }
  }

  const register = async (payload: RegisterPayloadDto): Promise<AuthSessionResponseDto> => {
    try {
      const res = await $fetch<AuthSessionResponseDto>('/api/auth/register', {
        method: 'POST',
        body: payload
      })
      applySessionResponse(res)
      return res
    } catch (err) {
      const status = (err as { statusCode?: number; status?: number })?.statusCode ||
        (err as { statusCode?: number; status?: number })?.status
      if (status === 404) {
        const parts = payload.name.trim().split(/\s+/).filter(Boolean)
        const initials = ((parts[0]?.[0] || 'К') + (parts[1]?.[0] || '')).toUpperCase()
        const newUser: SessionUserDto = {
          id: `u-${Date.now()}`,
          name: payload.name.trim(),
          shortName: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          role: 'Client',
          roleLabel: 'Клиент',
          initials,
          company: payload.company.trim(),
          isActive: true
        }
        const fallbackRes: AuthSessionResponseDto = {
          authenticated: true,
          expired: false,
          user: newUser
        }
        applySessionResponse(fallbackRes)
        return fallbackRes
      }
      throw err
    }
  }

  // полный сброс сессии и состояния при выходе пользователя
  const logout = async (markExpired = false): Promise<void> => {
    try {
      const res = await $fetch<AuthSessionResponseDto>('/api/auth/logout', {
        method: 'POST',
        body: { expired: markExpired }
      })
      applySessionResponse(res)
    } catch {
      // очистка даже при недоступности сети
    } finally {
      authenticated.value = false
      expired.value = markExpired
      user.value = null
      sessionRestored.value = true
      if (import.meta.client && typeof document !== 'undefined') {
        document.cookie = `wf_session=${markExpired ? 'expired' : 'logged_out'}; path=/; max-age=86400; SameSite=Lax`
        document.cookie = 'wf_role=; path=/; max-age=0; SameSite=Lax'
      }
    }
  }

  const currentRole = computed<UserRole>(() => user.value?.role || 'Operator')
  const currentRoleLabel = computed<string>(() => user.value?.roleLabel || 'Оператор')

  return {
    user,
    authenticated,
    expired,
    sessionRestored,
    currentRole,
    currentRoleLabel,
    applySessionResponse,
    handleUnauthorizedError,
    fetchSession,
    login,
    register,
    logout
  }
})
