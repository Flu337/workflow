import { computed } from 'vue'
import { MOCK_REQUESTS } from '~/utils/mockData'
import type {
  WorkFlowRequest,
  RequestStatus,
  RequestPriority,
  RequestSortOrder,
  ListViewState,
  ListDensity
} from '~/types/workflow'

export const useRequests = () => {
  const requests = useState<WorkFlowRequest[]>('wf-requests', () =>
    MOCK_REQUESTS.map(item => ({
      ...item,
      comments: [...item.comments],
      timeline: [...item.timeline]
    }))
  )

  const searchQuery = useState<string>('wf-filter-search', () => '')
  const statusFilter = useState<RequestStatus | 'all'>('wf-filter-status', () => 'all')
  const priorityFilter = useState<RequestPriority | 'all'>('wf-filter-priority', () => 'all')
  const assigneeFilter = useState<string>('wf-filter-assignee', () => 'all')
  const sortOrder = useState<RequestSortOrder>('wf-sort-order', () => 'newest')
  const currentPage = useState<number>('wf-current-page', () => 1)
  const simulateError = useState<string>('wf-simulate-error', () => '')
  const pageSize = 12

  // состояние отображения списка для демонстрации сценариев
  const viewState = useState<ListViewState>('wf-view-state', () => 'ready')

  const userProfile = useState('wf-user-profile', () => ({
    name: 'Анна Кузнецова',
    email: '0000@mail.demo',
    initials: 'АК',
    role: 'Оператор',
    density: 'comfortable' as ListDensity
  }))

  const isCreateModalOpen = useState<boolean>('wf-create-modal-open', () => false)

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

  const addComment = (requestId: string, text: string) => {
    const target = getRequestById(requestId)
    const trimmed = text.trim()
    if (!target || !trimmed) return

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const timeStr = `${hh}:${mm}`

    target.comments.push({
      id: `c-${target.id}-${Date.now()}`,
      author: userProfile.value.name,
      time: timeStr,
      text: trimmed
    })

    target.timeline.push({
      id: `t-${target.id}-${Date.now()}`,
      time: timeStr,
      text: `${userProfile.value.name.split(' ')[0]} добавил(а) комментарий`
    })
  }

  const updateRequestParams = (
    requestId: string,
    payload: { assignee?: string; priority?: RequestPriority; status?: RequestStatus }
  ) => {
    const target = getRequestById(requestId)
    if (!target) return

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const timeStr = `${hh}:${mm}`

    if (payload.assignee && payload.assignee !== target.assignee) {
      target.assignee = payload.assignee
      if (target.status === 'new' && payload.assignee !== 'Не назначен') {
        target.status = 'assigned'
      }
      target.timeline.push({
        id: `t-${target.id}-${Date.now()}-a`,
        time: timeStr,
        text:
          payload.assignee === 'Не назначен'
            ? 'Исполнитель снят'
            : `Назначен исполнитель ${payload.assignee}`
      })
    }

    if (payload.priority && payload.priority !== target.priority) {
      target.priority = payload.priority
      target.timeline.push({
        id: `t-${target.id}-${Date.now()}-p`,
        time: timeStr,
        text: 'Изменён приоритет заявки'
      })
    }

    if (payload.status && payload.status !== target.status) {
      target.status = payload.status
    }
  }

  const createNewRequest = (payload: {
    title: string
    customer: string
    category: string
    priority: RequestPriority
    description: string
  }) => {
    const maxId = requests.value.reduce((acc, item) => Math.max(acc, Number(item.id)), 1042)
    const nextId = String(maxId + 1)
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const timeStr = `${hh}:${mm}`

    const newReq: WorkFlowRequest = {
      id: nextId,
      code: `#${nextId}`,
      title: payload.title.trim() || 'Без названия',
      customer: payload.customer.trim() || 'Клиент не указан',
      assignee: 'Не назначен',
      status: 'new',
      priority: payload.priority,
      category: payload.category.trim() || 'Доступ и учётные записи',
      createdAt: `Создана сегодня, ${timeStr}`,
      dueAt: 'Сегодня, 18:00',
      description: payload.description.trim() || 'Описание проблемы добавлено при создании заявки.',
      comments: [],
      timeline: [
        {
          id: `t-${nextId}-1`,
          time: timeStr,
          text: `${userProfile.value.name.split(' ')[0]} создал(а) заявку`
        }
      ],
      hasMissingData: !payload.title.trim() || !payload.customer.trim()
    }

    requests.value.unshift(newReq)
    viewState.value = 'ready'
    currentPage.value = 1
    return newReq
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
    addComment,
    updateRequestParams,
    createNewRequest,
    resetSearch,
    resetFilters,
    simulateRetryLoad
  }
}
