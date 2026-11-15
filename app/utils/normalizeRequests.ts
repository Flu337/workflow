import type {
  RequestItemDto,
  RequestsListResponseDto,
  WorkFlowRequest,
  NormalizedRequestsListResult,
  RequestStatus,
  RequestPriority
} from '~/types/workflow'

const VALID_STATUSES: RequestStatus[] = [
  'new',
  'assigned',
  'in-progress',
  'waiting',
  'escalated',
  'resolved',
  'closed'
]

const VALID_PRIORITIES: RequestPriority[] = ['critical', 'high', 'normal', 'low']

// единая нормализация заявки и подстановка значений для пустых полей
export function normalizeRequestItem(dto: RequestItemDto): WorkFlowRequest {
  const rawTitle = typeof dto.title === 'string' ? dto.title.trim() : ''
  const rawCustomer = typeof dto.customer === 'string' ? dto.customer.trim() : ''
  const rawAssignee = typeof dto.assignee === 'string' ? dto.assignee.trim() : ''
  const rawCategory = typeof dto.category === 'string' ? dto.category.trim() : ''
  const rawDescription = typeof dto.description === 'string' ? dto.description.trim() : ''

  const hasMissingData = !rawTitle || !rawCustomer

  const cleanId = String(dto.id || '').replace(/^#/, '') || '0000'
  const code = dto.code && dto.code.trim() ? dto.code.trim() : `#${cleanId}`

  const status: RequestStatus =
    dto.status && VALID_STATUSES.includes(dto.status) ? dto.status : 'new'

  const priority: RequestPriority =
    dto.priority && VALID_PRIORITIES.includes(dto.priority) ? dto.priority : 'normal'

  return {
    id: cleanId,
    code,
    title: rawTitle || 'Без названия',
    customer: rawCustomer || 'Клиент не указан',
    assignee: rawAssignee || 'Не назначен',
    status,
    priority,
    category: rawCategory || 'Доступ и учётные записи',
    createdAt: dto.createdAt && dto.createdAt.trim() ? dto.createdAt.trim() : 'Создана сегодня',
    dueAt: dto.dueAt && dto.dueAt.trim() ? dto.dueAt.trim() : 'Сегодня, 18:00',
    description:
      rawDescription ||
      'Описание проблемы не было передано при создании обращения.',
    comments: Array.isArray(dto.comments)
      ? dto.comments.map(c => ({
          id: String(c.id),
          author: c.author?.trim() || 'Оператор',
          time: c.time?.trim() || '09:00',
          text: c.text?.trim() || ''
        }))
      : [],
    timeline: Array.isArray(dto.timeline)
      ? dto.timeline.map(t => ({
          id: String(t.id),
          time: t.time?.trim() || '09:00',
          text: t.text?.trim() || 'Событие по заявке'
        }))
      : [],
    hasMissingData
  }
}

// нормализация ответа списка заявок с проверкой неполных данных
export function normalizeRequestsListResponse(
  response?: RequestsListResponseDto | null
): NormalizedRequestsListResult {
  if (!response || !Array.isArray(response.items)) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasIncompleteData: false,
      metrics: {
        newCount: 6,
        inProgressCount: 4,
        waitingCount: 4,
        resolvedCount: 2
      }
    }
  }

  const normalizedItems = response.items.map(normalizeRequestItem)
  const hasIncompleteData =
    Boolean(response.hasPartialDataInPage) ||
    normalizedItems.some(item => item.hasMissingData)

  return {
    items: normalizedItems,
    total: typeof response.total === 'number' ? response.total : normalizedItems.length,
    page: typeof response.page === 'number' ? response.page : 1,
    limit: typeof response.limit === 'number' ? response.limit : 12,
    totalPages: typeof response.totalPages === 'number' ? Math.max(1, response.totalPages) : 1,
    hasIncompleteData,
    metrics: response.metrics || {
      newCount: 6,
      inProgressCount: 4,
      waitingCount: 4,
      resolvedCount: 2
    }
  }
}
