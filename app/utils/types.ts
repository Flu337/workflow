export type RequestStatus =
  | 'new'
  | 'assigned'
  | 'in-progress'
  | 'waiting'
  | 'escalated'
  | 'resolved'
  | 'closed'

export type RequestPriority = 'critical' | 'high' | 'normal' | 'low'

export type ListViewState = 'ready' | 'loading' | 'empty' | 'error'

export type ListDensity = 'comfortable' | 'compact'

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
