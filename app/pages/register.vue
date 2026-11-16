<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'public'
})

const authStore = useAuthStore()
const router = useRouter()

const name = ref('Мария Смирнова')
const company = ref('АО «Вектор»')
const email = ref('0000@mail.demo')
const password = ref('••••••••••')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  if (!name.value.trim() || !company.value.trim() || !email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Заполните все обязательные поля регистрации.'
    return
  }

  isSubmitting.value = true
  try {
    await authStore.register({
      name: name.value.trim(),
      company: company.value.trim(),
      email: email.value.trim(),
      password: password.value
    })
    await router.push('/requests')
  } catch (err) {
    errorMessage.value =
      (err as { data?: { message?: string }; message?: string })?.data?.message ||
      'Не удалось создать аккаунт. Проверьте введённые данные.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="layer-4-01-registratsiia">
    <div class="shapka">
      <NuxtLink to="/" class="workflow ui-nav-link-logo">
        WorkFlow
      </NuxtLink>
    </div>

    <div class="avtorizatsiia">
      <form class="forma-vkhoda" @submit.prevent="handleRegister">
        <p class="sozdat-akkaunt">Создать аккаунт</p>
        <p class="zaregistriruites-chtoby-otpravliat">
          Зарегистрируйтесь, чтобы отправлять заявки
        </p>

        <div v-if="errorMessage" class="soobshchenie-ob-oshibke">
          <p class="tekst-oshibki">{{ errorMessage }}</p>
        </div>

        <div class="wf-gpt-field">
          <WFGPTField
            v-model="name"
            label23270="Имя"
            value="Мария Смирнова"
          />
        </div>

        <div class="wf-gpt-field-2">
          <WFGPTField
            v-model="company"
            label23270="Компания"
            value="АО «Вектор»"
          />
        </div>

        <div class="wf-gpt-field-3">
          <WFGPTField
            v-model="email"
            label23270="Электронная почта"
            value="0000@mail.demo"
          />
        </div>

        <div class="wf-gpt-field-4">
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
            :state="isSubmitting ? 'disabled' : 'default'"
            :disabled="isSubmitting"
            label23251="Зарегистрироваться"
          />
        </div>

        <NuxtLink to="/login" class="uzhe-est-akkaunt-voiti">
          Уже есть аккаунт? Войти
        </NuxtLink>
      </form>
    </div>
  </div>
</template>

<style scoped src="~/assets/css/pages/register.css"></style>
