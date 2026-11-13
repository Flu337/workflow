<script setup lang="ts">
import type { ListViewState } from '~/utils/types'

const {
  searchQuery,
  statusFilter,
  priorityFilter,
  assigneeFilter,
  sortOrder,
  currentPage,
  pageSize,
  viewState,
  userProfile,
  isCreateModalOpen,
  paginatedRequests,
  totalFiltered,
  totalPages,
  simulateRetryLoad
} = useRequests()

const statusOptions = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Новая', value: 'new' },
  { label: 'Назначена', value: 'assigned' },
  { label: 'В работе', value: 'in-progress' },
  { label: 'Ожидание', value: 'waiting' },
  { label: 'Эскалирована', value: 'escalated' },
  { label: 'Решена', value: 'resolved' },
  { label: 'Закрыта', value: 'closed' }
]

const priorityOptions = [
  { label: 'Все приоритеты', value: 'all' },
  { label: 'Критический', value: 'critical' },
  { label: 'Высокий', value: 'high' },
  { label: 'Обычный', value: 'normal' },
  { label: 'Низкий', value: 'low' }
]

const assigneeOptions = [
  { label: 'Все заявки', value: 'all' },
  { label: 'Не назначен', value: 'unassigned' },
  { label: 'Брунгильда Б.', value: 'Брунгильда Б.' },
  { label: 'Олег С.', value: 'Олег С.' }
]

const sortOptions = [
  { label: 'Сначала новые', value: 'newest' },
  { label: 'Сначала старые', value: 'oldest' },
  { label: 'По приоритету', value: 'priority' }
]

watch([searchQuery, statusFilter, priorityFilter, assigneeFilter, sortOrder], () => {
  currentPage.value = 1
})

// определение активного состояния списка
const effectiveState = computed<ListViewState>(() => {
  if (viewState.value !== 'ready') {
    return viewState.value
  }
  if (totalFiltered.value === 0) {
    return 'empty'
  }
  return 'ready'
})

const paginationLabel = computed(() => {
  if (totalFiltered.value === 0) return 'Показано 0 из 0'
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, totalFiltered.value)
  return `Показано ${start}–${end} из ${totalFiltered.value}`
})

const setPage = (p: number) => {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
  }
}

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const setDemoState = (state: ListViewState) => {
  viewState.value = state
}
</script>

<template>
  <div class="soderzhanie">
    <template v-if="viewState === 'ready'">
      <p class="rabochii-den-pod-kontrolem">Рабочий день под контролем</p>
      <p class="zaiavki-kotorye-trebuiut-vashego">
        Заявки, которые требуют вашего внимания
      </p>

      <WFGPTKpiCards />

      <div class="zaiavki-zagolovok-i-fil-tr">
        <p class="zaiavki-2">Заявки</p>
      </div>
    </template>

    <template v-else>
      <p class="zaiavki-state-heading">Заявки</p>
      <p class="vse-obrashcheniia-v-odnom-meste">Все обращения в одном месте</p>
    </template>

    <div class="actions-and-demo-bar">
      <div class="octagon-button">
        <OctagonButton
          label23251="Создать заявку"
          @click="openCreateModal"
        />
      </div>

      <!-- переключатель состояний списка по тз -->
      <div class="demo-state-switcher" role="group" aria-label="Демонстрация состояний списка">
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': viewState === 'ready' }"
          @click="setDemoState('ready')"
        >
          Список
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': viewState === 'loading' }"
          @click="setDemoState('loading')"
        >
          Загрузка
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': viewState === 'empty' }"
          @click="setDemoState('empty')"
        >
          Пустой список
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': viewState === 'error' }"
          @click="setDemoState('error')"
        >
          Ошибка
        </button>
      </div>
    </div>

    <div class="fil-try" :class="{ 'is-state-compact': viewState !== 'ready' }">
      <div class="wf-gpt-field search-field">
        <WFGPTField
          v-model="searchQuery"
          label23270="Поиск"
          placeholder="Номер или название заявки"
          value="Номер или название заявки"
        />
      </div>

      <div class="wf-gpt-field-2 filter-field">
        <WFGPTField
          v-model="statusFilter"
          label23270="Статус"
          type="select"
          :options="statusOptions"
          value="Все статусы  ▾"
        />
      </div>

      <div class="wf-gpt-field-3 filter-field">
        <WFGPTField
          v-model="priorityFilter"
          label23270="Приоритет"
          type="select"
          :options="priorityOptions"
          value="Все приоритеты  ▾"
        />
      </div>

      <div v-if="viewState === 'ready'" class="fil-tr-naznachenie filter-field">
        <WFGPTField
          v-model="assigneeFilter"
          label23270="Назначение"
          type="select"
          :options="assigneeOptions"
          value="Все заявки  ▾"
        />
      </div>

      <div v-if="viewState === 'ready'" class="sortirovka-zaiavok filter-field">
        <WFGPTField
          v-model="sortOrder"
          label23270="Сортировка"
          type="select"
          :options="sortOptions"
          value="Сначала новые  ▾"
        />
      </div>
    </div>

    <div v-if="effectiveState === 'loading'" class="sostoianie-spiska">
      <p class="zagruzhaem-zaiavki">Загружаем заявки…</p>
      <div v-for="n in 6" :key="n" class="skeleton-row">
        <p class="skeleton-text">—          —                              —</p>
      </div>
    </div>

    <div v-else-if="effectiveState === 'empty'" class="sostoianie-spiska">
      <OctagonIconInboxEmpty />
      <p class="zaiavok-poka-net">Заявок пока нет</p>
      <p class="obrashcheniia-poiaviatsia-zdes-posle">
        Обращения появятся здесь после создания.
      </p>
      <OctagonButton
        label23251="Создать заявку"
        @click="openCreateModal"
      />
    </div>

    <div v-else-if="effectiveState === 'error'" class="sostoianie-spiska">
      <OctagonIconAlert />
      <p class="ne-udalos-zagruzit-zaiavki">Не удалось загрузить заявки</p>
      <p class="servis-vremenno-nedostupen-poprobuite">
        Сервис временно недоступен. Попробуйте ещё раз.
      </p>
      <OctagonButton
        label23251="Повторить загрузку"
        @click="simulateRetryLoad"
      />
    </div>

    <template v-else>
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
          v-for="req in paginatedRequests"
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

      <div class="paginatsiia">
        <p class="pokazano-1-12-iz-24">{{ paginationLabel }}</p>
        <OctagonButton
          variant="secondary"
          :state="currentPage <= 1 ? 'disabled' : 'default'"
          :disabled="currentPage <= 1"
          label23251="Назад"
          @click="setPage(currentPage - 1)"
        />
        <OctagonButton
          v-for="p in totalPages"
          :key="p"
          :variant="currentPage === p ? 'secondary' : 'ghost'"
          :label23251="String(p)"
          @click="setPage(p)"
        />
        <OctagonButton
          variant="secondary"
          :state="currentPage >= totalPages ? 'disabled' : 'default'"
          :disabled="currentPage >= totalPages"
          label23251="Далее"
          @click="setPage(currentPage + 1)"
        />
      </div>
    </template>
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

