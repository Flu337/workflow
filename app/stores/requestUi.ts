import { defineStore } from 'pinia'
import {
  PRIORITY_LABELS,
  PRIORITY_DUE_DATES,
  STATUS_LABELS,
  type RequestPriority,
  type RequestStatus,
  type UndoMutationSnapshot,
  type RollbackBannerState,
  type FeedbackBannerState,
  type UpdateRequestResponseDto,
  type WorkFlowRequest
} from '../../shared/types/workflow'
import { useAuthStore } from './auth'

export interface OptimisticRequestOverride {
  priority?: RequestPriority
  status?: RequestStatus
  assignee?: string
  dueAt?: string
}

// глобальное хранилище ui-состояния взаимодействий с заявками для списка и карточки
export const useRequestUiStore = defineStore('requestUi', () => {
  const optimisticOverrides = ref<Record<string, OptimisticRequestOverride>>({})
  const feedbackBanner = ref<FeedbackBannerState | null>(null)
  const lastUndoAction = ref<UndoMutationSnapshot | null>(null)
  const rollbackError = ref<RollbackBannerState | null>(null)
  const simulateMutationError = ref<'none' | '409' | '500'>('none')
  const isMutating = ref<boolean>(false)

  const normalizeId = (rawId: string): string => rawId.replace(/^#/, '')

  const getOverrideForRequest = (rawId: string): OptimisticRequestOverride | undefined => {
    return optimisticOverrides.value[normalizeId(rawId)]
  }

  const applyOverridesToRequest = (item: WorkFlowRequest): WorkFlowRequest => {
    const override = getOverrideForRequest(item.id)
    if (!override) return item
    return {
      ...item,
      priority: override.priority ?? item.priority,
      status: override.status ?? item.status,
      assignee: override.assignee ?? item.assignee,
      dueAt: override.dueAt ?? item.dueAt
    }
  }

  const setOptimisticOverride = (rawId: string, patch: OptimisticRequestOverride) => {
    const cleanId = normalizeId(rawId)
    optimisticOverrides.value = {
      ...optimisticOverrides.value,
      [cleanId]: {
        ...(optimisticOverrides.value[cleanId] || {}),
        ...patch
      }
    }
  }

  const clearOptimisticOverride = (rawId: string) => {
    const cleanId = normalizeId(rawId)
    if (!(cleanId in optimisticOverrides.value)) return
    const next = { ...optimisticOverrides.value }
    delete next[cleanId]
    optimisticOverrides.value = next
  }

  const clearBanners = () => {
    feedbackBanner.value = null
    rollbackError.value = null
  }

  const showCommentSentBanner = (rawId: string) => {
    const cleanId = normalizeId(rawId)
    rollbackError.value = null
    feedbackBanner.value = {
      requestId: cleanId,
      type: 'comment',
      message: 'Комментарий отправлен',
      canUndo: false
    }
  }

  // оптимистичное изменение приоритета с откатом при ошибке 409 или 500
  const changePriorityOptimistic = async (
    currentRequest: WorkFlowRequest,
    nextPriority: RequestPriority,
    actorName = 'Оператор',
    forceErrorCode?: '409' | '500'
  ): Promise<boolean> => {
    const cleanId = normalizeId(currentRequest.id)
    const prevPriority = currentRequest.priority
    const prevDueAt = currentRequest.dueAt
    const nextDueAt = PRIORITY_DUE_DATES[nextPriority]
    const label = PRIORITY_LABELS[nextPriority]
    const message = `Приоритет изменён на «${label}»`

    rollbackError.value = null

    // мгновенное применение нового приоритета в интерфейсе до ответа сервера
    setOptimisticOverride(cleanId, {
      priority: nextPriority,
      dueAt: nextDueAt
    })

    lastUndoAction.value = {
      requestId: cleanId,
      field: 'priority',
      previousValue: prevPriority,
      newValue: nextPriority,
      previousDueAt: prevDueAt,
      newDueAt: nextDueAt,
      bannerMessage: message
    }

    feedbackBanner.value = {
      requestId: cleanId,
      type: 'priority',
      message,
      canUndo: true
    }

    const errorToSimulate =
      forceErrorCode || (simulateMutationError.value !== 'none' ? simulateMutationError.value : '')

    isMutating.value = true
    try {
      await $fetch<UpdateRequestResponseDto>(`/api/requests/${cleanId}`, {
        method: 'PATCH',
        body: {
          priority: nextPriority,
          dueAt: nextDueAt,
          actorName,
          simulateError: errorToSimulate
        }
      })
      return true
    } catch (err) {
      const statusCode =
        (err as { statusCode?: number; status?: number })?.statusCode ||
        (err as { statusCode?: number; status?: number })?.status ||
        500

      // откат к предыдущему значению при ошибке сервера
      setOptimisticOverride(cleanId, {
        priority: prevPriority,
        dueAt: prevDueAt
      })
      feedbackBanner.value = null
      lastUndoAction.value = null

      if (statusCode === 401) {
        const authStore = useAuthStore()
        await authStore.handleUnauthorizedError()
        return false
      }

      const resolvedCode: 409 | 500 = statusCode === 409 ? 409 : 500
      rollbackError.value = {
        requestId: cleanId,
        statusCode: resolvedCode,
        title: 'Изменение не сохранено',
        description:
          resolvedCode === 409
            ? 'Заявка была изменена другим сотрудником. Предыдущее значение восстановлено. Обновите данные и попробуйте снова.'
            : 'Сервер временно недоступен (ошибка 500). Предыдущее значение восстановлено. Обновите данные и попробуйте снова.'
      }
      return false
    } finally {
      isMutating.value = false
    }
  }

  // изменение статуса заявки с поддержкой undo и отката при ошибке
  const changeStatus = async (
    currentRequest: WorkFlowRequest,
    nextStatus: RequestStatus,
    actorName = 'Оператор',
    forceErrorCode?: '409' | '500'
  ): Promise<boolean> => {
    const cleanId = normalizeId(currentRequest.id)
    const prevStatus = currentRequest.status
    const label = STATUS_LABELS[nextStatus]
    const message = `Статус изменён на «${label}»`

    rollbackError.value = null

    setOptimisticOverride(cleanId, {
      status: nextStatus
    })

    lastUndoAction.value = {
      requestId: cleanId,
      field: 'status',
      previousValue: prevStatus,
      newValue: nextStatus,
      previousDueAt: currentRequest.dueAt,
      newDueAt: currentRequest.dueAt,
      bannerMessage: message
    }

    feedbackBanner.value = {
      requestId: cleanId,
      type: 'status',
      message,
      canUndo: true
    }

    const errorToSimulate =
      forceErrorCode || (simulateMutationError.value !== 'none' ? simulateMutationError.value : '')

    isMutating.value = true
    try {
      await $fetch<UpdateRequestResponseDto>(`/api/requests/${cleanId}`, {
        method: 'PATCH',
        body: {
          status: nextStatus,
          actorName,
          simulateError: errorToSimulate
        }
      })
      return true
    } catch (err) {
      const statusCode =
        (err as { statusCode?: number; status?: number })?.statusCode ||
        (err as { statusCode?: number; status?: number })?.status ||
        500

      setOptimisticOverride(cleanId, {
        status: prevStatus
      })
      feedbackBanner.value = null
      lastUndoAction.value = null

      if (statusCode === 401) {
        const authStore = useAuthStore()
        await authStore.handleUnauthorizedError()
        return false
      }

      const resolvedCode: 409 | 500 = statusCode === 409 ? 409 : 500
      rollbackError.value = {
        requestId: cleanId,
        statusCode: resolvedCode,
        title: 'Изменение не сохранено',
        description:
          resolvedCode === 409
            ? 'Заявка была изменена другим сотрудником. Предыдущее значение восстановлено. Обновите данные и попробуйте снова.'
            : 'Сервер временно недоступен (ошибка 500). Предыдущее значение восстановлено. Обновите данные и попробуйте снова.'
      }
      return false
    } finally {
      isMutating.value = false
    }
  }

  // изменение исполнителя заявки с откатом при ошибке api
  const changeAssignee = async (
    currentRequest: WorkFlowRequest,
    nextAssignee: string,
    actorName = 'Оператор',
    forceErrorCode?: '409' | '500'
  ): Promise<boolean> => {
    const cleanId = normalizeId(currentRequest.id)
    const prevAssignee = currentRequest.assignee
    const prevStatus = currentRequest.status
    const nextStatus: RequestStatus =
      currentRequest.status === 'new' && nextAssignee !== 'Не назначен'
        ? 'assigned'
        : currentRequest.status

    rollbackError.value = null

    setOptimisticOverride(cleanId, {
      assignee: nextAssignee,
      status: nextStatus
    })

    feedbackBanner.value = {
      requestId: cleanId,
      type: 'assignee',
      message:
        nextAssignee === 'Не назначен'
          ? 'Исполнитель снят с заявки'
          : `Назначен исполнитель «${nextAssignee}»`,
      canUndo: false
    }

    const errorToSimulate =
      forceErrorCode || (simulateMutationError.value !== 'none' ? simulateMutationError.value : '')

    isMutating.value = true
    try {
      await $fetch<UpdateRequestResponseDto>(`/api/requests/${cleanId}`, {
        method: 'PATCH',
        body: {
          assignee: nextAssignee,
          status: nextStatus,
          actorName,
          simulateError: errorToSimulate
        }
      })
      return true
    } catch (err) {
      const statusCode =
        (err as { statusCode?: number; status?: number })?.statusCode ||
        (err as { statusCode?: number; status?: number })?.status ||
        500

      setOptimisticOverride(cleanId, {
        assignee: prevAssignee,
        status: prevStatus
      })
      feedbackBanner.value = null

      if (statusCode === 401) {
        const authStore = useAuthStore()
        await authStore.handleUnauthorizedError()
        return false
      }

      const resolvedCode: 409 | 500 = statusCode === 409 ? 409 : 500
      rollbackError.value = {
        requestId: cleanId,
        statusCode: resolvedCode,
        title: 'Изменение не сохранено',
        description:
          resolvedCode === 409
            ? 'Заявка была изменена другим сотрудником. Предыдущее значение восстановлено. Обновите данные и попробуйте снова.'
            : 'Сервер временно недоступен (ошибка 500). Предыдущее значение восстановлено. Обновите данные и попробуйте снова.'
      }
      return false
    } finally {
      isMutating.value = false
    }
  }

  // отмена последнего изменения статуса или приоритета undo
  const undoLastChange = async (actorName = 'Оператор'): Promise<boolean> => {
    const snapshot = lastUndoAction.value
    if (!snapshot) return false

    const cleanId = normalizeId(snapshot.requestId)
    lastUndoAction.value = null
    feedbackBanner.value = null
    rollbackError.value = null

    if (snapshot.field === 'priority') {
      const prevPriority = snapshot.previousValue as RequestPriority
      setOptimisticOverride(cleanId, {
        priority: prevPriority,
        dueAt: snapshot.previousDueAt
      })
      try {
        await $fetch<UpdateRequestResponseDto>(`/api/requests/${cleanId}`, {
          method: 'PATCH',
          body: {
            priority: prevPriority,
            dueAt: snapshot.previousDueAt,
            actorName
          }
        })
        return true
      } catch {
        return false
      }
    } else {
      const prevStatus = snapshot.previousValue as RequestStatus
      setOptimisticOverride(cleanId, {
        status: prevStatus
      })
      try {
        await $fetch<UpdateRequestResponseDto>(`/api/requests/${cleanId}`, {
          method: 'PATCH',
          body: {
            status: prevStatus,
            actorName
          }
        })
        return true
      } catch {
        return false
      }
    }
  }

  return {
    optimisticOverrides,
    feedbackBanner,
    lastUndoAction,
    rollbackError,
    simulateMutationError,
    isMutating,
    getOverrideForRequest,
    applyOverridesToRequest,
    setOptimisticOverride,
    clearOptimisticOverride,
    clearBanners,
    showCommentSentBanner,
    changePriorityOptimistic,
    changeStatus,
    changeAssignee,
    undoLastChange
  }
})
