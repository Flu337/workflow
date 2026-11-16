<script setup lang="ts">
import { usePreferencesStore } from '~/stores/preferences'
import { defineAsyncComponent } from 'vue'
import { useAuthStore } from '~/stores/auth'

// ленивая подгрузка модального окна создания заявки только при его открытии
const LazyCreateRequestModal = defineAsyncComponent(() => import('~/components/WFGPTCreateRequestModal.vue'))

const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()
const { isCreateModalOpen } = useRequests()
const route = useRoute()

const isMobileMenuOpen = ref(false)
const isNotificationsOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isNotificationsOpen.value = false
  }
}

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
  if (isNotificationsOpen.value) {
    isMobileMenuOpen.value = false
  }
}

const closeMenus = () => {
  isMobileMenuOpen.value = false
  isNotificationsOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeMenus()
  }
)

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeMenus()
  }
}

onMounted(async () => {
  preferencesStore.initFromStorage()
  await authStore.fetchSession()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="app-shell">
    <div class="obolochka-prilozheniia">
      <div class="rabochaia-oblast">
        <header class="verkhniaia-panel">
          <NuxtLink to="/dashboard" class="workflow ui-nav-link-logo">
            WorkFlow
          </NuxtLink>

          <nav class="perekhody-razdelov" aria-label="Основная навигация">
            <NuxtLink
              to="/dashboard"
              class="obzor ui-nav-link"
              :class="{ 'is-active': route.path === '/dashboard' }"
            >
              Обзор
            </NuxtLink>
            <NuxtLink
              to="/requests"
              class="zaiavki ui-nav-link"
              :class="{ 'is-active': route.path.startsWith('/requests') }"
            >
              Заявки
            </NuxtLink>
          </nav>

          <div class="header-actions">
            <div class="notification-wrapper">
              <button
                type="button"
                class="ui-icon-btn"
                aria-label="Уведомления"
                :aria-expanded="isNotificationsOpen"
                @click="toggleNotifications"
              >
                <OctagonIconBell />
              </button>

              <div v-if="isNotificationsOpen" class="notifications-popover" role="region" aria-label="Список уведомлений">
                <p class="popover-title">Уведомления</p>
                <p class="popover-item">Новая заявка #1042: Не работает доступ к CRM</p>
                <p class="popover-item">Критическая заявка #1041: Ошибка выгрузки отчёта</p>
              </div>
            </div>

            <NuxtLink
              to="/profile"
              class="avatar-link ui-icon-btn"
              aria-label="Профиль"
            >
              <OctagonAvatar :initials="authStore.user?.initials || preferencesStore.initials" />
            </NuxtLink>

            <NuxtLink to="/profile" class="operator">
              {{ authStore.currentRoleLabel }}
            </NuxtLink>

            <button
              type="button"
              class="mobile-menu-btn ui-icon-btn"
              aria-label="Открыть меню навигации"
              :aria-expanded="isMobileMenuOpen"
              @click="toggleMobileMenu"
            >
              <OctagonIconMenu />
            </button>
          </div>
        </header>

        <nav
          v-if="isMobileMenuOpen"
          class="mobile-nav-drawer"
          aria-label="Мобильное меню"
        >
          <NuxtLink
            to="/dashboard"
            class="ui-nav-link"
            :class="{ 'is-active': route.path === '/dashboard' }"
            @click="closeMenus"
          >
            Обзор
          </NuxtLink>
          <NuxtLink
            to="/requests"
            class="ui-nav-link"
            :class="{ 'is-active': route.path.startsWith('/requests') }"
            @click="closeMenus"
          >
            Заявки
          </NuxtLink>
          <NuxtLink
            to="/profile"
            class="ui-nav-link"
            :class="{ 'is-active': route.path === '/profile' }"
            @click="closeMenus"
          >
            Профиль ({{ authStore.currentRoleLabel }})
          </NuxtLink>
        </nav>

        <main class="main-slot">
          <slot />
        </main>
      </div>
    </div>

    <LazyCreateRequestModal v-if="isCreateModalOpen" v-model="isCreateModalOpen" />
  </div>
</template>

<style scoped src="~/assets/css/layouts/default.css"></style>
