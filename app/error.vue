<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error?: NuxtError
}>()

const handleBackToRequests = () => {
  clearError({ redirect: '/requests' })
}
</script>

<template>
  <div class="layer-1-10-sistemnaia-oshibka-404">
    <div class="oshibka">
      <p class="layer-404">404</p>
      <p class="stranitsa-ne-naidena">Страница не найдена</p>
      <p class="prover-te-adres-ili-vernites-k-zaiavkam">
        Проверьте адрес или вернитесь к заявкам.
      </p>
      <OctagonButton
        label23251="Вернуться к заявкам"
        @click="handleBackToRequests"
      />
    </div>
  </div>
</template>

<style scoped>
.layer-1-10-sistemnaia-oshibka-404 {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0px;
  padding: 0px;
  justify-content: center;
  align-items: center;
  background: radial-gradient(29.3% 64.65% at 54.55% 50%, #201D47 0%, #17153A 100%);
}

.oshibka {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 64px;
  justify-content: flex-start;
  align-items: center;
}

.layer-404 {
  align-self: stretch;
  color: var(--color-text-accent, #79CEE8);
  font-family: "Montserrat", sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 40px;
  text-align: center;
}

.stranitsa-ne-naidena {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
  text-align: center;
}

.prover-te-adres-ili-vernites-k-zaiavkam {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
}

@media (max-width: 639px) {
  .oshibka {
    padding: 40px 16px;
  }

  .stranitsa-ne-naidena {
    font-size: 24px;
    line-height: 31px;
  }
}
</style>
