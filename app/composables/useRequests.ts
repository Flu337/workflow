import { computed } from 'vue'
import { MOCK_REQUESTS } from '~/utils/mockData'
import { normalizeRequestItem } from '~/utils/normalizeRequests'
import { usePreferencesStore } from '~/stores/preferences'
import { useAuthStore } from '~/stores/auth'
import type {
  WorkFlowRequest,
  RequestStatus,
  RequestPriority,
  RequestSortOrder,
  ListViewState,
  RequestItemDto
} from '../../shared/types/workflow'

export const useRequests = () => {
  const preferencesStore = usePreferencesStore()

  const requests = useState<WorkFlowRequest[]>('wf-requests', () =>
    MOCK_REQUESTS.map(item => ({
      ...item,
      comments: [...item.comments],
      timeline: [...item.timeline]
    }))
  )

  // состояние фильтров синхронизируемое с url url state
  const searchQuery = useState<string>('wf-filter-search', () => '')
  const statusFilter = useState<RequestStatus | 'all'>('wf-filter-status', () => 'all')
  const priorityFilter = useState<RequestPriority | 'all'>('wf-filter-priority', () => 'all')
  const assigneeFilter = useState<string>('wf-filter-assignee', () => 'all')
  const sortOrder = useState<RequestSortOrder>('wf-sort-order', () => 'newest')
  const currentPage = useState<number>('wf-current-page', () => 1)
  const simulateError = useState<string>('wf-simulate-error', () => '')
  const pageSize = 12

  const viewState = useState<ListViewState>('wf-view-state', () => 'ready')
  const isCreateModalOpen = useState<boolean>('wf-create-modal-open', () => false)

  // единый источник настроек пользователя через pinia store preferences
  const userProfile = computed(() => ({
    name: preferencesStore.name,
    email: preferencesStore.email,
    initials: preferencesStore.initials,
    role: preferencesStore.role,
    density: preferencesStore.density
  }))

  // восстановление фильтров и пагинации из query параметров ссылки
  const initFiltersFromRoute = (query: Record<string, string | (string | null)[] | null | undefined>) => {
    const qSearch = Array.isArray(query.search) ? query.search[0] : query.search
    searchQuery.value = typeof qSearch === 'string' ? qSearch : ''

    const qStatus = Array.isArray(query.status) ? query.status[0] : query.status
    statusFilter.value =
      typeof qStatus === 'string' && qStatus ? (qStatus as RequestStatus | 'all') : 'all'

    const qPriority = Array.isArray(query.priority) ? query.priority[0] : query.priority
    priorityFilter.value =
      typeof qPriority === 'string' && qPriority ? (qPriority as RequestPriority | 'all') : 'all'

    const qAssignee = Array.isArray(query.assignee) ? query.assignee[0] : query.assignee
    assigneeFilter.value = typeof qAssignee === 'string' && qAssignee ? qAssignee : 'all'

    const qSort = Array.isArray(query.sort) ? query.sort[0] : query.sort
    sortOrder.value =
      qSort === 'oldest' || qSort === 'priority' ? qSort : 'newest'

    const qPage = Array.isArray(query.page) ? query.page[0] : query.page
    const parsedPage = Number(qPage)
    currentPage.value = Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1

    const qErr = Array.isArray(query.simulateError) ? query.simulateError[0] : query.simulateError
    simulateError.value = typeof qErr === 'string' ? qErr : ''
  }

  // формирование объекта query параметров для синхронизации с роутером
  const buildRouteQuery = (debouncedSearchValue: string): Record<string, string> => {
    const nextQuery: Record<string, string> = {}

    if (debouncedSearchValue.trim()) {
      nextQuery.search = debouncedSearchValue.trim()
    }
    if (statusFilter.value !== 'all') {
      nextQuery.status = statusFilter.value
    }
    if (priorityFilter.value !== 'all') {
      nextQuery.priority = priorityFilter.value
    }
    if (assigneeFilter.value !== 'all') {
      nextQuery.assignee = assigneeFilter.value
    }
    if (sortOrder.value !== 'newest') {
      nextQuery.sort = sortOrder.value
    }
    if (currentPage.value > 1) {
      nextQuery.page = String(currentPage.value)
    }
    if (simulateError.value) {
      nextQuery.simulateError = simulateError.value
    }

    return nextQuery
  }

  const hasActiveFilters = computed<boolean>(() => {
    return (
      Boolean(searchQuery.value.trim()) ||
      statusFilter.value !== 'all' ||
      priorityFilter.value !== 'all' ||
      assigneeFilter.value !== 'all'
    )
  })

  const priorityRank: Record<RequestPriority, number> = {
    critical: 4,
    high: 3,
    normal: 2,
    low: 1
  }

  const filteredRequests = computed<WorkFlowRequest[]>(() => {
    let result = [...requests.value]

    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      result = result.filter(
        item =>
          item.code.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.customer.toLowerCase().includes(q)
      )
    }

    if (statusFilter.value !== 'all') {
      result = result.filter(item => item.status === statusFilter.value)
    }

    if (priorityFilter.value !== 'all') {
      result = result.filter(item => item.priority === priorityFilter.value)
    }

    if (assigneeFilter.value !== 'all') {
      if (assigneeFilter.value === 'unassigned') {
        result = result.filter(item => item.assignee === 'Не назначен')
      } else {
        result = result.filter(item => item.assignee === assigneeFilter.value)
      }
    }

    if (sortOrder.value === 'newest') {
      result.sort((a, b) => Number(b.id) - Number(a.id))
    } else if (sortOrder.value === 'oldest') {
      result.sort((a, b) => Number(a.id) - Number(b.id))
    } else if (sortOrder.value === 'priority') {
      result.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority])
    }

    return result
  })

  const totalFiltered = computed(() => filteredRequests.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / pageSize)))

  const paginatedRequests = computed<WorkFlowRequest[]>(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredRequests.value.slice(start, start + pageSize)
  })

  const latestRequests = computed<WorkFlowRequest[]>(() => {
    return requests.value.slice(0, 3)
  })

  const metrics = computed(() => {
    return {
      newCount: 6,
      inProgressCount: 4,
      waitingCount: 4,
      resolvedCount: 2
    }
  })

  const getRequestById = (rawId: string): WorkFlowRequest | undefined => {
    const clean = rawId.replace(/^#/, '')
    return requests.value.find(r => r.id === clean || r.code === `#${clean}`)
  }

  // создание новой заявки через серверный api с обработкой ошибок 401 409 и 500
  const createNewRequest = async (payload: {
    title: string
    customer: string
    category: string
    priority: RequestPriority
    description: string
    simulateError?: '401' | '409' | '500' | ''
  }): Promise<WorkFlowRequest> => {
    try {
      const response = await $fetch<{ item: RequestItemDto }>('/api/requests', {
        method: 'POST',
        body: {
          ...payload,
          authorName: preferencesStore.name,
          simulateError: payload.simulateError || (simulateError.value === '500' ? '500' : '')
        }
      })

      const normalized = normalizeRequestItem(response.item)
      const existingIdx = requests.value.findIndex(r => r.id === normalized.id)
      if (existingIdx >= 0) {
        requests.value.splice(existingIdx, 1, normalized)
      } else {
        requests.value.unshift(normalized)
      }

      viewState.value = 'ready'
      currentPage.value = 1
      return normalized
    } catch (err) {
      const status =
        (err as { statusCode?: number; status?: number })?.statusCode ||
        (err as { statusCode?: number; status?: number })?.status
      if (status === 401) {
        const authStore = useAuthStore()
        await authStore.handleUnauthorizedError()
      }
      throw err
    }
  }

  const resetSearch = () => {
    searchQuery.value = ''
    currentPage.value = 1
  }

  const resetFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
    priorityFilter.value = 'all'
    assigneeFilter.value = 'all'
    sortOrder.value = 'newest'
    currentPage.value = 1
    simulateError.value = ''
    viewState.value = 'ready'
  }

  const simulateRetryLoad = () => {
    simulateError.value = ''
    viewState.value = 'ready'
  }

  return {
    requests,
    searchQuery,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    sortOrder,
    currentPage,
    simulateError,
    pageSize,
    viewState,
    userProfile,
    isCreateModalOpen,
    hasActiveFilters,
    filteredRequests,
    paginatedRequests,
    totalFiltered,
    totalPages,
    latestRequests,
    metrics,
    initFiltersFromRoute,
    buildRouteQuery,
    getRequestById,
    createNewRequest,
    resetSearch,
    resetFilters,
    simulateRetryLoad
  }
}
