import { SERVER_REQUESTS_DB } from '../../utils/db'
import { PRIORITY_DUE_DATES, type CreateRequestPayloadDto, type RequestItemDto } from '~/types/workflow'

export default defineEventHandler(async (event): Promise<{ item: RequestItemDto }> => {
  const body = await readBody<CreateRequestPayloadDto>(event)

  const maxId = SERVER_REQUESTS_DB.reduce(
    (acc, item) => Math.max(acc, Number(item.id) || 1042),
    1042
  )
  const nextId = String(maxId + 1)

  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  const authorFirst = (body?.authorName || 'Анна').trim().split(' ')[0] || 'Анна'
  const priority = body?.priority || 'normal'

  const newItem: RequestItemDto = {
    id: nextId,
    code: `#${nextId}`,
    title: body?.title?.trim() || 'Без названия',
    customer: body?.customer?.trim() || 'Клиент не указан',
    assignee: 'Не назначен',
    status: 'new',
    priority,
    category: body?.category?.trim() || 'Доступ и учётные записи',
    createdAt: `Создана сегодня, ${timeStr}`,
    dueAt: PRIORITY_DUE_DATES[priority],
    description:
      body?.description?.trim() || 'Описание проблемы добавлено при создании заявки.',
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
