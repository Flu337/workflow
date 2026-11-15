import type {
  RequestItemDto,
  RequestCommentDto,
  RequestTimelineItemDto,
  RequestsListResponseDto,
  WorkFlowRequest,
  RequestComment,
  RequestTimelineItem,
  NormalizedRequestsListResult,
  RequestStatus,
  RequestPriority
} from '../../shared/types/workflow'

export const DEFAULT_REQUEST_TITLE = 'Без названия'
export const DEFAULT_CUSTOMER_NAME = 'Клиент не указан'
export const DEFAULT_ASSIGNEE_NAME = 'Не назначен'

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

function normalizeComment(dto: RequestCommentDto, index: number): RequestComment {
  return {
    id: dto.id || `comment-${index}`,
    author: dto.author && dto.author.trim() ? dto.author.trim() : 'Сотрудник поддержки',
    time: dto.time && dto.time.trim() ? dto.time.trim() : '09:00',
    text: dto.text && dto.text.trim() ? dto.text.trim() : 'Текст комментария отсутствует.'
  }
}

function normalizeTimelineItem(dto: RequestTimelineItemDto, index: number): RequestTimelineItem {
  return {
    id: dto.id || `timeline-${index}`,
    time: dto.time && dto.time.trim() ? dto.time.trim() : '09:00',
    text: dto.text && dto.text.trim() ? dto.text.trim() : 'Обновление заявки'
  }
}

// единая нормализация заявки и подстановка значений для пустых полей
export function normalizeRequestItem(dto: RequestItemDto): WorkFlowRequest {
  const rawId = String(dto.id ?? '').replace(/^#/, '').trim() || '1000'
  const rawTitle = typeof dto.title === 'string' ? dto.title.trim() : ''
  const rawCustomer = typeof dto.customer === 'string' ? dto.customer.trim() : ''
  const rawAssignee = typeof dto.assignee === 'string' ? dto.assignee.trim() : ''

  const hasMissingData = !rawTitle || !rawCustomer

  const status: RequestStatus =
    dto.status && VALID_STATUSES.includes(dto.status) ? dto.status : 'new'
  const priority: RequestPriority =
    dto.priority && VALID_PRIORITIES.includes(dto.priority) ? dto.priority : 'normal'

  return {
    id: rawId,
    code: dto.code && dto.code.trim() ? dto.code.trim() : `#${rawId}`,
    title: rawTitle || DEFAULT_REQUEST_TITLE,
    customer: rawCustomer || DEFAULT_CUSTOMER_NAME,
    assignee: rawAssignee || DEFAULT_ASSIGNEE_NAME,
    assigneeId: dto.assigneeId || undefined,
    status,
    priority,
    category:
      dto.category && dto.category.trim() ? dto.category.trim() : 'Доступ и учётные записи',
    createdAt:
      dto.createdAt && dto.createdAt.trim() ? dto.createdAt.trim() : 'Создана 5 октября, 09:00',
    dueAt: dto.dueAt && dto.dueAt.trim() ? dto.dueAt.trim() : 'Сегодня, 18:00',
    description:
      dto.description && dto.description.trim()
        ? dto.description.trim()
        : 'Описание проблемы не указано.',
    resolutionSummary:
      typeof dto.resolutionSummary === 'string' ? dto.resolutionSummary.trim() : '',
    waitingReason: typeof dto.waitingReason === 'string' ? dto.waitingReason.trim() : '',
    closingReason: typeof dto.closingReason === 'string' ? dto.closingReason.trim() : '',
    attachments: Array.isArray(dto.attachments) ? dto.attachments : [],
    comments: Array.isArray(dto.comments) ? dto.comments.map(normalizeComment) : [],
    timeline: Array.isArray(dto.timeline) ? dto.timeline.map(normalizeTimelineItem) : [],
    hasMissingData
  }
}

export function normalizeRequestDetail(dto: RequestItemDto | null | undefined): WorkFlowRequest | null {
  if (!dto) return null
  return normalizeRequestItem(dto)
}

// нормализация ответа списка заявок с проверкой неполных данных
export function normalizeRequestsListResponse(
  response: RequestsListResponseDto | null | undefined
): NormalizedRequestsListResult {
  if (!response) {
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

  const normalizedItems = Array.isArray(response.items)
    ? response.items.map(normalizeRequestItem)
    : []

  const hasIncompleteData =
    Boolean(response.hasPartialDataInPage) ||
    Boolean(response.hasIncompleteData) ||
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
