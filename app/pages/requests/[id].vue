<script setup lang="ts">
import {
  PRIORITY_LABELS,
  type RequestPriority,
  type RequestStatus,
  type RequestDetailResponseDto,
  type AddCommentResponseDto,
  type UserDirectoryItemDto,
  type WorkFlowRequest
} from '~/types/workflow'
import { normalizeRequestItem } from '~/utils/normalizeRequests'
import { usePreferencesStore } from '~/stores/preferences'
import { useRequestUiStore } from '~/stores/requestUi'

const route = useRoute()
const router = useRouter()
const preferencesStore = usePreferencesStore()
const requestUiStore = useRequestUiStore()

const requestId = computed(() => String(route.params.id || '1042').replace(/^#/, ''))

// локальное состояние компонента local state
const demoDetailState = ref<'ready' | 'loading' | 'error'>('ready')
const simulatedErrorCode = ref<string>(
  typeof route.query.simulateError === 'string' ? route.query.simulateError : ''
)
const isLongVariant = ref<boolean>(
  route.query.long === '1' || route.query.long === 'true'
)

const commentText = ref('')
const isSubmittingComment = ref(false)
const commentSendError = ref<string | null>(null)
const simulateCommentError = ref(false)

const detailQuery = computed(() => ({
  simulateError: simulatedErrorCode.value || undefined,
  long: isLongVariant.value ? '1' : undefined
}))

const { data: usersDirectory } = await useFetch<UserDirectoryItemDto[]>('/api/users', {
  key: 'wf-users-directory-detail',
  default: () => []
})

// загрузка деталей заявки с сервера через usefetch server state
const {
  data: rawDetailResponse,
  status: detailStatus,
  error: detailError,
  refresh: refreshDetail
} = await useFetch<RequestDetailResponseDto>(() => `/api/requests/${requestId.value}`, {
  key: `wf-request-detail-${requestId.value}`,
  query: detailQuery,
  watch: [detailQuery, requestId]
})

if (
  detailError.value &&
  (detailError.value as { statusCode?: number }).statusCode === 404 &&
  !simulatedErrorCode.value
) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Страница не найдена'
  })
}

const localNormalized = ref<WorkFlowRequest | null>(null)

watch(
  rawDetailResponse,
  (val) => {
    if (val?.item) {
      localNormalized.value = normalizeRequestItem(val.item)
    }
  },
  { immediate: true }
)

// объединение серверных данных карточки с оптимистичными обновлениями из pinia
const requestItem = computed<WorkFlowRequest | null>(() => {
  if (!localNormalized.value) return null
  return requestUiStore.applyOverridesToRequest(localNormalized.value)
})

const selectedAssignee = ref('Брунгильда Брунгильдовна')
const selectedPriority = ref<RequestPriority>('high')

watch(
  requestItem,
  (val) => {
    if (val) {
      selectedAssignee.value = val.assignee
      selectedPriority.value = val.priority
    }
  },
  { immediate: true }
)

const assigneeOptions = computed(() => {
  const base = [{ label: 'Не назначен', value: 'Не назначен' }]
  const fromApi = (usersDirectory.value || []).map(u => ({
    label: u.name,
    value: u.name
  }))
  if (fromApi.length === 0) {
    return [
      ...base,
      { label: 'Брунгильда Брунгильдовна', value: 'Брунгильда Брунгильдовна' },
      { label: 'Олег Соколов', value: 'Олег Соколов' },
      { label: 'Анна Кузнецова', value: 'Анна Кузнецова' },
      { label: 'Александра Константиновна Рождественская-Соколова', value: 'Александра Константиновна Рождественская-Соколова' }
    ]
  }
  return [...base, ...fromApi]
})

const priorityOptions = [
  { label: 'Критический', value: 'critical' },
  { label: 'Высокий', value: 'high' },
  { label: 'Обычный', value: 'normal' },
  { label: 'Низкий', value: 'low' }
]

