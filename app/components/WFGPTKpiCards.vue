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

<style scoped>
.pokazateli {
  align-self: stretch;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  padding: 0;
}

.kpi-card {
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

.kpi-title {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.kpi-value {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 40px;
}

.kpi-subtitle {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

@media (max-width: 639px) {
  .pokazateli {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kpi-value {
    font-size: 24px;
    line-height: 31px;
  }
}
</style>
