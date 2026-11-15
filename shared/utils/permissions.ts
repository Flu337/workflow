import type { RequestItemDto, SessionUserDto, UserRole } from '../types/workflow'

// проверка доступа пользователя к просмотру конкретной заявки на сервере и клиенте
export function canUserAccessRequest(
  user: SessionUserDto | null,
  request: RequestItemDto
): boolean {
  if (!user) return false
  if (user.role === 'Admin' || user.role === 'Operator') {
    return true
  }
  if (user.role === 'Client') {
    const reqCustomer = (request.customer || '').trim()
    const userCompany = (user.company || '').trim()
    return Boolean(
      (request.createdByUserId && request.createdByUserId === user.id) ||
        (reqCustomer && userCompany && reqCustomer === userCompany)
    )
  }
  if (user.role === 'Agent') {
    const assignee = (request.assignee || '').trim()
    return (
      assignee === user.name ||
      assignee === user.shortName ||
      request.assigneeId === user.id
    )
  }
  return false
}

export function canUserAssignExecutor(role: UserRole): boolean {
  return role === 'Operator' || role === 'Admin'
}

export function canUserChangePriority(role: UserRole): boolean {
  return role === 'Operator' || role === 'Admin'
}

export function canUserCloseRequest(role: UserRole): boolean {
  return role === 'Operator' || role === 'Admin'
}

export function canUserResolveRequest(role: UserRole): boolean {
  return role === 'Agent' || role === 'Operator' || role === 'Admin'
}

export function canUserCreateRequest(role: UserRole): boolean {
  return role === 'Client' || role === 'Operator' || role === 'Admin'
}

export function canUserAccessDashboard(role: UserRole): boolean {
  return role === 'Operator' || role === 'Agent' || role === 'Admin'
}
