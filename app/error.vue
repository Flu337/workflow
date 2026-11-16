<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error?: NuxtError
}>()

const statusCode = computed(() => {
  return props.error?.statusCode === 403 ? 403 : 404
})

const errorHeading = computed(() => {
  return statusCode.value === 403 ? 'Нет доступа' : 'Страница не найдена'
})

const errorDescription = computed(() => {
  return statusCode.value === 403
    ? 'Эта страница недоступна вашей роли.'
    : 'Такой страницы нет или она была перемещена.'
})

const handleReturn = () => {
  clearError({ redirect: '/requests' })
}
</script>

<template>
  <div class="error-page-wrapper">
    <div class="layer-1-12-sistemnaia-oshibka">
      <div class="oshibka">
        <p class="layer-404">{{ statusCode }}</p>
        <p class="stranitsa-ne-naidena">{{ errorHeading }}</p>
        <p class="takoi-stranitsy-net-ili-ona-byla">
          {{ errorDescription }}
        </p>
        <div class="octagon-button">
          <OctagonButton
            label23251="Вернуться к заявкам"
            @click="handleReturn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="~/assets/css/error.css"></style>
