import { defineStore } from 'pinia'
import type { ListDensity, UserPreferencesState } from '~/types/workflow'

const STORAGE_KEY = 'wf-user-preferences-v2'

// глобальное хранилище пользовательских настроек интерфейса с сохранением в localstorage
export const usePreferencesStore = defineStore('preferences', () => {
  const name = ref<string>('Анна Кузнецова')
  const email = ref<string>('0000@mail.demo')
  const initials = ref<string>('АК')
  const role = ref<string>('Оператор')
  const density = ref<ListDensity>('comfortable')
  const isHydrated = ref<boolean>(false)

  const computeInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
    }
    if (parts.length === 1 && parts[0]) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return 'АК'
  }

  const persistToStorage = () => {
    if (!import.meta.client) return
    try {
      const payload: UserPreferencesState = {
        name: name.value,
        email: email.value,
        initials: initials.value,
        role: role.value,
        density: density.value
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // игнорируем ошибки переполнения или приватного режима браузера
    }
  }

  const initFromStorage = () => {
    if (!import.meta.client || isHydrated.value) return
    isHydrated.value = true
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<UserPreferencesState>
      if (typeof parsed.name === 'string' && parsed.name.trim()) {
        name.value = parsed.name.trim()
        initials.value = computeInitials(name.value)
      }
      if (typeof parsed.email === 'string' && parsed.email.trim()) {
        email.value = parsed.email.trim()
      }
      if (parsed.density === 'compact' || parsed.density === 'comfortable') {
        density.value = parsed.density
      }
    } catch {
      // при поврежденном json используем стандартные настройки
    }
  }

  const setDensity = (nextDensity: ListDensity) => {
    density.value = nextDensity
    persistToStorage()
  }

  const updateProfile = (payload: { name: string; email: string; density?: ListDensity }) => {
    const cleanName = payload.name.trim() || 'Анна Кузнецова'
    const cleanEmail = payload.email.trim() || '0000@mail.demo'
    name.value = cleanName
    email.value = cleanEmail
    initials.value = computeInitials(cleanName)
    if (payload.density) {
      density.value = payload.density
    }
    persistToStorage()
  }

  const isCompact = computed<boolean>(() => density.value === 'compact')

  return {
    name,
    email,
    initials,
    role,
    density,
    isHydrated,
    isCompact,
    initFromStorage,
    setDensity,
    updateProfile
  }
})
