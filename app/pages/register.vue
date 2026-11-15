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

<style scoped>
.layer-4-01-registratsiia {
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

.sozdat-akkaunt {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
}

.zaregistriruites-chtoby-otpravliat {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.soobshchenie-ob-oshibke {
  align-self: stretch;
  width: 100%;
  padding: 12px 16px;
  border-radius: 4px;
  background: #38213D;
  border: 1px solid #DE5994;
}

.tekst-oshibki {
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.wf-gpt-field,
.wf-gpt-field-2,
.wf-gpt-field-3,
.wf-gpt-field-4 {
  align-self: stretch;
  width: 100%;
}

.octagon-button {
  align-self: flex-start;
}

.uzhe-est-akkaunt-voiti {
  align-self: stretch;
  color: var(--color-text-accent, #79CEE8);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-decoration: none;
}

.uzhe-est-akkaunt-voiti:hover {
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

  .sozdat-akkaunt {
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
