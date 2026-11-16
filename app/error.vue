<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error?: NuxtError
}>()

const route = useRoute()

const statusCode = computed(() => {
  return props.error?.statusCode === 403 ? 403 : 404
})

const isArticle404 = computed(() => {
  if (statusCode.value !== 404) return false
  const errData = props.error?.data as { entity?: string } | undefined
  return (
    errData?.entity === 'article' ||
    props.error?.statusMessage === 'Статья не найдена' ||
    route.path.startsWith('/articles')
  )
})

const errorHeading = computed(() => {
  if (statusCode.value === 403) return 'Нет доступа'
  if (isArticle404.value) return 'Статья не найдена'
  return 'Страница не найдена'
})

const errorDescription = computed(() => {
  if (statusCode.value === 403) {
    return 'Эта страница недоступна вашей роли.'
  }
  if (isArticle404.value) {
    return 'Возможно, статья удалена или её адрес изменился.'
  }
  return 'Такой страницы нет или она была перемещена.'
})

const buttonLabel = computed(() => {
  return isArticle404.value ? 'К списку статей' : 'Вернуться к заявкам'
})

const handleReturn = () => {
  clearError({
    redirect: isArticle404.value ? '/articles' : '/requests'
  })
}
</script>

<template>
  <div class="error-page-wrapper">
    <div class="layer-1-12-sistemnaia-oshibka">
      <div v-if="isArticle404" class="error-public-header-wrap">
        <WFGPTPublicNav />
      </div>

      <div class="oshibka">
        <p class="layer-404">{{ statusCode }}</p>
        <p class="stranitsa-ne-naidena">{{ errorHeading }}</p>
        <p class="takoi-stranitsy-net-ili-ona-byla">
          {{ errorDescription }}
        </p>
        <div class="octagon-button">
          <OctagonButton
            :label23251="buttonLabel"
            @click="handleReturn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="~/assets/css/error.css"></style>