const priorityDisplayLabel = computed(() => {
  if (!requestItem.value) return 'Высокий  ▾'
  return `${PRIORITY_LABELS[requestItem.value.priority]}  ▾`
})

const effectiveDetailState = computed<'ready' | 'loading' | 'error'>(() => {
  if (demoDetailState.value !== 'ready') {
    return demoDetailState.value
  }
  if (detailError.value) {
    return 'error'
  }
  if (detailStatus.value === 'pending' && !localNormalized.value) {
    return 'loading'
  }
  return 'ready'
})

const errorStatusCode = computed<number | null>(() => {
  const err = detailError.value as { statusCode?: number; status?: number } | null
  if (err?.statusCode) return err.statusCode
  if (err?.status) return err.status
  if (simulatedErrorCode.value === '429') return 429
  if (simulatedErrorCode.value === '500') return 500
  return null
})

const errorSubtitle = computed(() => {
  if (errorStatusCode.value === 429) {
    return 'Слишком много запросов (HTTP 429). Проверьте соединение и повторите загрузку.'
  }
  return 'Проверьте соединение и повторите загрузку.'
})

const isCommentEmpty = computed(() => !commentText.value.trim())

const nextWorkflowStatus = (current: RequestStatus): RequestStatus => {
  const order: Record<RequestStatus, RequestStatus> = {
    'new': 'in-progress',
    'assigned': 'in-progress',
    'in-progress': 'resolved',
    'waiting': 'in-progress',
    'escalated': 'in-progress',
    'resolved': 'closed',
    'closed': 'in-progress'
  }
  return order[current] || 'in-progress'
}

// отправка комментария на сервер с состояниями отправки и ошибки макеты 6txt 7txt 8txt 9txt
const handleSendComment = async () => {
  if (isCommentEmpty.value || !requestItem.value || isSubmittingComment.value) return
  const textToSend = commentText.value.trim()
  isSubmittingComment.value = true
  commentSendError.value = null
  requestUiStore.clearBanners()

  try {
    const response = await $fetch<AddCommentResponseDto>(
      `/api/requests/${requestId.value}/comments`,
      {
        method: 'POST',
        body: {
          author: 'Брунгильда Брунгильдовна',
          text: textToSend,
          simulateError: simulateCommentError.value ? '500' : ''
        }
      }
    )

    if (response?.item) {
      localNormalized.value = normalizeRequestItem(response.item)
    }
    commentText.value = ''
    requestUiStore.showCommentSentBanner(requestId.value)
  } catch {
    commentSendError.value =
      'Не удалось отправить комментарий. Текст сообщения сохранён — проверьте соединение и попробуйте снова.'
  } finally {
    isSubmittingComment.value = false
  }
}

// оптимистичное изменение приоритета с поддержкой отката при 409 или 500 и отмены через undo макеты 2txt 3txt 5txt
const handlePriorityChange = async (val: string) => {
  if (!requestItem.value) return
  const nextPriority = val as RequestPriority
  commentSendError.value = null
  selectedPriority.value = nextPriority

  const ok = await requestUiStore.changePriorityOptimistic(
    requestItem.value,
    nextPriority,
    preferencesStore.name
  )

  if (!ok && requestItem.value) {
    selectedPriority.value = requestItem.value.priority
  } else {
    await refreshDetail()
  }
}

// изменение исполнителя через серверный patch
const handleAssigneeChange = async (val: string) => {
  if (!requestItem.value) return
  commentSendError.value = null
  selectedAssignee.value = val

  const ok = await requestUiStore.changeAssignee(
    requestItem.value,
    val,
    preferencesStore.name
  )

  if (!ok && requestItem.value) {
    selectedAssignee.value = requestItem.value.assignee
  } else {
    await refreshDetail()
  }
}

