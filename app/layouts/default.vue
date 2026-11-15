<script setup lang="ts">
import { usePreferencesStore } from '~/stores/preferences'
import { useAuthStore } from '~/stores/auth'

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

    <WFGPTCreateRequestModal v-model="isCreateModalOpen" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(29.3% 64.65% at 54.55% 50%, #201D47 0%, #17153A 100%);
}

.obolochka-prilozheniia {
  width: 100%;
  max-width: 1280px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}

.rabochaia-oblast {
  flex: 1 1 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.verkhniaia-panel {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 24px 64px;
  justify-content: flex-start;
  align-items: center;
}

.workflow {
  flex: 1 1 0;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  outline: none;
  border-radius: 4px;
}

.workflow:focus-visible {
  box-shadow: 0 0 0 2px #635BFF;
}

.perekhody-razdelov {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 0;
  justify-content: flex-start;
  align-items: center;
}

.obzor,
.zaiavki {
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.header-actions {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
}

.notification-wrapper {
  position: relative;
  display: inline-flex;
}

.notifications-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 60;
  width: 280px;
  padding: 16px;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.popover-title {
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.popover-item {
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.avatar-link {
  padding: 4px;
}

.operator {
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.mobile-menu-btn {
  display: none;
}

.mobile-nav-drawer {
  align-self: stretch;
  margin: 0 16px;
  padding: 12px 16px;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main-slot {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1023px) {
  .obolochka-prilozheniia {
    max-width: 768px;
  }

  .verkhniaia-panel {
    padding: 24px 32px;
  }

  .operator {
    display: none;
  }
}

@media (max-width: 639px) {
  .obolochka-prilozheniia {
    max-width: 360px;
  }

  .verkhniaia-panel {
    padding: 24px 16px;
  }

  .perekhody-razdelov {
    display: none;
  }

  .mobile-menu-btn {
    display: inline-flex;
  }
}
</style>
