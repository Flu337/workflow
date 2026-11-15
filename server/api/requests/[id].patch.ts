import { SERVER_REQUESTS_DB } from '../../utils/db'
import {
  PRIORITY_LABELS,
  PRIORITY_DUE_DATES,
  STATUS_LABELS,
  type UpdateRequestPayloadDto,
  type UpdateRequestResponseDto
} from '~/types/workflow'

export default defineEventHandler(async (event): Promise<UpdateRequestResponseDto> => {
  const rawId = getRouterParam(event, 'id') || ''
  const cleanId = rawId.replace(/^#/, '')
  const body = await readBody<UpdateRequestPayloadDto>(event)

  // симуляция конфликта изменения другим сотрудником http 409 или ошибки сервера http 500
  if (body?.simulateError === '409') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      message: 'Заявка была изменена другим сотрудником. Предыдущее значение восстановлено. Обновите данные и попробуйте снова.'
    })
  }

  if (body?.simulateError === '500') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Временная ошибка сервера (500) при сохранении изменений.'
    })
  }

  const found = SERVER_REQUESTS_DB.find(
    item => String(item.id) === cleanId || item.code === `#${cleanId}`
  )

  if (!found) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `Заявка #${cleanId} не найдена`
    })
  }

  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  const actor = body?.actorName?.trim() || 'Оператор'

  let updatedField: 'priority' | 'status' | 'assignee' = 'priority'
  let message = 'Изменения сохранены'

  if (!found.timeline) {
    found.timeline = []
  }

  if (body?.priority && body.priority !== found.priority) {
    found.priority = body.priority
    found.dueAt = body.dueAt || PRIORITY_DUE_DATES[body.priority]
    updatedField = 'priority'
    message = `Приоритет изменён на «${PRIORITY_LABELS[body.priority]}»`
    found.timeline.push({
      id: `t-${cleanId}-${Date.now()}-p`,
      time: timeStr,
      text: `${actor} изменил приоритет на «${PRIORITY_LABELS[body.priority]}»`
    })
  } else if (body?.priority) {
    found.priority = body.priority
    if (body.dueAt) {
      found.dueAt = body.dueAt
    }
    updatedField = 'priority'
    message = `Приоритет изменён на «${PRIORITY_LABELS[body.priority]}»`
  }

  if (body?.status && body.status !== found.status) {
    found.status = body.status
    updatedField = 'status'
    message = `Статус изменён на «${STATUS_LABELS[body.status]}»`
    found.timeline.push({
      id: `t-${cleanId}-${Date.now()}-s`,
      time: timeStr,
      text: `${actor} изменил статус на «${STATUS_LABELS[body.status]}»`
    })
  }

  if (typeof body?.assignee === 'string' && body.assignee !== found.assignee) {
    found.assignee = body.assignee
    updatedField = 'assignee'
    message =
      body.assignee === 'Не назначен'
        ? 'Исполнитель снят с заявки'
        : `Назначен исполнитель ${body.assignee}`
    found.timeline.push({
      id: `t-${cleanId}-${Date.now()}-a`,
      time: timeStr,
      text:
        body.assignee === 'Не назначен'
          ? `${actor} снял исполнителя`
          : `${actor} назначил исполнителя: ${body.assignee}`
    })
  }

  return {
    item: found,
    updatedField,
    message
  }
})
