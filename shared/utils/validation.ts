import type { RequestPriority, RequestStatus } from '../types/workflow'

export interface ValidationIssue {
  field: string
  message: string
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: ValidationIssue[]; message: string } }

export interface SchemaValidator<T> {
  safeParse: (input: unknown) => SafeParseResult<T>
  parse: (input: unknown) => T
}

function createSchema<T>(
  validator: (input: Record<string, unknown>) => ValidationIssue[] | { data: T }
): SchemaValidator<T> {
  return {
    safeParse(input: unknown): SafeParseResult<T> {
      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return {
          success: false,
          error: {
            issues: [{ field: 'body', message: 'Некорректный формат входных данных' }],
            message: 'Некорректный формат входных данных'
          }
        }
      }
      const res = validator(input as Record<string, unknown>)
      if (Array.isArray(res)) {
        return {
          success: false,
          error: {
            issues: res,
            message: res[0]?.message || 'Ошибка валидации входных данных'
          }
        }
      }
      return {
        success: true,
        data: res.data
      }
    },
    parse(input: unknown): T {
      const parsed = this.safeParse(input)
      if (!parsed.success) {
        throw new Error(parsed.error.message)
      }
      return parsed.data
    }
  }
}

const VALID_PRIORITIES: RequestPriority[] = ['critical', 'high', 'normal', 'low']
const VALID_STATUSES: RequestStatus[] = [
  'new',
  'assigned',
  'in-progress',
  'waiting',
  'escalated',
  'resolved',
  'closed'
]

// типобезопасные схемы валидации входных данных в стиле zod
export const loginInputSchema = createSchema<{ email: string; password: string }>((raw) => {
  const issues: ValidationIssue[] = []
  const email = typeof raw.email === 'string' ? raw.email.trim() : ''
  const password = typeof raw.password === 'string' ? raw.password : ''

  if (!email || !email.includes('@')) {
    issues.push({ field: 'email', message: 'Укажите корректный адрес электронной почты.' })
  }
  if (!password || password.length < 4) {
    issues.push({ field: 'password', message: 'Пароль должен содержать не менее 4 символов.' })
  }

  if (issues.length > 0) return issues
  return { data: { email, password } }
})

export const registerInputSchema = createSchema<{
  name: string
  company: string
  email: string
  password: string
}>((raw) => {
  const issues: ValidationIssue[] = []
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const company = typeof raw.company === 'string' ? raw.company.trim() : ''
  const email = typeof raw.email === 'string' ? raw.email.trim() : ''
  const password = typeof raw.password === 'string' ? raw.password : ''

  if (!name || name.length < 2) {
    issues.push({ field: 'name', message: 'Укажите имя и фамилию.' })
  }
  if (!company || company.length < 2) {
    issues.push({ field: 'company', message: 'Укажите название компании.' })
  }
  if (!email || !email.includes('@')) {
    issues.push({ field: 'email', message: 'Укажите корректный адрес электронной почты.' })
  }
  if (!password || password.length < 6) {
    issues.push({ field: 'password', message: 'Пароль должен содержать не менее 6 символов.' })
  }

  if (issues.length > 0) return issues
  return { data: { name, company, email, password } }
})

export const createRequestInputSchema = createSchema<{
  title: string
  customer?: string
  category: string
  priority: RequestPriority
  description: string
  authorName?: string
  simulateError?: '401' | '409' | '500' | ''
}>((raw) => {
  const issues: ValidationIssue[] = []
  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  const customer = typeof raw.customer === 'string' ? raw.customer.trim() : undefined
  const category =
    typeof raw.category === 'string' && raw.category.trim()
      ? raw.category.trim()
      : 'Доступ и учётные записи'
  const priorityRaw = typeof raw.priority === 'string' ? (raw.priority as RequestPriority) : 'high'
  const description = typeof raw.description === 'string' ? raw.description.trim() : ''
  const authorName = typeof raw.authorName === 'string' ? raw.authorName.trim() : undefined

  if (!title) {
    issues.push({ field: 'title', message: 'Укажите название заявки.' })
  }
  if (!description) {
    issues.push({ field: 'description', message: 'Опишите проблему.' })
  }
  if (!VALID_PRIORITIES.includes(priorityRaw)) {
    issues.push({ field: 'priority', message: 'Некорректный приоритет заявки.' })
  }

  if (issues.length > 0) return issues
  return {
    data: {
      title,
      customer,
      category,
      priority: priorityRaw,
      description,
      authorName,
      simulateError:
        raw.simulateError === '401' || raw.simulateError === '409' || raw.simulateError === '500'
          ? raw.simulateError
          : ''
    }
  }
})

export const updateRequestInputSchema = createSchema<{
  status?: RequestStatus
  priority?: RequestPriority
  assignee?: string
  assigneeId?: string
  dueAt?: string
  actorName?: string
  comment?: string
  waitingReason?: string
  resolutionSummary?: string
  closingReason?: string
  simulateError?: '409' | '500' | ''
}>((raw) => {
  const issues: ValidationIssue[] = []
  const status =
    typeof raw.status === 'string' && raw.status
      ? (raw.status as RequestStatus)
      : undefined
  const priority =
    typeof raw.priority === 'string' && raw.priority
      ? (raw.priority as RequestPriority)
      : undefined

  if (status && !VALID_STATUSES.includes(status)) {
    issues.push({ field: 'status', message: 'Недопустимое значение статуса заявки.' })
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    issues.push({ field: 'priority', message: 'Недопустимое значение приоритета заявки.' })
  }

  if (issues.length > 0) return issues

  return {
    data: {
      status,
      priority,
      assignee: typeof raw.assignee === 'string' ? raw.assignee.trim() : undefined,
      assigneeId: typeof raw.assigneeId === 'string' ? raw.assigneeId.trim() : undefined,
      dueAt: typeof raw.dueAt === 'string' ? raw.dueAt.trim() : undefined,
      actorName: typeof raw.actorName === 'string' ? raw.actorName.trim() : undefined,
      comment: typeof raw.comment === 'string' ? raw.comment.trim() : undefined,
      waitingReason: typeof raw.waitingReason === 'string' ? raw.waitingReason.trim() : undefined,
      resolutionSummary:
        typeof raw.resolutionSummary === 'string' ? raw.resolutionSummary.trim() : undefined,
      closingReason: typeof raw.closingReason === 'string' ? raw.closingReason.trim() : undefined,
      simulateError:
        raw.simulateError === '409' || raw.simulateError === '500' ? raw.simulateError : ''
    }
  }
})

export const addCommentInputSchema = createSchema<{
  requestId?: string
  author?: string
  text: string
  idempotencyKey?: string
  simulateError?: '500' | ''
}>((raw) => {
  const issues: ValidationIssue[] = []
  const text = typeof raw.text === 'string' ? raw.text.trim() : ''

  if (!text) {
    issues.push({ field: 'text', message: 'Текст комментария не может быть пустым.' })
  }

  if (issues.length > 0) return issues
  return {
    data: {
      requestId: typeof raw.requestId === 'string' ? raw.requestId.trim() : undefined,
      author: typeof raw.author === 'string' ? raw.author.trim() : undefined,
      text,
      idempotencyKey:
        typeof raw.idempotencyKey === 'string' && raw.idempotencyKey.trim()
          ? raw.idempotencyKey.trim()
          : undefined,
      simulateError: raw.simulateError === '500' ? '500' : ''
    }
  }
})
