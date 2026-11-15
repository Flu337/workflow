import { SERVER_REQUESTS_DB } from '../../utils/db'
import type { RequestDetailResponseDto, RequestItemDto } from '~/types/workflow'

export default defineEventHandler((event): RequestDetailResponseDto => {
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
    comments: found.comments ? [...found.comments] : [],
    timeline: found.timeline ? [...found.timeline] : []
  }

  // режим проверки длинного названия и длинного имени исполнителя из макета
  if (longMode === '1' || longMode === 'true') {
    itemCopy.title =
      'После обновления корпоративной CRM сотрудники отдела продаж не могут войти в систему и открыть карточки клиентов'
    itemCopy.assignee = 'Александра Константиновна Рождественская-Соколова'
    itemCopy.status = 'in-progress'
  }

  return {
    item: itemCopy
  }
})
