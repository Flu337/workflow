import { SERVER_REQUESTS_DB } from '../../utils/db'
import { requireAuthUser } from '../../utils/auth'
import { canUserAccessRequest } from '../../../shared/utils/permissions'
import type { RequestDetailResponseDto, RequestItemDto } from '../../../shared/types/workflow'

export default defineEventHandler((event): RequestDetailResponseDto => {
  const user = requireAuthUser(event)
  const rawId = String(getRouterParam(event, 'id') || '').replace(/^#/, '')
  const query = getQuery(event)
  const simulateError = String(query.simulateError || '').trim()
  const longMode = String(query.long || '').trim()

  if (simulateError === '429' || rawId === 'error-429' || rawId === '429') {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Слишком много запросов (HTTP 429). Проверьте соединение и повторите загрузку.'
    })
  }

  if (simulateError === '500' || rawId === 'error-500' || rawId === '500') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Проверьте соединение и повторите загрузку.'
    })
  }

  const found = SERVER_REQUESTS_DB.find(
    item => item.id === rawId || item.code === `#${rawId}`
  )

  if (!found) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Заявка не найдена'
    })
  }

  const itemCopy: RequestItemDto = {
    ...found,
    attachments: found.attachments ? [...found.attachments] : [],
    comments: found.comments ? [...found.comments] : [],
    timeline: found.timeline ? [...found.timeline] : []
  }

  if (itemCopy.id === '1042') {
    if (itemCopy.status === 'new') {
      itemCopy.status = 'in-progress'
    }
    if (!itemCopy.assignee || itemCopy.assignee === 'Не назначен' || itemCopy.assignee === 'Брунгильда Б.') {
      itemCopy.assignee = 'Брунгильда Брунгильдовна'
    }
  }

  // запрет клиенту получать чужую заявку прямым вызовом api
  if (!canUserAccessRequest(user, itemCopy)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Эта страница недоступна вашей роли. Клиент не может просматривать чужую заявку.'
    })
  }

  if (longMode === '1' || longMode === 'true') {
    itemCopy.title =
      'После обновления корпоративной CRM сотрудники отдела продаж не могут войти в систему и открыть карточки клиентов'
    itemCopy.assignee = 'Александра Константиновна Рождественская-Соколова'
    itemCopy.status = 'in-progress'
  }

  const hasIncompleteData = !itemCopy.title?.trim() || !itemCopy.customer?.trim()

  return {
    item: itemCopy,
    hasIncompleteData
  }
})
