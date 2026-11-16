import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ALLOWED_STATUS_TRANSITIONS,
  getAllowedNextStatuses,
  validateStatusTransition
} from '../../shared/utils/statusTransitions.ts'
import {
  canUserCreateRequest,
  canUserAssignExecutor,
  canUserChangePriority,
  canUserResolveRequest,
  canUserCloseRequest,
  canUserAccessDashboard,
  canUserAccessRequest
} from '../../shared/utils/permissions.ts'
import {
  loginInputSchema,
  registerInputSchema,
  createRequestInputSchema,
  updateRequestInputSchema,
  addCommentInputSchema
} from '../../shared/utils/validation.ts'
import { normalizeRequestItem, normalizeRequestsListResponse } from '../../app/utils/normalizeRequests.ts'

describe('Unit: правила переходов статусов (statusTransitions)', () => {
  it('разрешает корректные переходы в жизненном цикле заявки', () => {
    assert.equal(ALLOWED_STATUS_TRANSITIONS['new'].includes('assigned'), true)
    assert.equal(ALLOWED_STATUS_TRANSITIONS['assigned'].includes('in-progress'), true)
    assert.equal(ALLOWED_STATUS_TRANSITIONS['in-progress'].includes('waiting'), true)
    assert.equal(ALLOWED_STATUS_TRANSITIONS['in-progress'].includes('resolved'), true)
    assert.equal(ALLOWED_STATUS_TRANSITIONS['resolved'].includes('closed'), true)
  })

  it('запрещает недопустимые переходы статусов', () => {
    assert.equal(ALLOWED_STATUS_TRANSITIONS['closed'].includes('waiting'), false)
    assert.equal(ALLOWED_STATUS_TRANSITIONS['resolved'].includes('waiting'), false)
    const invalidJump = validateStatusTransition({
      fromStatus: 'resolved',
      toStatus: 'waiting',
      role: 'Operator',
      waitingReason: 'Ожидание'
    })
    assert.equal(invalidJump.valid, false)
    assert.equal(invalidJump.statusCode, 422)
  })

  it('требует причину ожидания при переходе в waiting', () => {
    const invalid = validateStatusTransition({
      fromStatus: 'in-progress',
      toStatus: 'waiting',
      role: 'Agent',
      waitingReason: '   '
    })
    assert.equal(invalid.valid, false)
    assert.equal(invalid.message, 'Укажите причину ожидания.')

    const valid = validateStatusTransition({
      fromStatus: 'in-progress',
      toStatus: 'waiting',
      role: 'Agent',
      waitingReason: 'Ожидаем логи от клиента'
    })
    assert.equal(valid.valid, true)
  })

  it('требует описание результата решения при переходе в resolved', () => {
    const invalid = validateStatusTransition({
      fromStatus: 'in-progress',
      toStatus: 'resolved',
      role: 'Agent',
      resolutionSummary: ''
    })
    assert.equal(invalid.valid, false)
    assert.equal(invalid.message, 'Опишите результат решения.')
  })

  it('требует причину ручного закрытия при переходе в closed для оператора', () => {
    const invalid = validateStatusTransition({
      fromStatus: 'resolved',
      toStatus: 'closed',
      role: 'Operator',
      closingReason: ''
    })
    assert.equal(invalid.valid, false)
    assert.equal(invalid.message, 'Укажите причину ручного закрытия.')

    const forbiddenForAgent = getAllowedNextStatuses('resolved', 'Agent')
    assert.equal(forbiddenForAgent.includes('closed'), false)
  })
})

describe('Unit: ролевая модель доступа (RBAC permissions)', () => {
  it('проверяет права ролей Client, Operator, Agent, Admin', () => {
    assert.equal(canUserCreateRequest('Client'), true)
    assert.equal(canUserCreateRequest('Operator'), true)
    assert.equal(canUserCreateRequest('Agent'), false)

    assert.equal(canUserAssignExecutor('Operator'), true)
    assert.equal(canUserAssignExecutor('Admin'), true)
    assert.equal(canUserAssignExecutor('Agent'), false)
    assert.equal(canUserAssignExecutor('Client'), false)

    assert.equal(canUserChangePriority('Operator'), true)
    assert.equal(canUserChangePriority('Agent'), false)

    assert.equal(canUserResolveRequest('Agent'), true)
    assert.equal(canUserResolveRequest('Client'), false)

    assert.equal(canUserCloseRequest('Operator'), true)
    assert.equal(canUserCloseRequest('Agent'), false)

    assert.equal(canUserAccessDashboard('Client'), false)
    assert.equal(canUserAccessDashboard('Operator'), true)
  })

  it('запрещает клиенту доступ к чужой заявке', () => {
    const clientUser = {
      id: 'u-4',
      name: 'Мария Смирнова',
      shortName: 'Мария С.',
      email: 'client@mail.demo',
      role: 'Client' as const,
      roleLabel: 'Клиент',
      initials: 'МС',
      company: 'АО «Вектор»',
      isActive: true
    }

    assert.equal(
      canUserAccessRequest(clientUser, { id: '1042', customer: 'АО «Вектор»' }),
      true
    )
    assert.equal(
      canUserAccessRequest(clientUser, { id: '1041', customer: 'ООО «Сфера»' }),
      false
    )
  })
})

describe('Unit: валидация входных данных и нормализация DTO', () => {
  it('валидирует обязательные поля названия и описания при создании заявки (макет 5 этапа)', () => {
    const res = createRequestInputSchema.safeParse({
      title: '   ',
      description: '',
      priority: 'high',
      category: 'Доступ и учётные записи'
    })
    assert.equal(res.success, false)
    if (!res.success) {
      const fields = res.error.issues.map(i => i.field)
      assert.equal(fields.includes('title'), true)
      assert.equal(fields.includes('description'), true)
    }
  })

  it('валидирует схему входа, регистрации, патча и комментария', () => {
    assert.equal(loginInputSchema.safeParse({ email: 'bad', password: '12' }).success, false)
    assert.equal(
      loginInputSchema.safeParse({ email: '0000@mail.demo', password: 'demo1234' }).success,
      true
    )
    assert.equal(
      registerInputSchema.safeParse({
        name: 'Мария Смирнова',
        company: 'АО «Вектор»',
        email: 'client@mail.demo',
        password: 'password123'
      }).success,
      true
    )
    assert.equal(
      updateRequestInputSchema.safeParse({ status: 'in-progress', priority: 'critical' }).success,
      true
    )
    assert.equal(addCommentInputSchema.safeParse({ text: '   ' }).success, false)
  })

  it('нормализует неполные данные заявки #1038 с безопасными fallback-значениями', () => {
    const normalized = normalizeRequestItem({
      id: '1038',
      title: null,
      customer: '',
      status: 'waiting',
      priority: 'normal'
    })
    assert.equal(normalized.title, 'Без названия')
    assert.equal(normalized.customer, 'Клиент не указан')
    assert.equal(normalized.hasMissingData, true)

    const listNormalized = normalizeRequestsListResponse({
      items: [{ id: '1038', title: null, customer: null }],
      total: 1,
      page: 1,
      limit: 12,
      totalPages: 1,
      metrics: { newCount: 1, inProgressCount: 0, waitingCount: 1, resolvedCount: 0 }
    })
    assert.equal(listNormalized.hasIncompleteData, true)
    assert.equal(listNormalized.items.length, 1)
  })
})
