<script setup lang="ts">
import type {
  ListViewState,
  RequestsListResponseDto,
  UserDirectoryItemDto,
  CustomerDirectoryItemDto,
  CategoryDirectoryItemDto
} from '../../../shared/types/workflow'
import { normalizeRequestsListResponse } from '~/utils/normalizeRequests'
import { useDebounce } from '~/composables/useDebounce'
import { createSearchRaceGuard } from '../../../shared/utils/asyncGuards'
import { usePreferencesStore } from '~/stores/preferences'
import { useRequestUiStore } from '~/stores/requestUi'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const preferencesStore = usePreferencesStore()
const requestUiStore = useRequestUiStore()
const authStore = useAuthStore()

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

initFiltersFromRoute(route.query as Record<string, string | (string | null)[] | null | undefined>)

const debouncedSearch = useDebounce(searchQuery, 300)
const searchRaceGuard = createSearchRaceGuard()
const latestSearchData = ref<RequestsListResponseDto | null>(null)

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

const apiQuery = computed(() => ({
  search: debouncedSearch.value.trim() || undefined,
  status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
  priority: priorityFilter.value !== 'all' ? priorityFilter.value : undefined,
  assignee: assigneeFilter.value !== 'all' ? assigneeFilter.value : undefined,
  sort: sortOrder.value,
  page: currentPage.value,
  limit: pageSize,
  simulateError: simulateError.value || undefined,
  role: authStore.currentRole
}))

const {
  data: rawRequestsResponse,
  status: fetchStatus,
  error: fetchError,
  refresh: refreshRequests
} = await useFetch<RequestsListResponseDto>('/api/requests', {
  key: 'wf-requests-list',
  query: apiQuery,
  watch: false
})

// защита от гонки поисковых запросов с отменой устаревших ответов через abortcontroller и requestid
watch(
  apiQuery,
  async (nextQuery) => {
    const { requestId, signal } = searchRaceGuard.nextRequest()
    try {
      const fresh = await $fetch<RequestsListResponseDto>('/api/requests', {
        query: nextQuery,
        signal
      })
      if (searchRaceGuard.isLatest(requestId)) {
        rawRequestsResponse.value = fresh
        latestSearchData.value = fresh
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        return
      }
      const code =
        (err as { statusCode?: number; status?: number })?.statusCode ||
        (err as { statusCode?: number; status?: number })?.status
      if (code === 401) {
        await authStore.handleUnauthorizedError()
        return
      }
      if (searchRaceGuard.isLatest(requestId)) {
        await refreshRequests()
      }
    }
  }
)

watch(
  fetchError,
  async (err) => {
    const code =
      (err as { statusCode?: number; status?: number } | null)?.statusCode ||
      (err as { statusCode?: number; status?: number } | null)?.status
    if (code === 401) {
      await authStore.handleUnauthorizedError()
    }
  },
  { immediate: true }
)

const normalizedList = computed(() => normalizeRequestsListResponse(rawRequestsResponse.value))

const displayedRequests = computed(() =>
  normalizedList.value.items.map(item => requestUiStore.applyOverridesToRequest(item))
)
const totalFiltered = computed(() => normalizedList.value.total)
const totalPages = computed(() => normalizedList.value.totalPages)
const hasIncompleteData = computed(() => normalizedList.value.hasIncompleteData)

const isClientRole = computed(() => authStore.currentRole === 'Client')
const isAgentRole = computed(() => authStore.currentRole === 'Agent')
const isOperatorOrAdmin = computed(
  () => authStore.currentRole === 'Operator' || authStore.currentRole === 'Admin'
)

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
    .filter(u => u.role === 'Agent')
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
    <!-- представление для роли клиент из макета 2.txt -->
    <template v-if="isClientRole && effectiveState === 'ready' && !isMutationBannerView">
      <p class="moi-zaiavki">Мои заявки</p>
      <p class="vse-obrashcheniia-v-odnom-meste">Все обращения в одном месте</p>
    </template>

    <!-- представление для роли исполнитель из макета 4.txt -->
    <template v-else-if="isAgentRole && effectiveState === 'ready' && !isMutationBannerView">
      <p class="zaiavki-state-heading">Заявки</p>
      <p class="naznachennye-vam-obrashcheniia">Назначенные вам обращения</p>
    </template>

    <!-- представление для оператора и администратора -->
    <template v-else-if="effectiveState === 'ready' && !isMutationBannerView">
      <p class="rabochii-den-pod-kontrolem">Рабочий день под контролем</p>
      <p class="zaiavki-kotorye-trebuiut-vashego">
        Заявки, которые требуют вашего внимания
      </p>

      <div v-if="preferencesStore.isCompact" class="soobshchenie-ob-izmenenii">
        <p class="plotnost-spiska-kompaktnaia">Плотность списка: компактная</p>
      </div>

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
      <!-- у роли исполнитель кнопка создания заявки скрыта по макету 4.txt -->
      <div v-if="!isAgentRole" class="octagon-button">
        <OctagonButton
          label23251="Создать заявку"
          @click="openCreateModal"
        />
      </div>    </div>

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

      <!-- фильтр по назначению отображается только для оператора и админа -->
      <div v-if="effectiveState === 'ready' && !isMutationBannerView && isOperatorOrAdmin" class="fil-tr-naznachenie filter-field">
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

      <div v-if="totalPages > 1 || isOperatorOrAdmin" class="paginatsiia">
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

<style scoped src="~/assets/css/pages/requests/index.css"></style>
