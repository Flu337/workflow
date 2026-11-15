import { SERVER_REQUESTS_DB } from '../../utils/db'
import { requireAuthUser } from '../../utils/auth'
import { canUserCreateRequest } from '../../../shared/utils/permissions'
import { createRequestInputSchema } from '../../../shared/utils/validation'
import { PRIORITY_DUE_DATES, type RequestItemDto } from '../../../shared/types/workflow'

export default defineEventHandler(async (event): Promise<{ item: RequestItemDto }> => {
  const user = requireAuthUser(event)

  if (!canUserCreateRequest(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Исполнитель не может создавать новые клиентские заявки.'
    })
  }

  const rawBody = await readBody<Record<string, unknown>>(event)
  const parsed = createRequestInputSchema.safeParse(rawBody)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: parsed.error.message
    })
  }

  const body = parsed.data
  const maxId = SERVER_REQUESTS_DB.reduce(
    (acc, item) => Math.max(acc, Number(item.id) || 1042),
    1042
  )
  const nextId = String(maxId + 1)

  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  const authorFirst = (body.authorName || user.name || 'Мария').trim().split(' ')[0] || 'Мария'
  const customerName =
    user.role === 'Client' ? user.company : body.customer || 'АО «Вектор»'

  const newItem: RequestItemDto = {
    id: nextId,
    code: `#${nextId}`,
    title: body.title,
    customer: customerName,
    createdByUserId: user.id,
    assignee: 'Не назначен',
    status: 'new',
    priority: body.priority,
    category: body.category,
    createdAt: `Создана сегодня, ${timeStr}`,
    dueAt: PRIORITY_DUE_DATES[body.priority],
    description: body.description,
    comments: [],
    timeline: [
      {
        id: `t-${nextId}-1`,
        time: timeStr,
        text: `${authorFirst} создал(а) заявку`
      }
    ]
  }

  SERVER_REQUESTS_DB.unshift(newItem)

  return {
    item: newItem
  }
})