// изменение статуса заявки с поддержкой undo
const handleStatusChangeAction = async () => {
  if (!requestItem.value) return
  commentSendError.value = null
  const targetStatus = nextWorkflowStatus(requestItem.value.status)

  const ok = await requestUiStore.changeStatus(
    requestItem.value,
    targetStatus,
    preferencesStore.name
  )

  if (ok) {
    await refreshDetail()
  }
}

// отмена последнего изменения статуса или приоритета undo
const handleUndoChange = async () => {
  await requestUiStore.undoLastChange(preferencesStore.name)
  await refreshDetail()
  if (requestItem.value) {
    selectedPriority.value = requestItem.value.priority
    selectedAssignee.value = requestItem.value.assignee
  }
}

const handleRefreshAfterRollback = async () => {
  requestUiStore.clearBanners()
  commentSendError.value = null
  await refreshDetail()
}

const triggerDemoConflictOnCard = async () => {
  if (!requestItem.value) return
  commentSendError.value = null
  await requestUiStore.changePriorityOptimistic(
    requestItem.value,
    'critical',
    preferencesStore.name,
    '409'
  )
  if (requestItem.value) {
    selectedPriority.value = requestItem.value.priority
  }
}

const triggerDemoCommentError = async () => {
  if (!commentText.value.trim()) {
    commentText.value = 'Уточнила детали заявки.'
  }
  simulateCommentError.value = true
  await handleSendComment()
  simulateCommentError.value = false
}

const setDetailDemoMode = async (
  mode: 'ready' | 'loading' | 'error' | 'long' | '429' | '500'
) => {
  requestUiStore.clearBanners()
  commentSendError.value = null
  if (mode === 'loading') {
    simulatedErrorCode.value = ''
    demoDetailState.value = 'loading'
    return
  }
  if (mode === 'error' || mode === '500') {
    demoDetailState.value = 'ready'
    simulatedErrorCode.value = '500'
    await refreshDetail()
    return
  }
  if (mode === '429') {
    demoDetailState.value = 'ready'
    simulatedErrorCode.value = '429'
    await refreshDetail()
    return
  }
  if (mode === 'long') {
    demoDetailState.value = 'ready'
    simulatedErrorCode.value = ''
    isLongVariant.value = !isLongVariant.value
    await refreshDetail()
    return
  }
  demoDetailState.value = 'ready'
  simulatedErrorCode.value = ''
  isLongVariant.value = false
  await refreshDetail()
}

const handleRetryDetail = async () => {
  demoDetailState.value = 'ready'
  simulatedErrorCode.value = ''
  await refreshDetail()
}

const goBackToList = () => {
  router.push('/requests')
}
</script>

