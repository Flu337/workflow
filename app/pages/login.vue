<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'public'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('0000@mail.demo')
const password = ref('••••••••••')
const errorMessage = ref('')
const isSubmitting = ref(false)
const showExpiredBanner = ref<boolean>(
  route.query.expired === '1' || authStore.expired
)

watch(
  () => route.query.expired,
  (val) => {
    showExpiredBanner.value = val === '1' || authStore.expired
  }
)

const isFormDisabled = computed(() => !email.value.trim() || !password.value.trim() || isSubmitting.value)

const handleLogin = async () => {
  errorMessage.value = ''
  if (!email.value.trim() || !email.value.includes('@')) {
    errorMessage.value = 'Укажите корректный адрес электронной почты'
    return
  }
  if (password.value.trim().length < 4) {
    errorMessage.value = 'Пароль должен содержать не менее 4 символов'
    return
  }

  isSubmitting.value = true
  try {
    const res = await authStore.login({
      email: email.value.trim(),
      password: password.value
    })
    showExpiredBanner.value = false
    if (res.user?.role === 'Client') {
      await router.push('/requests')
    } else {
      await router.push('/dashboard')
    }
  } catch (err) {
    errorMessage.value =
      (err as { data?: { message?: string }; message?: string })?.data?.message ||
      'Неверный логин или пароль'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="layer-1-02-vkhod">
    <header class="shapka">
      <NuxtLink to="/" class="workflow ui-nav-link-logo">
        WorkFlow
      </NuxtLink>
    </header>

    <div class="avtorizatsiia">
      <form class="forma-vkhoda" @submit.prevent="handleLogin">
        <p class="s-vozvrashcheniem">С возвращением</p>
        <p class="voidite-dlia-raboty-s-zaiavkami">Войдите для работы с заявками</p>

        <!-- плашка истекшей сессии из макета 1txt -->
        <div v-if="showExpiredBanner" class="soobshchenie-ob-izmenenii">
          <p class="sessiia-istekla-voidite-snova-chtoby">
            Сессия истекла. Войдите снова, чтобы продолжить работу.
          </p>
        </div>

        <div class="wf-gpt-field">
          <WFGPTField
            v-model="email"
            label23270="Электронная почта"
            value="0000@mail.demo"
            :state="errorMessage ? 'error' : 'default'"
            :error-text="errorMessage"
          />
        </div>

        <div class="wf-gpt-field-2">
          <WFGPTField
            v-model="password"
            label23270="Пароль"
            type="password"
            value="••••••••••"
          />
        </div>

        <div class="octagon-button">
          <OctagonButton
            type="submit"
            :state="isFormDisabled ? 'disabled' : 'default'"
            :disabled="isFormDisabled"
            label23251="Войти"
          />
        </div>

        <NuxtLink to="/register" class="net-akkaunta-zaregistrirovat-sia">
          Нет аккаунта? Зарегистрироваться
        </NuxtLink>
      </form>
    </div>
  </div>
</template>

<style scoped src="~/assets/css/pages/login.css"></style>
