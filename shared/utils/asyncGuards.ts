// утилита защиты от гонки асинхронных поисковых запросов и двойной отправки

export interface SearchRaceGuard {
  nextRequest: () => { requestId: number; signal: AbortSignal }
  isLatest: (requestId: number) => boolean
  abortCurrent: () => void
  getLatestRequestId: () => number
}

// создаёт контроллер актуальности поисковых запросов с отменой устаревших ответов
export function createSearchRaceGuard(): SearchRaceGuard {
  let latestRequestId = 0
  let currentController: AbortController | null = null

  return {
    nextRequest() {
      if (currentController) {
        currentController.abort()
      }
      latestRequestId += 1
      currentController = new AbortController()
      return {
        requestId: latestRequestId,
        signal: currentController.signal
      }
    },
    isLatest(requestId: number): boolean {
      return requestId === latestRequestId && !(currentController?.signal.aborted ?? false)
    },
    abortCurrent() {
      if (currentController) {
        currentController.abort()
        currentController = null
      }
    },
    getLatestRequestId() {
      return latestRequestId
    }
  }
}

export interface SubmissionLock {
  acquire: () => string | null
  release: () => void
  isLocked: () => boolean
  getActiveKey: () => string | null
}

// создаёт синхронную блокировку отправки комментария или формы с ключом идемпотентности
export function createSubmissionLock(): SubmissionLock {
  let locked = false
  let activeKey: string | null = null

  return {
    acquire(): string | null {
      if (locked) {
        return null
      }
      locked = true
      activeKey = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      return activeKey
    },
    release() {
      locked = false
      activeKey = null
    },
    isLocked(): boolean {
      return locked
    },
    getActiveKey(): string | null {
      return activeKey
    }
  }
}
