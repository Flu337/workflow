<script setup lang="ts">
definePageMeta({
  layout: 'public'
})

const router = useRouter()

const email = ref('0000@mail.demo')
const password = ref('••••••••••')
const errorMessage = ref('')

const handleLogin = () => {
  if (!email.value.includes('@')) {
    errorMessage.value = 'Введите корректный адрес электронной почты.'
    return
  }
  errorMessage.value = ''
  router.push('/dashboard')
}
</script>

<template>
  <div class="layer-1-02-vkhod">
    <header class="shapka">
      <NuxtLink to="/" class="workflow">WorkFlow</NuxtLink>
    </header>

    <div class="avtorizatsiia">
      <form class="forma-vkhoda" @submit.prevent="handleLogin">
        <p class="s-vozvrashcheniem">С возвращением</p>
        <p class="voidite-dlia-raboty-s-zaiavkami">Войдите для работы с заявками</p>

        <div class="wf-gpt-field">
          <WFGPTField
            v-model="email"
            label23270="Электронная почта"
            value="0000@mail.demo"
            :state="errorMessage ? 'error' : 'default'"
            :error-message="errorMessage"
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
            label23251="Войти"
          />
        </div>

        <NuxtLink to="/dashboard" class="net-akkaunta-zaregistrirovat-sia">
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
  background: radial-gradient(29.3% 64.65% at 54.55% 50%, #201D47 0%, #17153A 100%);
}

.shapka {
  width: 154px;
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
  outline: none;
  border-radius: 4px;
}

.net-akkaunta-zaregistrirovat-sia:hover {
  color: #8F85FF;
}

.net-akkaunta-zaregistrirovat-sia:focus-visible {
  box-shadow: 0 0 0 2px #635BFF;
}

@media (max-width: 1023px) {
  .layer-1-02-vkhod {
    max-width: 768px;
    min-height: 1024px;
    background: radial-gradient(55.56% 34.09% at 54.55% 50%, #201D47 0%, #17153A 100%);
  }

  .avtorizatsiia {
    padding: 64px 32px;
  }
}

@media (max-width: 639px) {
  .layer-1-02-vkhod {
    max-width: 360px;
    min-height: 780px;
    background: radial-gradient(90.28% 20.98% at 54.55% 50%, #201D47 0%, #17153A 100%);
  }

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
