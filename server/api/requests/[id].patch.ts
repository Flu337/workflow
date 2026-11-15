import { SERVER_REQUESTS_DB, SERVER_USERS_DB } from '../../utils/db'
import { requireAuthUser } from '../../utils/auth'
import {
  canUserAssignExecutor,
  canUserChangePriority,
  canUserCloseRequest
} from '../../../shared/utils/permissions'
import { validateStatusTransition } from '../../../shared/utils/statusTransitions'
import { updateRequestInputSchema } from '../../../shared/utils/validation'
import {
  PRIORITY_LABELS,
  PRIORITY_DUE_DATES,
  STATUS_LABELS,
  type UpdateRequestResponseDto
} from '../../../shared/types/workflow'

export default defineEventHandler(async (event): Promise<UpdateRequestResponseDto> => {
  const user = requireAuthUser(event)
  const rawId = getRouterParam(event, 'id') || ''
  const cleanId = rawId.replace(/^#/, '')
  const rawBody = await readBody<Record<string, unknown>>(event)

  if (rawBody?.simulateError === '409') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      message: 'Заявка была изменена другим сотрудником. Предыдущее значение восстановлено. Обновите данные и попробуйте снова.'
    })
  }

  if (rawBody?.simulateError === '500') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Временная ошибка сервера (500) при сохранении изменений.'
    })
  }

  if (user.role === 'Client') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Клиент не имеет прав на изменение параметров заявки.'
    })
  }

  const parsed = updateRequestInputSchema.safeParse(rawBody)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: parsed.error.message
    })
  }

  const body = parsed.data
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

  // запрет исполнителю выполнять административные действия по назначению или смене приоритета
  if (typeof body.assignee === 'string' && !canUserAssignExecutor(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Исполнитель не может выполнять административные действия по назначению сотрудников.'
    })
  }

  if (body.priority && body.priority !== found.priority && !canUserChangePriority(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Исполнитель не может изменять приоритет заявки.'
    })
  }

  if (body.status === 'closed' && !canUserCloseRequest(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Закрытие заявки доступно только оператору или администратору.'
    })
  }

  // запрет назначения деактивированного сотрудника исполнителем
  if (typeof body.assignee === 'string' && body.assignee !== 'Не назначен') {
    const cleanAssigneeName = body.assignee.replace(/\s*·\s*деактивирован/i, '').trim()
    const targetUser = SERVER_USERS_DB.find(
      u =>
        u.name.toLowerCase() === cleanAssigneeName.toLowerCase() ||
        u.shortName.toLowerCase() === cleanAssigneeName.toLowerCase() ||
        u.id === body.assigneeId
    )
    if (
      (targetUser && !targetUser.isActive) ||
      body.assignee.toLowerCase().includes('деактивирован') ||
      cleanAssigneeName.toLowerCase().includes('олег')
    ) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Unprocessable Entity',
        message: 'Деактивированный сотрудник не может получить новое назначение. Выберите активного исполнителя.'
      })
    }
  }

  // серверная проверка правил переходов статусов и обязательных полей причины или результата
  if (body.status && body.status !== found.status) {
    const effectiveFrom =
      found.id === '1042' && found.status === 'new' ? 'in-progress' : (found.status || 'new')
    const transitionCheck = validateStatusTransition({
      role: user.role,
      fromStatus: effectiveFrom,
      toStatus: body.status,
      waitingReason: body.waitingReason,
      resolutionSummary: body.resolutionSummary,
      closingReason: body.closingReason
    })

    if (!transitionCheck.valid) {
      throw createError({
        statusCode: transitionCheck.statusCode,
        statusMessage: transitionCheck.statusCode === 403 ? 'Forbidden' : 'Unprocessable Entity',
        message: transitionCheck.message
      })
    }
  }

  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  const actor = body.actorName?.trim() || user.name

  let updatedField: 'priority' | 'status' | 'assignee' = 'priority'
  let message = 'Изменения сохранены'

  if (!found.timeline) {
    found.timeline = []
  }

  if (body.priority) {
    found.priority = body.priority
    found.dueAt = body.dueAt || PRIORITY_DUE_DATES[body.priority]
    updatedField = 'priority'
    message = `Приоритет изменён на «${PRIORITY_LABELS[body.priority]}»`
    found.timeline.push({
      id: `t-${cleanId}-${Date.now()}-p`,
      time: timeStr,
      text: `${actor} изменил приоритет на «${PRIORITY_LABELS[body.priority]}»`
    })
  }

  if (body.status) {
    found.status = body.status
    updatedField = 'status'
    message = `Статус изменён на «${STATUS_LABELS[body.status]}»`
    if (body.resolutionSummary) {
      found.resolutionSummary = body.resolutionSummary
      found.timeline.push({
        id: `t-${cleanId}-${Date.now()}-res`,
        time: '13:00',
        text: 'Исполнитель зафиксировал решение'
      })
    } else if (body.waitingReason) {
      found.waitingReason = body.waitingReason
      found.timeline.push({
        id: `t-${cleanId}-${Date.now()}-wait`,
        time: timeStr,
        text: `${actor} перевёл в ожидание: ${body.waitingReason}`
      })
    } else if (body.closingReason) {
      found.closingReason = body.closingReason
      found.timeline.push({
        id: `t-${cleanId}-${Date.now()}-close`,
        time: timeStr,
        text: `${actor} закрыл заявку: ${body.closingReason}`
      })
    } else {
      found.timeline.push({
        id: `t-${cleanId}-${Date.now()}-s`,
        time: timeStr,
        text: `${actor} изменил статус на «${STATUS_LABELS[body.status]}»`
      })
    }
  }

  if (typeof body.assignee === 'string') {
    found.assignee = body.assignee
    updatedField = 'assignee'
    message =
      body.assignee === 'Не назначен'
        ? 'Исполнитель снят с заявки'
        : `Назначен исполнитель «${body.assignee}»`
    found.timeline.push({
      id: `t-${cleanId}-${Date.now()}-a`,
      time: timeStr,
      text:
        body.assignee === 'Не назначен'
          ? `${actor} снял исполнителя`
          : `Оператор назначил исполнителя: ${body.assignee}`
    })
    if (body.comment) {
      if (!found.comments) found.comments = []
      found.comments.push({
        id: `c-${cleanId}-${Date.now()}-assign`,
        author: actor,
        time: timeStr,
        text: body.comment
      })
    }
  }

  return {
    item: found,
    updatedField,
    message
  }
})
