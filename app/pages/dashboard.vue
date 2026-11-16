<script setup lang="ts">
import type { RequestsListResponseDto } from '~/types/workflow'
import { normalizeRequestsListResponse } from '~/utils/normalizeRequests'
import { usePreferencesStore } from '~/stores/preferences'
import { useRequestUiStore } from '~/stores/requestUi'

const preferencesStore = usePreferencesStore()
const requestUiStore = useRequestUiStore()
const router = useRouter()

const { data: rawDashboardResponse } = await useFetch<RequestsListResponseDto>('/api/requests', {
  key: 'wf-dashboard-latest',
  query: {
    page: 1,
    limit: 3,
    sort: 'newest'
  }
})

const normalizedDashboard = computed(() =>
  normalizeRequestsListResponse(rawDashboardResponse.value)
)

const latestRequests = computed(() =>
  normalizedDashboard.value.items.map(item => requestUiStore.applyOverridesToRequest(item))
)

const kpiItems = computed(() => [
  {
    title: 'Новые заявки',
    value: normalizedDashboard.value.metrics.newCount,
    subtitle: 'Ожидают назначения'
  },
  {
    title: 'В работе',
    value: normalizedDashboard.value.metrics.inProgressCount,
    subtitle: 'Назначены исполнителям'
  },
  {
    title: 'Ожидают ответа',
    value: normalizedDashboard.value.metrics.waitingCount,
    subtitle: 'Нужна информация'
  },
  {
    title: 'Решены',
    value: normalizedDashboard.value.metrics.resolvedCount,
    subtitle: 'За эту неделю'
  }
])

const goToAllRequests = () => {
  router.push('/requests')
}
</script>

<template>
  <div class="soderzhanie">
    <p class="obzor-2">Обзор</p>
    <p class="obzor-raboty-podderzhki">Обзор работы поддержки</p>

    <!-- плашка компактной плотности списка из макета 10txt -->
    <div v-if="preferencesStore.isCompact" class="soobshchenie-ob-izmenenii">
      <p class="plotnost-spiska-kompaktnaia">Плотность списка: компактная</p>
    </div>

    <WFGPTKpiCards :items="kpiItems" />

    <div class="zaiavki-zagolovok-i-fil-tr">
      <p class="poslednie-zaiavki">Последние заявки</p>
    </div>

    <div class="octagon-button">
      <OctagonButton
        label23251="Все заявки"
        @click="goToAllRequests"
      />
    </div>

    <div class="spisok-zaiavok">
      <div class="zagolovki-tablitsy">
        <p class="nomer">Номер</p>
        <p class="zaiavka">Заявка</p>
        <p class="klient">Клиент</p>
        <p class="ispolnitel">Исполнитель</p>
        <p class="status">Статус</p>
        <p class="prioritet">Приоритет</p>
      </div>

      <div
        v-for="req in latestRequests"
        :key="req.id"
        class="wf-gpt-request-row"
      >
        <WFGPTRequestRow
          :id="req.code"
          :title="req.title"
          :customer="req.customer"
          :assignee="req.assignee"
          :status="req.status"
          :priority="req.priority"
          :compact="preferencesStore.isCompact"
        />
      </div>
    </div>
  </div>
</template>

<style scoped src="~/assets/css/pages/dashboard.css"></style>
