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
export type SortOrder = RequestSortOrder

export type ListViewState = 'ready' | 'loading' | 'empty' | 'no-results' | 'error'

export type ListDensity = 'comfortable' | 'compact'

export interface RequestCommentDto {
  id: string
  author?: string | null
  time?: string | null
  text?: string | null
}

export interface RequestTimelineItemDto {
  id: string
  time?: string | null
  text?: string | null
}

export interface RequestItemDto {
  id: string | number
  code?: string | null
  title?: string | null
  customer?: string | null
  assignee?: string | null
  status?: RequestStatus | null
  priority?: RequestPriority | null
  category?: string | null
  createdAt?: string | null
  dueAt?: string | null
  description?: string | null
  comments?: RequestCommentDto[] | null
  timeline?: RequestTimelineItemDto[] | null
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
  hasPartialDataInPage?: boolean
  hasIncompleteData?: boolean
  metrics: RequestsMetricsDto
}

export interface RequestDetailResponseDto {
  item: RequestItemDto
  hasIncompleteData: boolean
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
  inn?: string
  contactPerson?: string
}

export interface CategoryDirectoryItemDto {
  id: string
  name: string
  slaHours: number
}

export interface RequestComment {
  id: string
  author: string
  time: string
  text: string
}

export interface RequestTimelineItem {
  id: string
  time: string
  text: string
}

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
  comments: RequestComment[]
  timeline: RequestTimelineItem[]
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

export interface RequestsFilterQuery {
  search: string
  status: RequestStatus | 'all'
  priority: RequestPriority | 'all'
  assignee: string
  sort: RequestSortOrder
  page: number
}

export interface UpdateRequestPayloadDto {
  status?: RequestStatus
  priority?: RequestPriority
  assignee?: string
  dueAt?: string
  actorName?: string
  simulateError?: '409' | '500' | ''
}

export interface UpdateRequestResponseDto {
  item: RequestItemDto
  updatedField: 'priority' | 'status' | 'assignee'
  message: string
}

export interface AddCommentPayloadDto {
  author: string
  text: string
  simulateError?: '500' | ''
}

export interface AddCommentResponseDto {
  item: RequestItemDto
  comment: RequestCommentDto
  message: string
}

export interface CreateRequestPayloadDto {
  title: string
  customer: string
  category: string
  priority: RequestPriority
  description: string
  authorName?: string
}

export interface UndoMutationSnapshot {
  requestId: string
  field: 'priority' | 'status'
  previousValue: RequestPriority | RequestStatus
  newValue: RequestPriority | RequestStatus
  previousDueAt: string
  newDueAt: string
  bannerMessage: string
}

export interface RollbackBannerState {
  requestId: string
  statusCode: 409 | 500
  title: string
  description: string
}

export interface FeedbackBannerState {
  requestId: string
  type: 'priority' | 'status' | 'assignee' | 'comment'
  message: string
  canUndo: boolean
}

export interface UserPreferencesState {
  name: string
  email: string
  initials: string
  role: string
  density: ListDensity
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
  critical: 'Критический',
  high: 'Высокий',
  normal: 'Обычный',
  low: 'Низкий'
}

export const PRIORITY_DUE_DATES: Record<RequestPriority, string> = {
  critical: 'Сегодня, 10:14',
  high: 'Сегодня, 13:14',
  normal: 'Сегодня, 18:00',
  low: 'Завтра, 12:00'
}
