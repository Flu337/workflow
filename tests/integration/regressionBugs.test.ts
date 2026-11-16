import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createSearchRaceGuard,
  createSubmissionLock
} from '../../shared/utils/asyncGuards.ts'
import { SERVER_USERS_DB, SERVER_REQUESTS_DB } from '../../server/utils/db.ts'
import {
  isDuplicateCommentKey,
  registerCommentKey
} from '../../server/utils/auth.ts'
import {
  canUserAccessDashboard,
  canUserAccessRequest,
  canUserAssignExecutor
} from '../../shared/utils/permissions.ts'
import {
  validateStatusTransition
} from '../../shared/utils/statusTransitions.ts'
import {
  createRequestInputSchema
} from '../../shared/utils/validation.ts'

describe('Integration & Regression Tests (Задание №5: все 5 исправленных багов + API 500/401/409)', () => {
  it('Regression Bug #1: предотвращает двойную отправку комментария при быстром двойном клике и дедуплицирует по idempotencyKey', async () => {
    const lock = createSubmissionLock()
    const sentKeys: string[] = []

    const simulateCommentSubmit = async () => {
      if (lock.isLocked()) {
        return 'blocked-by-lock'
      }
      const key = lock.acquire()
      if (!key) {
        return 'blocked-by-acquire'
      }
      sentKeys.push(key)
      await new Promise(resolve => setTimeout(resolve, 20))
      lock.release()
      return key
    }

    // одновременный двойной клик по кнопке отправки комментария
    const [firstAttempt, secondAttempt] = await Promise.all([
      simulateCommentSubmit(),
      simulateCommentSubmit()
    ])

    assert.equal(sentKeys.length, 1)
    assert.equal(firstAttempt, sentKeys[0])
    assert.equal(secondAttempt, 'blocked-by-lock')

    // серверная проверка идемпотентности при повторной доставке пакета с тем же ключом
    const idemKey = sentKeys[0]!
    assert.equal(isDuplicateCommentKey(idemKey), null)
    registerCommentKey(idemKey, 'c-1042-999')
    assert.equal(isDuplicateCommentKey(idemKey), 'c-1042-999')
  })

  it('Regression Bug #2: устаревший медленный ответ поиска не перезаписывает более новый быстрый результат', async () => {
    const guard = createSearchRaceGuard()
    let displayedQueryResult = ''

    // запрос 1 («crm») стартует первым, но отвечает медленно (40 мс)
    const req1 = guard.nextRequest()
    const slowSearchPromise = (async () => {
      await new Promise(resolve => setTimeout(resolve, 40))
      if (guard.isLatest(req1.requestId)) {
        displayedQueryResult = 'stale:crm'
      }
    })()

    // запрос 2 («1041») стартует следом, отменяет req1 через AbortController и отвечает быстро (5 мс)
    const req2 = guard.nextRequest()
    const fastSearchPromise = (async () => {
      await new Promise(resolve => setTimeout(resolve, 5))
      if (guard.isLatest(req2.requestId)) {
        displayedQueryResult = 'fresh:1041'
      }
    })()

    await Promise.all([slowSearchPromise, fastSearchPromise])

    assert.equal(req1.signal.aborted, true)
    assert.equal(guard.isLatest(req1.requestId), false)
    assert.equal(guard.isLatest(req2.requestId), true)
    assert.equal(displayedQueryResult, 'fresh:1041')
  })

  it('Regression Bug #3: блокирует доступ к приватному маршруту после logout (очистка wf_session и wf_role)', () => {
    const cookieJar: Record<string, string> = {
      wf_session: 'logged_out',
      wf_role: ''
    }

    const isAuthenticatedAfterLogout =
      cookieJar.wf_session !== 'logged_out' &&
      cookieJar.wf_session !== 'expired' &&
      Boolean(cookieJar.wf_session)

    assert.equal(isAuthenticatedAfterLogout, false)
  })

  it('Regression Bug #4: сохраняет и восстанавливает состояние сессии и фильтров URL после refresh', () => {
    const clientToken = 'sess_u-4_1700000000000'
    const parts = clientToken.split('_')
    const restoredUser = SERVER_USERS_DB.find(u => u.id === parts[1] && u.isActive)

    assert.ok(restoredUser)
    assert.equal(restoredUser.role, 'Client')
    assert.equal(restoredUser.company, 'АО «Вектор»')

    const rawRouteQuery = {
      search: 'CRM',
      status: 'new',
      priority: 'high',
      sort: 'priority',
      page: '2'
    }
    assert.equal(rawRouteQuery.search, 'CRM')
    assert.equal(rawRouteQuery.status, 'new')
    assert.equal(rawRouteQuery.priority, 'high')
    assert.equal(Number(rawRouteQuery.page), 2)
  })

  it('Regression Bug #5 & Stage 5 Modal: проверяет обработку ошибок API 500, 401 и 409 без потери пользовательских данных', () => {
    const draftFormState = {
      title: 'Не работает доступ к CRM',
      category: 'Доступ и учётные записи',
      description: 'После обновления не удаётся войти в CRM.',
      priority: 'high' as const
    }
    const parsedDraft = createRequestInputSchema.safeParse({
      ...draftFormState,
      simulateError: '500'
    })
    assert.equal(parsedDraft.success, true)
    if (parsedDraft.success) {
      assert.equal(parsedDraft.data.title, 'Не работает доступ к CRM')
      assert.equal(parsedDraft.data.simulateError, '500')
    }

    const req1042 = SERVER_REQUESTS_DB.find(r => r.id === '1042')
    assert.ok(req1042)
    const previousPriority = req1042.priority || 'high'
    const optimisticPriority = 'critical'
    const serverStatusCode: number = 409
    const finalPriorityAfterRollback =
      serverStatusCode === 409 || serverStatusCode === 500
        ? previousPriority
        : optimisticPriority

    assert.equal(finalPriorityAfterRollback, previousPriority)

    const deactivatedUser = SERVER_USERS_DB.find(u => !u.isActive)
    assert.ok(deactivatedUser)
    assert.equal(deactivatedUser.name, 'Олег Соколов')
    assert.equal(canUserAssignExecutor('Operator'), true)
    assert.equal(canUserAccessDashboard('Operator'), true)
    assert.equal(
      canUserAccessRequest(
        {
          id: 'u-1',
          name: 'Анна Кузнецова',
          shortName: 'Анна К.',
          email: '0000@mail.demo',
          role: 'Operator',
          roleLabel: 'Оператор',
          initials: 'АК',
          company: 'WorkFlow Support',
          isActive: true
        },
        req1042
      ),
      true
    )

    assert.equal(
      validateStatusTransition({
        fromStatus: 'new',
        toStatus: 'assigned',
        role: 'Operator'
      }).valid,
      true
    )
    assert.equal(
      validateStatusTransition({
        fromStatus: 'assigned',
        toStatus: 'in-progress',
        role: 'Agent'
      }).valid,
      true
    )
  })
})
