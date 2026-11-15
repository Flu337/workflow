import { SERVER_REQUESTS_DB } from '../../utils/db'
import type {
  RequestItemDto,
  RequestsListResponseDto,
  RequestPriority
} from '~/types/workflow'

const PRIORITY_RANK: Record<RequestPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1
}

export default defineEventHandler((event): RequestsListResponseDto => {
  const query = getQuery(event)

  const simulateError = String(query.simulateError || '').trim()
  if (simulateError === '429') {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Слишком много запросов (HTTP 429). Пожалуйста, подождите и повторите загрузку.'
    })
  }
  if (simulateError === '500') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Сервис временно недоступен. Попробуйте ещё раз.'
    })
  }

  const search = String(query.search || '').trim().toLowerCase()
  const status = String(query.status || 'all').trim()
  const priority = String(query.priority || 'all').trim()
  const assignee = String(query.assignee || 'all').trim()
  const sort = String(query.sort || 'newest').trim()
  const includePartial = String(query.partial || '').trim()

  const pageRaw = Number(query.page || 1)
  const limitRaw = Number(query.limit || 12)
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 12

  // подготовка копии записей с учётом режима неполных данных
  let list: RequestItemDto[] = SERVER_REQUESTS_DB.map((item) => {
    if (item.id === '1038' && includePartial === 'false') {
      return {
        ...item,
        title: 'Настроить резервное копирование',
        customer: 'ООО «Сфера»'
      }
    }
    return { ...item }
  })

  // фильтрация по поисковому запросу статусу приоритету и исполнителю
  if (search) {
    list = list.filter((item) => {
      const titleText = (item.title || '').toLowerCase()
      const customerText = (item.customer || '').toLowerCase()
      const codeText = (item.code || `#${item.id}`).toLowerCase()
      const idText = String(item.id).toLowerCase()
      return (
        titleText.includes(search) ||
        customerText.includes(search) ||
        codeText.includes(search) ||
        idText.includes(search)
      )
    })
  }

  if (status && status !== 'all') {
    list = list.filter(item => item.status === status)
  }

  if (priority && priority !== 'all') {
    list = list.filter(item => item.priority === priority)
  }

  if (assignee && assignee !== 'all') {
    if (assignee === 'unassigned') {
      list = list.filter(item => !item.assignee || item.assignee === 'Не назначен')
    } else {
      list = list.filter(item => item.assignee === assignee)
    }
  }

  // сортировка списка заявок
  if (sort === 'oldest') {
    list.sort((a, b) => Number(a.id) - Number(b.id))
  } else if (sort === 'priority') {
    list.sort((a, b) => {
      const rankB = b.priority ? PRIORITY_RANK[b.priority] : 0
      const rankA = a.priority ? PRIORITY_RANK[a.priority] : 0
      return rankB - rankA
    })
  } else {
    list.sort((a, b) => Number(b.id) - Number(a.id))
  }

  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * limit
  const items = list.slice(start, start + limit)

  const hasPartialDataInPage = items.some(
    item => !item.title?.trim() || !item.customer?.trim()
  )

  return {
    items,
    total,
    page: safePage,
    limit,
    totalPages,
    hasPartialDataInPage,
    metrics: {
      newCount: 6,
      inProgressCount: 4,
      waitingCount: 4,
      resolvedCount: 2
    }
  }
})
