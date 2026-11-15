<script setup lang="ts">
import type {
  ListViewState,
  RequestsListResponseDto,
  UserDirectoryItemDto,
  CustomerDirectoryItemDto,
  CategoryDirectoryItemDto
} from '~/types/workflow'
import { normalizeRequestsListResponse } from '~/utils/normalizeRequests'
import { useDebounce } from '~/composables/useDebounce'
import { usePreferencesStore } from '~/stores/preferences'
import { useRequestUiStore } from '~/stores/requestUi'

const route = useRoute()
const router = useRouter()
const preferencesStore = usePreferencesStore()
const requestUiStore = useRequestUiStore()

const {
  searchQuery,
  statusFilter,
  priorityFilter,
  assigneeFilter,
  sortOrder,
  currentPage,
  simulateError,
  pageSize,
  viewState,
  isCreateModalOpen,
  hasActiveFilters,
  initFiltersFromRoute,
  buildRouteQuery,
  resetSearch,
  resetFilters
} = useRequests()

// восстановление состояния фильтров из query при открытии ссылки
initFiltersFromRoute(route.query as Record<string, string | (string | null)[] | null | undefined>)

const debouncedSearch = useDebounce(searchQuery, 300)

// загрузка справочников через usefetch
const { data: usersDirectory } = await useFetch<UserDirectoryItemDto[]>('/api/users', {
  key: 'wf-users-directory',
  default: () => []
})

await useFetch<CustomerDirectoryItemDto[]>('/api/customers', {
  key: 'wf-customers-directory',
  default: () => []
})

await useFetch<CategoryDirectoryItemDto[]>('/api/categories', {
  key: 'wf-categories-directory',
  default: () => []
})

// реактивный запрос списка заявок с параметрами фильтрации и пагинации
const apiQuery = computed(() => ({
  search: debouncedSearch.value.trim() || undefined,
  status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
  priority: priorityFilter.value !== 'all' ? priorityFilter.value : undefined,
  assignee: assigneeFilter.value !== 'all' ? assigneeFilter.value : undefined,
  sort: sortOrder.value,
  page: currentPage.value,
  limit: pageSize,
  simulateError: simulateError.value || undefined
}))

const {
  data: rawRequestsResponse,
  status: fetchStatus,
  error: fetchError,
  refresh: refreshRequests
} = await useFetch<RequestsListResponseDto>('/api/requests', {
  key: 'wf-requests-list',
  query: apiQuery,
  watch: [apiQuery]
})

// единая нормализация ответа списка заявок и наложение оптимистичных обновлений из pinia
const normalizedList = computed(() => normalizeRequestsListResponse(rawRequestsResponse.value))

const displayedRequests = computed(() =>
  normalizedList.value.items.map(item => requestUiStore.applyOverridesToRequest(item))
)
const totalFiltered = computed(() => normalizedList.value.total)
const totalPages = computed(() => normalizedList.value.totalPages)
const hasIncompleteData = computed(() => normalizedList.value.hasIncompleteData)

const kpiItems = computed(() => [
  {
    title: 'Новые заявки',
    value: normalizedList.value.metrics.newCount,
    subtitle: 'Ожидают назначения'
  },
  {
    title: 'В работе',
    value: normalizedList.value.metrics.inProgressCount,
    subtitle: 'Назначены исполнителям'
  },
  {
    title: 'Ожидают ответа',
    value: normalizedList.value.metrics.waitingCount,
    subtitle: 'Нужна информация'
  },
  {
    title: 'Решены',
    value: normalizedList.value.metrics.resolvedCount,
    subtitle: 'За эту неделю'
  }
])

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

const assigneeOptions = computed(() => {
  const base = [
    { label: 'Все заявки', value: 'all' },
    { label: 'Не назначен', value: 'unassigned' }
  ]
  const fromUsers = (usersDirectory.value || [])
    .filter(u => u.role !== 'Оператор')
    .map(u => ({
      label: u.shortName,
      value: u.shortName
    }))

  if (fromUsers.length === 0) {
    return [
      ...base,
      { label: 'Брунгильда Б.', value: 'Брунгильда Б.' },
      { label: 'Олег С.', value: 'Олег С.' }
    ]
  }
  return [...base, ...fromUsers]
})

const sortOptions = [
  { label: 'Сначала новые', value: 'newest' },
  { label: 'Сначала старые', value: 'oldest' },
  { label: 'По приоритету', value: 'priority' }
]

watch([debouncedSearch, statusFilter, priorityFilter, assigneeFilter, sortOrder], () => {
  currentPage.value = 1
})

// синхронизация состояния фильтров и пагинации с параметрами адресной строки
watch(
  [debouncedSearch, statusFilter, priorityFilter, assigneeFilter, sortOrder, currentPage, simulateError],
  () => {
    const nextQuery = buildRouteQuery(debouncedSearch.value)
    router.replace({ query: nextQuery })
  }
)

