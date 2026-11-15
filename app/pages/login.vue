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

<style scoped>
.layer-1-02-vkhod {
  position: relative;
  width: 100%;
  max-width: 1280px;
  min-height: 900px;
  display: flex;
  flex-direction: column;
  gap: 0px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
}

.shapka {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
}

.workflow {
  color: var(--color-text-inverse, #FFFFFF);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.avtorizatsiia {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 64px;
  justify-content: flex-start;
  align-items: center;
}

.forma-vkhoda {
  width: 440px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.s-vozvrashcheniem {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
}

.voidite-dlia-raboty-s-zaiavkami {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.soobshchenie-ob-izmenenii {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.sessiia-istekla-voidite-snova-chtoby {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.wf-gpt-field,
.wf-gpt-field-2 {
  align-self: stretch;
  width: 100%;
}

.octagon-button {
  align-self: flex-start;
}

.net-akkaunta-zaregistrirovat-sia {
  align-self: stretch;
  color: var(--color-text-accent, #79CEE8);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-decoration: none;
}

.net-akkaunta-zaregistrirovat-sia:hover {
  text-decoration: underline;
}

@media (max-width: 1023px) {
  .avtorizatsiia {
    padding: 64px 32px;
  }
}

@media (max-width: 639px) {
  .avtorizatsiia {
    padding: 64px 16px;
  }

  .forma-vkhoda {
    width: 100%;
  }

  .s-vozvrashcheniem {
    font-size: 24px;
    line-height: 31px;
  }

  .octagon-button,
  .octagon-button :deep(.octagon-btn) {
    align-self: stretch;
    width: 100%;
  }
}
</style>
