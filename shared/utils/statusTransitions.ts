import {
  STATUS_LABELS,
  type RequestStatus,
  type UserRole
} from '../types/workflow'

// таблица допустимых переходов между статусами заявки
export const ALLOWED_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  'new': ['assigned', 'in-progress', 'closed'],
  'assigned': ['in-progress', 'waiting', 'escalated', 'closed'],
  'in-progress': ['waiting', 'resolved', 'escalated', 'closed'],
  'waiting': ['in-progress', 'resolved', 'escalated', 'closed'],
  'escalated': ['assigned', 'in-progress', 'resolved', 'closed'],
  'resolved': ['in-progress', 'closed'],
  'closed': ['in-progress']
}

// ограничения переходов статусов по ролям пользователей
export const ROLE_ALLOWED_TARGET_STATUSES: Record<UserRole, RequestStatus[]> = {
  Client: [],
  Agent: ['in-progress', 'waiting', 'resolved', 'escalated'],
  Operator: ['assigned', 'in-progress', 'waiting', 'escalated', 'resolved', 'closed'],
  Admin: ['new', 'assigned', 'in-progress', 'waiting', 'escalated', 'resolved', 'closed']
}

export interface StatusTransitionValidationInput {
  role: UserRole
  fromStatus: RequestStatus
  toStatus: RequestStatus
  waitingReason?: string | null
  resolutionSummary?: string | null
  closingReason?: string | null
}

export interface StatusTransitionValidationResult {
  valid: boolean
  statusCode: number
  errorField?: 'waitingReason' | 'resolutionSummary' | 'closingReason' | 'status'
  message: string
}

export function getAllowedNextStatuses(
  fromStatus: RequestStatus,
  role: UserRole
): RequestStatus[] {
  const fromAllowed = ALLOWED_STATUS_TRANSITIONS[fromStatus] || []
  const roleAllowed = ROLE_ALLOWED_TARGET_STATUSES[role] || []
  return fromAllowed.filter(status => roleAllowed.includes(status))
}

// проверка допустимости перехода статуса и обязательных полей причины или результата
export function validateStatusTransition(
  input: StatusTransitionValidationInput
): StatusTransitionValidationResult {
  const { role, fromStatus, toStatus, waitingReason, resolutionSummary, closingReason } = input

  if (role === 'Client') {
    return {
      valid: false,
      statusCode: 403,
      errorField: 'status',
      message: 'Клиент не может изменять статус заявки.'
    }
  }

  if (role === 'Agent' && (toStatus === 'closed' || toStatus === 'assigned')) {
    return {
      valid: false,
      statusCode: 403,
      errorField: 'status',
      message: 'Исполнитель не может выполнять административные действия по назначению или закрытию заявки.'
    }
  }

  if (fromStatus !== toStatus) {
    const allowed = ALLOWED_STATUS_TRANSITIONS[fromStatus] || []
    if (!allowed.includes(toStatus)) {
      return {
        valid: false,
        statusCode: 422,
        errorField: 'status',
        message: `Недопустимый переход статуса из «${STATUS_LABELS[fromStatus]}» в «${STATUS_LABELS[toStatus]}».`
      }
    }
  }

  if (toStatus === 'waiting' && (!waitingReason || !waitingReason.trim())) {
    return {
      valid: false,
      statusCode: 422,
      errorField: 'waitingReason',
      message: 'Укажите причину ожидания.'
    }
  }

  if (toStatus === 'resolved' && (!resolutionSummary || !resolutionSummary.trim())) {
    return {
      valid: false,
      statusCode: 422,
      errorField: 'resolutionSummary',
      message: 'Опишите результат решения.'
    }
  }

  if (toStatus === 'closed' && (!closingReason || !closingReason.trim())) {
    return {
      valid: false,
      statusCode: 422,
      errorField: 'closingReason',
      message: 'Укажите причину ручного закрытия.'
    }
  }

  return {
    valid: true,
    statusCode: 200,
    message: 'OK'
  }
}