.rabochii-den-pod-kontrolem,
.zaiavki-state-heading {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
}

.zaiavki-kotorye-trebuiut-vashego,
.vse-obrashcheniia-v-odnom-meste {
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

.zaiavki-2 {
  flex: 1 1 0;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.actions-and-demo-bar {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.demo-state-switcher {
  display: flex;
  flex-direction: row;
  gap: 6px;
  padding: 4px;
  border-radius: 6px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
  flex-wrap: wrap;
}

.demo-state-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.demo-state-btn:hover {
  background: var(--color-bg-subtle, #2F2A6A);
  color: var(--color-text-primary, #E8E7EC);
}

.demo-state-btn:focus-visible {
  border-color: #635BFF;
  color: var(--color-text-primary, #E8E7EC);
}

.demo-state-btn.is-active {
  background: var(--color-bg-subtle, #2F2A6A);
  border-color: var(--color-border-strong, #615B94);
  color: var(--color-text-accent, #79CEE8);
  font-weight: 600;
}

.fil-try {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
}

.search-field {
  flex: 1 1 0;
  min-width: 220px;
}

.filter-field {
  width: 185px;
  flex-shrink: 0;
}

.sostoianie-spiska {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px 24px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.zagruzhaem-zaiavki {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
}

.skeleton-row {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 16px;
  justify-content: flex-start;
  align-items: flex-start;
  background: var(--color-bg-subtle, #2F2A6A);
  border-radius: 2px;
}

.skeleton-text {
  color: var(--color-text-disabled, #8E88A8);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
}

.zaiavok-poka-net,
.ne-udalos-zagruzit-zaiavki {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
}

.obrashcheniia-poiaviatsia-zdes-posle,
.servis-vremenno-nedostupen-poprobuite {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
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

.paginatsiia {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0px;
  justify-content: flex-start;
  align-items: center;
}

.pokazano-1-12-iz-24 {
  flex: 1 1 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

@media (max-width: 1023px) {
  .soderzhanie {
    padding: 24px 32px;
  }

  .fil-try {
    flex-wrap: wrap;
  }

  .search-field {
    width: calc(50% - 6px);
    flex: 1 1 calc(50% - 6px);
  }

  .filter-field {
    width: calc(50% - 6px);
    flex: 1 1 calc(50% - 6px);
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

  .rabochii-den-pod-kontrolem,
  .zaiavki-state-heading {
    font-size: 24px;
    line-height: 31px;
  }

  .actions-and-demo-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .octagon-button,
  .octagon-button :deep(.octagon-btn) {
    align-self: stretch;
    width: 100%;
  }

  .fil-try {
    flex-direction: column;
  }

  .search-field,
  .filter-field {
    width: 100%;
    flex: 1 1 auto;
  }

  .zagolovki-tablitsy {
    display: none;
  }

  .paginatsiia {
    flex-wrap: wrap;
  }

  .pokazano-1-12-iz-24 {
    width: 100%;
    flex: 0 0 100%;
  }

  .sostoianie-spiska {
    padding: 32px 16px;
  }

  .skeleton-text {
    white-space: nowrap;
  }
}
</style>
