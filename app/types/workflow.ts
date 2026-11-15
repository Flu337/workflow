export type RequestStatus =
  | 'new'
  | 'assigned'
  | 'in-progress'
  | 'waiting'
  | 'escalated'
  | 'resolved'
  | 'closed'

export type RequestPriority = 'critical' | 'high' | 'normal' | 'low'

export type RequestSortOrder = 'newest' | 'oldest' | 'priority'

export type ListViewState = 'ready' | 'loading' | 'empty' | 'error' | 'no-results'

export type ListDensity = 'comfortable' | 'compact'

export interface RequestCommentDto {
  id: string
  author: string
  time: string
  text: string
}

export interface RequestTimelineItemDto {
  id: string
  time: string
  text: string
}

// серверная модель заявки с необязательными полями для проверки устойчивости
export interface RequestItemDto {
  id: string
  code?: string
  title?: string | null
  customer?: string | null
  assignee?: string | null
  status?: RequestStatus
  priority?: RequestPriority
  category?: string | null
  createdAt?: string
  dueAt?: string
  description?: string | null
  comments?: RequestCommentDto[]
  timeline?: RequestTimelineItemDto[]
}

export interface RequestsMetricsDto {
  newCount: number
  inProgressCount: number
  waitingCount: number
  resolvedCount: number
}

export interface RequestsListResponseDto {
  items: RequestItemDto[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasPartialDataInPage: boolean
  metrics: RequestsMetricsDto
}

export interface RequestDetailResponseDto {
  item: RequestItemDto
}

export interface UserDirectoryItemDto {
  id: string
  name: string
  shortName: string
  role: string
  email: string
  initials: string
}

export interface CustomerDirectoryItemDto {
  id: string
  name: string
  inn: string
}

export interface CategoryDirectoryItemDto {
  id: string
  name: string
  slaHours: number
}

// нормализованная клиентская модель заявки
export interface WorkFlowRequest {
  id: string
  code: string
  title: string
  customer: string
  assignee: string
  status: RequestStatus
  priority: RequestPriority
  category: string
  createdAt: string
  dueAt: string
  description: string
  comments: RequestCommentDto[]
  timeline: RequestTimelineItemDto[]
  hasMissingData: boolean
}

export interface NormalizedRequestsListResult {
  items: WorkFlowRequest[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasIncompleteData: boolean
  metrics: RequestsMetricsDto
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  'new': 'Новая',
  'assigned': 'Назначена',
  'in-progress': 'В работе',
  'waiting': 'Ожидание',
  'escalated': 'Эскалирована',
  'resolved': 'Решена',
  'closed': 'Закрыта'
}

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  'critical': 'Критический',
  'high': 'Высокий',
  'normal': 'Обычный',
  'low': 'Низкий'
}
