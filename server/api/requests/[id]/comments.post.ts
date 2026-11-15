import { SERVER_REQUESTS_DB } from '../../../utils/db'
import { requireAuthUser } from '../../../utils/auth'
import { canUserAccessRequest } from '../../../../shared/utils/permissions'
import { addCommentInputSchema } from '../../../../shared/utils/validation'
import type { AddCommentResponseDto, RequestCommentDto } from '../../../../shared/types/workflow'

export default defineEventHandler(async (event): Promise<AddCommentResponseDto> => {
  const user = requireAuthUser(event)
  const rawId = getRouterParam(event, 'id') || ''
  const cleanId = rawId.replace(/^#/, '')
  const rawBody = await readBody<Record<string, unknown>>(event)

  // небольшая пауза для отображения индикатора отправки комментария в интерфейсе
  await new Promise(resolve => setTimeout(resolve, 350))

  if (rawBody?.simulateError === '500') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Не удалось отправить комментарий из-за временной ошибки сервера.'
    })
  }

  const parsed = addCommentInputSchema.safeParse(rawBody)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: parsed.error.message
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

  if (!canUserAccessRequest(user, found)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Нет доступа к комментированию чужой заявки.'
    })
  }

  const author = parsed.data.author?.trim() || user.name
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`

  const newComment: RequestCommentDto = {
    id: `c-${cleanId}-${Date.now()}`,
    requestId: cleanId,
    authorId: user.id,
    author,
    time: timeStr,
    text: parsed.data.text
  }

  if (!found.comments) {
    found.comments = []
  }
  found.comments.push(newComment)

  if (!found.timeline) {
    found.timeline = []
  }
  found.timeline.push({
    id: `t-${cleanId}-${Date.now()}-c`,
    time: timeStr,
    text: `${author.split(' ')[0]} добавил(а) комментарий`
  })

  return {
    item: found,
    comment: newComment,
    message: 'Комментарий отправлен'
  }
})
