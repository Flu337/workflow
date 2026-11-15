<script setup lang="ts">
import type { RequestsListResponseDto } from '~/types/workflow'
import { normalizeRequestsListResponse } from '~/utils/normalizeRequests'

const { userProfile } = useRequests()
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

const latestRequests = computed(() => normalizedDashboard.value.items)

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
          :compact="userProfile.density === 'compact'"
        />
      </div>
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

.obzor-2 {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
}

.obzor-raboty-podderzhki {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.zaiavki-zagolovok-i-fil-tr {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0px;
  justify-content: flex-start;
  align-items: center;
}

.poslednie-zaiavki {
  flex: 1 1 0;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.octagon-button {
  align-self: flex-start;
}

.spisok-zaiavok {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
  overflow: hidden;
}

.zagolovki-tablitsy {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 16px;
  justify-content: flex-start;
  align-items: flex-start;
  background: var(--color-bg-subtle, #2F2A6A);
}

.nomer {
  width: 62px;
  flex-shrink: 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.zaiavka {
  flex: 1 1 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.klient {
  width: 140px;
  flex-shrink: 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.ispolnitel {
  width: 110px;
  flex-shrink: 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.status {
  width: 120px;
  flex-shrink: 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.prioritet {
  width: 130px;
  flex-shrink: 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.wf-gpt-request-row {
  align-self: stretch;
  width: 100%;
}

@media (max-width: 1023px) {
  .soderzhanie {
    padding: 24px 32px;
  }

  .klient,
  .ispolnitel {
    display: none;
  }
}

@media (max-width: 639px) {
  .soderzhanie {
    padding: 24px 16px;
  }

  .obzor-2 {
    font-size: 24px;
    line-height: 31px;
  }

  .octagon-button,
  .octagon-button :deep(.octagon-btn) {
    align-self: stretch;
    width: 100%;
  }

  .zagolovki-tablitsy {
    display: none;
  }
}
</style>
