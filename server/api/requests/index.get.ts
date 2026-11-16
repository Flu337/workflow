import { SERVER_REQUESTS_DB } from '../../utils/db'
import { requireAuthUser } from '../../utils/auth'
import type {
  RequestItemDto,
  RequestPriority,
  RequestsListResponseDto
} from '../../../shared/types/workflow'

const PRIORITY_RANK: Record<RequestPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1
}

export default defineEventHandler((event): RequestsListResponseDto => {
  const user = requireAuthUser(event)
  const query = getQuery(event)

  const simulateError = String(query.simulateError || '').trim()
  if (simulateError === '429') {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Слишком много запросов к серверу (HTTP 429). Подождите немного и повторите попытку.'
    })
  }

  if (simulateError === '500') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Временная ошибка сервера (HTTP 500). Не удалось загрузить список заявок.'
    })
  }

  const search = String(query.search || '').trim().toLowerCase()
  const status = String(query.status || 'all').trim()
  const priority = String(query.priority || 'all').trim()
  const assignee = String(query.assignee || 'all').trim()
  const sort = String(query.sort || 'newest').trim()
  const pageRaw = Number(query.page || 1)
  const limitRaw = Number(query.limit || 12)

  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
  const limit = Number.isFinite(limitRaw) && limitRaw >= 1 ? Math.floor(limitRaw) : 12

  const simulateIncomplete =
    String(query.incomplete || '') === '1' ||
    String(query.partial || '') === '1' ||
    simulateError === 'incomplete'

  // серверная фильтрация доступа по роли пользователя
  let accessibleItems: RequestItemDto[] = SERVER_REQUESTS_DB.map(item => ({
    ...item,
    title: simulateIncomplete && String(item.id) === '1038' ? undefined : item.title,
    customer: simulateIncomplete && String(item.id) === '1038' ? undefined : item.customer,
    comments: item.comments ? [...item.comments] : [],
    timeline: item.timeline ? [...item.timeline] : []
  }))

  if (user.role === 'Client') {
    accessibleItems = accessibleItems.filter(
      item =>
        (item.customer || '').trim() === user.company ||
        item.createdByUserId === user.id
    )
  } else if (user.role === 'Agent') {
    accessibleItems = accessibleItems.filter(
      item =>
        item.assignee === user.shortName ||
        item.assignee === user.name ||
        item.id === '1042'
    )
  }

  let filtered = [...accessibleItems]

  if (search) {
    filtered = filtered.filter((item) => {
      const codeStr = (item.code || `#${item.id}`).toLowerCase()
      const idStr = String(item.id).toLowerCase()
      const titleStr = (item.title || 'Без названия').toLowerCase()
      const customerStr = (item.customer || 'Клиент не указан').toLowerCase()
      return (
        codeStr.includes(search) ||
        idStr.includes(search) ||
        titleStr.includes(search) ||
        customerStr.includes(search)
      )
    })
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(item => item.status === status)
  }

  if (priority && priority !== 'all') {
    filtered = filtered.filter(item => item.priority === priority)
  }

  if (assignee && assignee !== 'all') {
    if (assignee === 'unassigned') {
      filtered = filtered.filter(
        item => !item.assignee || item.assignee === 'Не назначен'
      )
    } else {
      filtered = filtered.filter(item => item.assignee === assignee)
    }
  }

  if (sort === 'oldest') {
    filtered.sort((a, b) => Number(a.id) - Number(b.id))
  } else if (sort === 'priority') {
    filtered.sort((a, b) => {
      const pA = PRIORITY_RANK[a.priority || 'normal'] || 2
      const pB = PRIORITY_RANK[b.priority || 'normal'] || 2
      if (pB !== pA) return pB - pA
      return Number(b.id) - Number(a.id)
    })
  } else {
    filtered.sort((a, b) => Number(b.id) - Number(a.id))
  }

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  const hasIncompleteData = paginated.some(
    item => !item.title || !item.title.trim() || !item.customer || !item.customer.trim()
  )

  return {
    items: paginated,
    total,
    page: safePage,
    limit,
    totalPages,
    hasPartialDataInPage: hasIncompleteData,
    hasIncompleteData,
    metrics: {
      newCount: 6,
      inProgressCount: 4,
      waitingCount: 4,
      resolvedCount: 2
    }
  }
})
