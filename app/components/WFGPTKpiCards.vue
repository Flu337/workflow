<script setup lang="ts">
export interface KpiCardItem {
  title: string
  value: string | number
  subtitle: string
}

withDefaults(
  defineProps<{
    items?: KpiCardItem[]
  }>(),
  {
    items: () => [
      { title: 'Новые заявки', value: 6, subtitle: 'Ожидают назначения' },
      { title: 'В работе', value: 4, subtitle: 'Назначены исполнителям' },
      { title: 'Ожидают ответа', value: 4, subtitle: 'Нужна информация' },
      { title: 'Решены', value: 2, subtitle: 'За эту неделю' }
    ]
  }
)
</script>

<template>
  <div class="pokazateli">
    <div v-for="(item, index) in items" :key="index" class="kpi-card">
      <p class="kpi-title">{{ item.title }}</p>
      <p class="kpi-value">{{ item.value }}</p>
      <p class="kpi-subtitle">{{ item.subtitle }}</p>
    </div>
  </div>
</template>

<style scoped src="~/assets/css/components/WFGPTKpiCards.css"></style>