watch(
  () => route.query,
  (newQuery) => {
    initFiltersFromRoute(newQuery as Record<string, string | (string | null)[] | null | undefined>)
  }
)

const effectiveState = computed<ListViewState>(() => {
  if (viewState.value !== 'ready') {
    return viewState.value
  }
  if (fetchError.value) {
    return 'error'
  }
  if (fetchStatus.value === 'pending' && !rawRequestsResponse.value) {
    return 'loading'
  }
  if (totalFiltered.value === 0) {
    return hasActiveFilters.value ? 'no-results' : 'empty'
  }
  return 'ready'
})

const isMutationBannerView = computed<boolean>(() => {
  return Boolean(requestUiStore.rollbackError || requestUiStore.feedbackBanner)
})

const errorStatusCode = computed<number | null>(() => {
  const err = fetchError.value as { statusCode?: number; status?: number } | null
  if (err?.statusCode) return err.statusCode
  if (err?.status) return err.status
  if (simulateError.value === '429') return 429
  if (simulateError.value === '500') return 500
  return null
})

const errorSubtitleText = computed<string>(() => {
  if (errorStatusCode.value === 429) {
    return 'Слишком много запросов (HTTP 429). Подождите немного и попробуйте ещё раз.'
  }
  return 'Сервис временно недоступен. Попробуйте ещё раз.'
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

const setDemoState = async (state: ListViewState, errCode = '') => {
  requestUiStore.clearBanners()
  simulateError.value = errCode
  viewState.value = state
  if (state === 'ready' || errCode) {
    await refreshRequests()
  }
}

// демонстрация баннера успешного изменения приоритета и кнопки отмены из макета 4txt
const triggerDemoPriorityUndo = async () => {
  simulateError.value = ''
  viewState.value = 'ready'
  const firstReq = displayedRequests.value[0]
  if (!firstReq) return
  await requestUiStore.changePriorityOptimistic(firstReq, 'high', preferencesStore.name)
  await refreshRequests()
}

// демонстрация конфликта 409 и отката к предыдущему значению из макета 5txt
const triggerDemoConflictRollback = async () => {
  simulateError.value = ''
  viewState.value = 'ready'
  const firstReq = displayedRequests.value[0]
  if (!firstReq) return
  await requestUiStore.changePriorityOptimistic(firstReq, 'critical', preferencesStore.name, '409')
}

const toggleCompactDensityDemo = () => {
  preferencesStore.setDensity(preferencesStore.isCompact ? 'comfortable' : 'compact')
}

const handleUndoFromList = async () => {
  await requestUiStore.undoLastChange(preferencesStore.name)
  await refreshRequests()
}

const handleRefreshAfterConflict = async () => {
  requestUiStore.clearBanners()
  await refreshRequests()
}

const handleRetryLoad = async () => {
  simulateError.value = ''
  viewState.value = 'ready'
  await refreshRequests()
}

const handleResetSearch = () => {
  resetSearch()
}

const handleResetAllFilters = () => {
  resetFilters()
}
</script>

<template>
  <div class="soderzhanie">
    <!-- при отображении баннера изменения или конфликта заголовок перестраивается как в макетах 4txt и 5txt -->
    <template v-if="effectiveState === 'ready' && !isMutationBannerView">
      <p class="rabochii-den-pod-kontrolem">Рабочий день под контролем</p>
      <p class="zaiavki-kotorye-trebuiut-vashego">
        Заявки, которые требуют вашего внимания
      </p>

      <!-- плашка компактного представления списка из макета 10txt -->
      <div v-if="preferencesStore.isCompact" class="soobshchenie-ob-izmenenii">
        <p class="plotnost-spiska-kompaktnaia">Плотность списка: компактная</p>
      </div>

      <!-- баннер результатов активного поиска из макета 202 -->
      <div v-if="debouncedSearch.trim()" class="soobshchenie-ob-izmenenii">
        <p class="po-zaprosu-crm-naideno-1">
          По запросу «{{ debouncedSearch.trim() }}» найдено: {{ totalFiltered }}
        </p>
        <OctagonButton
          variant="secondary"
          label23251="Сбросить поиск"
          @click="handleResetSearch"
        />
      </div>

      <!-- предупреждающая плашка при неполных данных из макета 206 -->
      <div v-if="hasIncompleteData" class="soobshchenie-ob-izmenenii">
        <p class="chast-dannykh-zaiavki-nedostupna-ostal">
          Часть данных заявки недоступна. Остальные обращения отображаются.
        </p>
      </div>

      <WFGPTKpiCards :items="kpiItems" />

      <div class="zaiavki-zagolovok-i-fil-tr">
        <p class="zaiavki-2">Заявки</p>
      </div>
    </template>

    <template v-else>
      <p class="zaiavki-state-heading">Заявки</p>
      <p class="vse-obrashcheniia-v-odnom-meste">Все обращения в одном месте</p>

      <!-- плашка конфликта 409 500 и отката изменения из макета 5txt -->
      <div v-if="requestUiStore.rollbackError" class="soobshchenie-ob-izmenenii">
        <p class="izmenenie-ne-sokhraneno">{{ requestUiStore.rollbackError.title }}</p>
        <p class="zaiavka-byla-izmenena-drugim">
          {{ requestUiStore.rollbackError.description }}
        </p>
        <OctagonButton
          variant="secondary"
          label23251="Обновить заявку"
          @click="handleRefreshAfterConflict"
        />
      </div>

      <!-- плашка успешного изменения и кнопки отмены undo из макета 4txt -->
      <div v-else-if="requestUiStore.feedbackBanner" class="soobshchenie-ob-izmenenii">
        <p class="prioritet-izmenion-na-vysokii">
          {{ requestUiStore.feedbackBanner.message }}
        </p>
        <OctagonButton
          v-if="requestUiStore.feedbackBanner.canUndo && requestUiStore.lastUndoAction"
          variant="secondary"
          label23251="Отменить изменение"
          @click="handleUndoFromList"
        />
      </div>
    </template>

    <div class="actions-and-demo-bar">
      <div class="octagon-button">
        <OctagonButton
          label23251="Создать заявку"
          @click="openCreateModal"
        />
      </div>

      <!-- переключатель состояний списка и сценариев 2 и 3 этапов -->
      <div class="demo-state-switcher" role="group" aria-label="Демонстрация состояний списка">
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': effectiveState === 'ready' && !simulateError && !isMutationBannerView }"
          @click="setDemoState('ready', '')"
        >
          Список
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': Boolean(requestUiStore.feedbackBanner) }"
          @click="triggerDemoPriorityUndo"
        >
          Успех и Undo
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': Boolean(requestUiStore.rollbackError) }"
          @click="triggerDemoConflictRollback"
        >
          Конфликт 409
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': preferencesStore.isCompact }"
          @click="toggleCompactDensityDemo"
        >
          Компактно
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': effectiveState === 'loading' }"
          @click="setDemoState('loading', '')"
        >
          Загрузка
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': effectiveState === 'empty' }"
          @click="setDemoState('empty', '')"
        >
          Пустой список
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': effectiveState === 'no-results' }"
          @click="setDemoState('no-results', '')"
        >
          Нет результатов
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': simulateError === '429' }"
          @click="setDemoState('ready', '429')"
        >
          Ошибка 429
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': simulateError === '500' || viewState === 'error' }"
          @click="setDemoState('ready', '500')"
        >
          Ошибка 500
        </button>
      </div>
    </div>

    <div class="fil-try" :class="{ 'is-state-compact': effectiveState !== 'ready' || isMutationBannerView }">
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

      <div v-if="effectiveState === 'ready' && !isMutationBannerView" class="fil-tr-naznachenie filter-field">
        <WFGPTField
          v-model="assigneeFilter"
          label23270="Назначение"
          type="select"
          :options="assigneeOptions"
          value="Все заявки  ▾"
        />
      </div>

      <div v-if="effectiveState === 'ready' && !isMutationBannerView" class="sortirovka-zaiavok filter-field">
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

    <!-- экран пустого результата поиска и фильтрации из макета 204 -->
    <div v-else-if="effectiveState === 'no-results'" class="sostoianie-spiska">
      <OctagonIconSearch />
      <p class="nichego-ne-naideno">Ничего не найдено</p>
      <p class="poprobuite-izmenit-zapros-ili-sbrosit">
        Попробуйте изменить запрос или сбросить фильтры.
      </p>
      <OctagonButton
        variant="secondary"
        label23251="Сбросить фильтры"
        @click="handleResetAllFilters"
      />
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
        {{ errorSubtitleText }}
      </p>
      <OctagonButton
        label23251="Повторить загрузку"
        @click="handleRetryLoad"
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
          v-for="req in displayedRequests"
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

      <div class="paginatsiia">
        <p class="pokazano-1-12-iz-24">{{ paginationLabel }}</p>
        <template v-if="totalPages > 1">
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
        </template>
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

.soobshchenie-ob-izmenenii {
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

.po-zaprosu-crm-naideno-1,
.chast-dannykh-zaiavki-nedostupna-ostal,
.prioritet-izmenion-na-vysokii,
.plotnost-spiska-kompaktnaia {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.izmenenie-ne-sokhraneno {
  align-self: stretch;
  color: var(--color-text-danger, #FF7994);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.zaiavka-byla-izmenena-drugim {
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

.nichego-ne-naideno,
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

.poprobuite-izmenit-zapros-ili-sbrosit,
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
