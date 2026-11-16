<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const isMobileNavOpen = ref(false)

const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value
}

const closeMobileNav = () => {
  isMobileNavOpen.value = false
}

const goToLogin = () => {
  closeMobileNav()
  router.push('/login')
}

watch(
  () => route.fullPath,
  () => {
    closeMobileNav()
  }
)
</script>

<template>
  <header class="publichnaia-navigatsiia">
    <NuxtLink to="/" class="workflow ui-nav-link-logo">
      WorkFlow
    </NuxtLink>

    <nav class="public-nav-links" aria-label="Публичная навигация">
      <NuxtLink
        to="/"
        class="glavnaia ui-nav-link"
        :class="{ 'is-active': route.path === '/' }"
      >
        Главная
      </NuxtLink>
      <NuxtLink
        to="/articles"
        class="stat-i ui-nav-link"
        :class="{ 'is-active': route.path.startsWith('/articles') }"
      >
        Статьи
      </NuxtLink>
      <NuxtLink
        to="/help"
        class="pomoshch ui-nav-link"
        :class="{ 'is-active': route.path === '/help' }"
      >
        Помощь
      </NuxtLink>
      <NuxtLink
        to="/faq"
        class="faq ui-nav-link"
        :class="{ 'is-active': route.path === '/faq' }"
      >
        FAQ
      </NuxtLink>
    </nav>

    <OctagonButton
      variant="secondary"
      label23251="Войти"
      @click="goToLogin"
    />

    <button
      type="button"
      class="public-mobile-menu-btn ui-icon-btn"
      aria-label="Открыть меню"
      :aria-expanded="isMobileNavOpen"
      @click="toggleMobileNav"
    >
      <OctagonIconMenu />
    </button>

    <nav
      v-if="isMobileNavOpen"
      class="public-mobile-drawer"
      aria-label="Мобильная публичная навигация"
    >
      <NuxtLink to="/" class="ui-nav-link" @click="closeMobileNav">
        Главная
      </NuxtLink>
      <NuxtLink to="/articles" class="ui-nav-link" @click="closeMobileNav">
        Статьи
      </NuxtLink>
      <NuxtLink to="/help" class="ui-nav-link" @click="closeMobileNav">
        Помощь
      </NuxtLink>
      <NuxtLink to="/faq" class="ui-nav-link" @click="closeMobileNav">
        FAQ
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped src="~/assets/css/components/WFGPTPublicNav.css"></style>