<template>
  <div class="soderzhanie">
    <div class="top-nav-and-demo">
      <OctagonButton
        variant="ghost"
        label23251="← К списку заявок"
        @click="goBackToList"
      />

      <div class="demo-state-switcher" role="group" aria-label="Демонстрация состояний карточки">
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': effectiveDetailState === 'ready' && !isLongVariant && !simulatedErrorCode && !requestUiStore.rollbackError && !commentSendError }"
          @click="setDetailDemoMode('ready')"
        >
          Карточка
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': Boolean(requestUiStore.rollbackError) }"
          @click="triggerDemoConflictOnCard"
        >
          Конфликт 409 (откат)
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': Boolean(commentSendError) }"
          @click="triggerDemoCommentError"
        >
          Ошибка комментария
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': isLongVariant && effectiveDetailState === 'ready' }"
          @click="setDetailDemoMode('long')"
        >
          Длинное название и ФИО
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': effectiveDetailState === 'loading' }"
          @click="setDetailDemoMode('loading')"
        >
          Загрузка
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': simulatedErrorCode === '429' }"
          @click="setDetailDemoMode('429')"
        >
          Ошибка 429
        </button>
        <button
          type="button"
          class="demo-state-btn"
          :class="{ 'is-active': simulatedErrorCode === '500' || demoDetailState === 'error' }"
          @click="setDetailDemoMode('500')"
        >
          Ошибка 500
        </button>
      </div>
    </div>

    <!-- состояние загрузки карточки заявки из макета 207 -->
    <template v-if="effectiveDetailState === 'loading'">
      <p class="zagruzhaem-zaiavku">Загружаем заявку…</p>
      <div class="detali-i-parametry">
        <div class="istoriia-obrashcheniia">
          <div class="opisanie">
            <div class="skeleton-row-short"></div>
            <div class="skeleton-row-full"></div>
            <div class="skeleton-row-full"></div>
          </div>
          <div class="kommentarii">
            <div class="skeleton-row-short"></div>
            <div class="skeleton-row-full"></div>
            <div class="skeleton-row-full"></div>
            <div class="skeleton-row-full"></div>
            <div class="skeleton-row-full"></div>
            <div class="skeleton-row-full"></div>
            <div class="skeleton-row-full"></div>
          </div>
          <div class="istoriia-izmenenii">
            <div class="skeleton-row-short"></div>
            <div class="skeleton-row-full"></div>
            <div class="skeleton-row-full"></div>
          </div>
        </div>
        <div class="parametry-zaiavki">
          <div class="skeleton-row-short"></div>
          <div class="skeleton-row-param"></div>
          <div class="skeleton-row-param"></div>
          <div class="skeleton-row-param"></div>
          <div class="skeleton-row-param"></div>
          <div class="skeleton-row-param"></div>
          <div class="skeleton-row-param"></div>
          <div class="skeleton-row-param"></div>
          <div class="skeleton-row-param"></div>
        </div>
      </div>
    </template>

    <!-- состояние ошибки загрузки карточки заявки из макета 208 -->
    <div v-else-if="effectiveDetailState === 'error'" class="sostoianie-spiska">
      <OctagonIconAlert />
      <p class="ne-udalos-zagruzit-zaiavku">Не удалось загрузить заявку</p>
      <p class="prover-te-soedinenie-i-povtorite">
        {{ errorSubtitle }}
      </p>
      <OctagonButton
        label23251="Повторить загрузку"
        @click="handleRetryDetail"
      />
    </div>

    <!-- основное отображение карточки заявки -->
    <template v-else-if="requestItem">
      <div v-if="requestItem.hasMissingData" class="soobshchenie-ob-izmenenii">
        <p class="chast-dannykh-zaiavki-nedostupna-ostal">
          Часть данных заявки недоступна. Остальные обращения отображаются.
        </p>
      </div>

      <p class="ne-rabotaet-dostup-k-crm">{{ requestItem.title }}</p>

      <!-- плашка конфликта 409 или 500 и отката изменения из макета 5txt -->
      <div v-if="requestUiStore.rollbackError" class="soobshchenie-ob-izmenenii">
        <p class="izmenenie-ne-sokhraneno">{{ requestUiStore.rollbackError.title }}</p>
        <p class="zaiavka-byla-izmenena-drugim">
          {{ requestUiStore.rollbackError.description }}
        </p>
        <OctagonButton
          variant="secondary"
          label23251="Обновить заявку"
          @click="handleRefreshAfterRollback"
        />
      </div>

      <!-- плашка ошибки отправки комментария из макета 9txt -->
      <div v-else-if="commentSendError" class="soobshchenie-ob-izmenenii">
        <p class="izmenenie-ne-sokhraneno">Не удалось отправить комментарий</p>
        <p class="zaiavka-byla-izmenena-drugim">{{ commentSendError }}</p>
        <OctagonButton
          variant="secondary"
          label23251="Отправить повторно"
          @click="handleSendComment"
        />
      </div>

      <!-- плашка успешного изменения приоритета или статуса с кнопкой undo 3txt и отправки комментария 8txt -->
      <div v-else-if="requestUiStore.feedbackBanner" class="soobshchenie-ob-izmenenii">
        <p class="prioritet-izmenion-na-kriticheskii">
          {{ requestUiStore.feedbackBanner.message }}
        </p>
        <OctagonButton
          v-if="requestUiStore.feedbackBanner.canUndo && requestUiStore.lastUndoAction"
          variant="secondary"
          label23251="Отменить изменение"
          @click="handleUndoChange"
        />
      </div>

      <p class="layer-1042-sozdana-5-oktiabria-09-14">
        {{ requestItem.code }} · {{ requestItem.createdAt }}
      </p>

      <div class="status-zaiavki">
        <OctagonStatusBadge :status="requestItem.status" />
        <OctagonPriorityBadge :priority="requestItem.priority" />
      </div>

      <div class="detali-i-parametry">
        <div class="istoriia-obrashcheniia">
          <div class="opisanie">
            <p class="opisanie-problemy">Описание проблемы</p>
            <p class="posle-obnovleniia-ne-udaiotsia-voiti-v">
              {{ requestItem.description }}
            </p>
          </div>

          <div class="kommentarii">
            <p class="kommentarii-1">Комментарии · {{ requestItem.comments.length }}</p>

            <div
              v-for="comment in requestItem.comments"
              :key="comment.id"
              class="kommentarii-2"
            >
              <p class="mariia-smirnova-09-14">{{ comment.author }} · {{ comment.time }}</p>
              <p class="ne-mozhem-voiti-s-rabochikh-komp">{{ comment.text }}</p>
            </div>

            <div class="wf-gpt-textarea">
              <WFGPTTextarea
                v-model="commentText"
                label23270="Ваш комментарий"
                placeholder="Напишите сообщение…"
                value="Напишите сообщение…"
              />
            </div>

            <div class="octagon-button-2">
              <OctagonButton
                :state="isCommentEmpty || isSubmittingComment ? 'disabled' : 'default'"
                :disabled="isCommentEmpty || isSubmittingComment"
                :label23251="isSubmittingComment ? 'Отправляем…' : 'Отправить комментарий'"
                @click="handleSendComment"
              />
            </div>

            <p v-if="isSubmittingComment" class="otpravliaem-kommentarii">
              Отправляем комментарий…
            </p>
          </div>

          <div class="istoriia-izmenenii">
            <p class="istoriia-zaiavki">История заявки</p>
            <p
              v-for="event in requestItem.timeline"
              :key="event.id"
              class="layer-09-14-mariia-sozdala-zaiavku"
            >
              {{ event.time }}  {{ event.text }}
            </p>
          </div>
        </div>

        <div class="parametry-zaiavki">
          <p class="parametry">Параметры</p>

          <p class="klient">Клиент</p>
          <p class="ao-vektor">{{ requestItem.customer }}</p>

          <p class="kategoriia">Категория</p>
          <p class="dostup-i-uchiotnye-zapisi">{{ requestItem.category }}</p>

          <div class="wf-gpt-field">
            <WFGPTField
              v-model="selectedAssignee"
              label23270="Исполнитель"
              type="select"
              :options="assigneeOptions"
              :value="`${requestItem.assignee}  ▾`"
              @change="handleAssigneeChange"
            />
          </div>

          <div class="wf-gpt-field-2">
            <WFGPTField
              v-model="selectedPriority"
              label23270="Приоритет"
              type="select"
              :options="priorityOptions"
              :value="priorityDisplayLabel"
              @change="handlePriorityChange"
            />
          </div>

          <p class="srok-resheniia">Срок решения</p>
          <p class="segodnia-13-14">{{ requestItem.dueAt }}</p>

          <div class="octagon-button-3">
            <OctagonButton
              label23251="Изменить статус"
              @click="handleStatusChangeAction"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.soderzhanie {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 64px;
  justify-content: flex-start;
  align-items: flex-start;
}

