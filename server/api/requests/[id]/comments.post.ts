import { SERVER_REQUESTS_DB } from '../../../utils/db'
import type { AddCommentPayloadDto, AddCommentResponseDto, RequestCommentDto } from '~/types/workflow'

export default defineEventHandler(async (event): Promise<AddCommentResponseDto> => {
  const rawId = getRouterParam(event, 'id') || ''
  const cleanId = rawId.replace(/^#/, '')
  const body = await readBody<AddCommentPayloadDto>(event)

  // небольшая пауза для отображения индикатора отправки комментария в интерфейсе
  await new Promise(resolve => setTimeout(resolve, 350))

  if (body?.simulateError === '500') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Не удалось отправить комментарий из-за временной ошибки сервера.'
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

  const text = (body?.text || '').trim()
  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Текст комментария не может быть пустым'
    })
  }

  const author = (body?.author || '').trim() || 'Брунгильда Брунгильдовна'
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`

  const newComment: RequestCommentDto = {
    id: `c-${cleanId}-${Date.now()}`,
    author,
    time: timeStr,
    text
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
