<script setup lang="ts">
import type { ListDensity } from '../../shared/types/workflow'
import { usePreferencesStore } from '~/stores/preferences'
import { useAuthStore } from '~/stores/auth'

const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()
const router = useRouter()

const name = ref(preferencesStore.name)
const email = ref(preferencesStore.email)
const density = ref<ListDensity>(preferencesStore.density)
const savedBanner = ref(false)

onMounted(() => {
  preferencesStore.initFromStorage()
  name.value = authStore.user?.name || preferencesStore.name
  email.value = authStore.user?.email || preferencesStore.email
  density.value = preferencesStore.density
})

watch(
  () => preferencesStore.density,
  (val) => {
    density.value = val
  }
)

const densityOptions = [
  { label: 'Комфортная', value: 'comfortable' },
  { label: 'Компактная', value: 'compact' }
]

const handleSaveProfile = () => {
  preferencesStore.updateProfile({
    name: name.value,
    email: email.value,
    density: density.value
  })
  name.value = preferencesStore.name
  email.value = preferencesStore.email
  savedBanner.value = true
  setTimeout(() => {
    savedBanner.value = false
  }, 2000)
}

const handleDensityChange = (val: string) => {
  const nextDensity: ListDensity = val === 'compact' ? 'compact' : 'comfortable'
  density.value = nextDensity
  preferencesStore.setDensity(nextDensity)
}

const handleLogout = async () => {
  await authStore.logout(false)
  await router.push('/login')
}
</script>

<template>
  <div class="soderzhanie">
    <p class="profil">Профиль</p>
    <p class="vashi-dannye-i-nastroiki-interfeisa">
      Ваши данные и настройки интерфейса
    </p>

    <div class="dannye-profilia">
      <OctagonAvatar :initials="authStore.user?.initials || preferencesStore.initials" />

      <div class="wf-gpt-field">
        <WFGPTField
          v-model="name"
          label23270="Имя"
          value="Анна Кузнецова"
        />
      </div>

      <div class="wf-gpt-field-2">
        <WFGPTField
          v-model="email"
          label23270="Электронная почта"
          value="0000@mail.demo"
        />
      </div>

      <p class="rol-operator">Роль: {{ (authStore.currentRoleLabel || 'оператор').toLowerCase() }}</p>

      <div class="octagon-button">
        <OctagonButton
          :label23251="savedBanner ? 'Изменения сохранены' : 'Сохранить изменения'"
          @click="handleSaveProfile"
        />
      </div>
    </div>

    <div class="nastroiki">
      <p class="nastroiki-interfeisa">Настройки интерфейса</p>
      <div class="wf-gpt-field-3">
        <WFGPTField
          v-model="density"
          label23270="Плотность списка"
          type="select"
          :options="densityOptions"
          :value="density === 'compact' ? 'Компактная  ▾' : 'Комфортная  ▾'"
          @change="handleDensityChange"
        />
      </div>
    </div>

    <div class="octagon-button-2">
      <OctagonButton
        variant="secondary"
        label23251="Выйти из аккаунта"
        @click="handleLogout"
      />
    </div>
  </div>
</template>

<style scoped>
.soderzhanie {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 64px;
  justify-content: flex-start;
  align-items: flex-start;
}

.profil {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
}

.vashi-dannye-i-nastroiki-interfeisa {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.dannye-profilia,
.nastroiki {
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

.wf-gpt-field,
.wf-gpt-field-2,
.wf-gpt-field-3 {
  width: 360px;
  max-width: 100%;
}

.rol-operator {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.nastroiki-interfeisa {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.octagon-button,
.octagon-button-2 {
  align-self: flex-start;
}

@media (max-width: 1023px) {
  .soderzhanie {
    padding: 24px 32px;
  }
}

@media (max-width: 639px) {
  .soderzhanie {
    padding: 24px 16px;
  }

  .profil {
    font-size: 24px;
    line-height: 31px;
  }

  .wf-gpt-field,
  .wf-gpt-field-2,
  .wf-gpt-field-3 {
    align-self: stretch;
    width: 100%;
  }

  .octagon-button,
  .octagon-button :deep(.octagon-btn),
  .octagon-button-2,
  .octagon-button-2 :deep(.octagon-btn) {
    align-self: stretch;
    width: 100%;
  }
}
</style>