.top-nav-and-demo {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.demo-state-switcher {
  display: flex;
  flex-direction: row;
  gap: 6px;
  padding: 4px;
  border-radius: 6px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
  flex-wrap: wrap;
}

.demo-state-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.demo-state-btn:hover {
  background: var(--color-bg-subtle, #2F2A6A);
  color: var(--color-text-primary, #E8E7EC);
}

.demo-state-btn:focus-visible {
  border-color: #635BFF;
  color: var(--color-text-primary, #E8E7EC);
}

.demo-state-btn.is-active {
  background: var(--color-bg-subtle, #2F2A6A);
  border-color: var(--color-border-strong, #615B94);
  color: var(--color-text-accent, #79CEE8);
  font-weight: 600;
}

.soobshchenie-ob-izmenenii {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.chast-dannykh-zaiavki-nedostupna-ostal,
.prioritet-izmenion-na-kriticheskii {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.izmenenie-ne-sokhraneno {
  align-self: stretch;
  color: var(--color-text-danger, #FF7994);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.zaiavka-byla-izmenena-drugim {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.zagruzhaem-zaiavku {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

/* перенос длинных заголовков заявки без выхода за границы блока */
.ne-rabotaet-dostup-k-crm {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.layer-1042-sozdana-5-oktiabria-09-14 {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.status-zaiavki {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0px;
  justify-content: flex-start;
  align-items: center;
}

.detali-i-parametry {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
}

.istoriia-obrashcheniia {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
}

.opisanie,
.kommentarii,
.istoriia-izmenenii {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.opisanie-problemy,
.kommentarii-1,
.istoriia-zaiavki,
.parametry {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.posle-obnovleniia-ne-udaiotsia-voiti-v,
.ne-mozhem-voiti-s-rabochikh-komp {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.kommentarii-2 {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
}

.mariia-smirnova-09-14 {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.wf-gpt-textarea {
  align-self: stretch;
  width: 100%;
}

.octagon-button-2 {
  align-self: flex-start;
}

.otpravliaem-kommentarii {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
}

.layer-09-14-mariia-sozdala-zaiavku {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.parametry-zaiavki {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.klient,
.kategoriia,
.srok-resheniia {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.ao-vektor,
.dostup-i-uchiotnye-zapisi {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.wf-gpt-field,
.wf-gpt-field-2 {
  align-self: stretch;
  width: 100%;
}

.segodnia-13-14 {
  align-self: stretch;
  color: var(--color-text-accent, #79CEE8);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.octagon-button-3,
.octagon-button-3 :deep(.octagon-btn) {
  align-self: stretch;
  width: 100%;
}

/* скелетоны карточки заявки из макета 207 */
.skeleton-row-short {
  width: 200px;
  max-width: 100%;
  height: 32px;
  padding: 16px;
  background: var(--color-bg-subtle, #2F2A6A);
}

.skeleton-row-full,
.skeleton-row-param {
  align-self: stretch;
  width: 100%;
  height: 32px;
  padding: 16px;
  background: var(--color-bg-subtle, #2F2A6A);
}

/* экран ошибки карточки заявки из макета 208 */
.sostoianie-spiska {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px 24px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.ne-udalos-zagruzit-zaiavku {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
}

.prover-te-soedinenie-i-povtorite {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
}

@media (max-width: 1023px) {
  .soderzhanie {
    padding: 24px 32px;
  }
}

@media (max-width: 639px) {
  .soderzhanie {
    padding: 24px 16px;
  }

  .top-nav-and-demo {
    flex-direction: column;
    align-items: flex-start;
  }

  .ne-rabotaet-dostup-k-crm {
    font-size: 24px;
    line-height: 31px;
  }

  .detali-i-parametry {
    flex-direction: column;
  }

  .istoriia-obrashcheniia {
    width: 100%;
  }

  .parametry-zaiavki {
    width: 100%;
  }

  .octagon-button-2,
  .octagon-button-2 :deep(.octagon-btn) {
    align-self: stretch;
    width: 100%;
  }
}
</style>
