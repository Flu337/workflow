<script setup lang="ts">
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type RequestPriority,
  type RequestStatus,
  type RequestDetailResponseDto,
  type AddCommentResponseDto,
  type UpdateRequestResponseDto,
  type UserDirectoryItemDto,
  type WorkFlowRequest
} from '../../../shared/types/workflow'
import { getAllowedNextStatuses } from '../../../shared/utils/statusTransitions'
import { normalizeRequestItem } from '~/utils/normalizeRequests'
import { usePreferencesStore } from '~/stores/preferences'
import { useRequestUiStore } from '~/stores/requestUi'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const preferencesStore = usePreferencesStore()
const requestUiStore = useRequestUiStore()
const authStore = useAuthStore()

const requestId = computed(() => String(route.params.id || '1042').replace(/^#/, ''))

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

// состояния модальных окон 4 этапа (макеты 5txt 7txt 8txt 9txt 10txt)
const isAssignModalOpen = ref(false)
const assignModalAssignee = ref('Брунгильда Брунгильдовна')
const assignModalComment = ref('Проверьте права доступа группы')
const assignModalError = ref('')

const isResolveModalOpen = ref(false)
const resolveModalSummary = ref('Права доступа восстановлены. Вход проверен.')
const resolveModalError = ref('')

const isStatusModalOpen = ref(false)
const statusModalTarget = ref<RequestStatus>('waiting')
const statusModalWaitingReason = ref('')
const statusModalError = ref('')

const isCloseModalOpen = ref(false)
const closeModalReason = ref('')
const closeModalError = ref('')

const detailQuery = computed(() => ({
  simulateError: simulatedErrorCode.value || undefined,
  long: isLongVariant.value ? '1' : undefined,
  role: authStore.currentRole
}))

const { data: usersDirectory } = await useFetch<UserDirectoryItemDto[]>('/api/users', {
  key: 'wf-users-directory-detail',
  default: () => []
})

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

if (
  detailError.value &&
  (detailError.value as { statusCode?: number }).statusCode === 403 &&
  !simulatedErrorCode.value
) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Нет доступа',
    message: 'Эта страница недоступна вашей роли.'
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

const isAgentRole = computed(() => authStore.currentRole === 'Agent')
const isClientRole = computed(() => authStore.currentRole === 'Client')
const isOperatorOrAdmin = computed(
  () => authStore.currentRole === 'Operator' || authStore.currentRole === 'Admin'
)

const assigneeOptions = computed(() => {
  const base = [{ label: 'Не назначен', value: 'Не назначен' }]
  const fromApi = (usersDirectory.value || [])
    .filter(u => u.role === 'Agent')
    .map(u => ({
      label: u.isActive ? u.name : `${u.name} · деактивирован`,
      value: u.isActive ? u.name : `${u.name} · деактивирован`
    }))
  if (fromApi.length === 0) {
    return [
      ...base,
      { label: 'Брунгильда Брунгильдовна', value: 'Брунгильда Брунгильдовна' },
      { label: 'Олег Соколов · деактивирован', value: 'Олег Соколов · деактивирован' },
      { label: 'Александра Константиновна Рождественская-Соколова', value: 'Александра Константиновна Рождественская-Соколова' }
    ]
  }
  return [...base, ...fromApi]
})

const assignModalOptions = computed(() => {
  return assigneeOptions.value.filter(opt => opt.value !== 'Не назначен')
})

const priorityOptions = [
  { label: 'Критический', value: 'critical' },
  { label: 'Высокий', value: 'high' },
  { label: 'Обычный', value: 'normal' },
  { label: 'Низкий', value: 'low' }
]

const allowedStatusOptions = computed(() => {
  const current = requestItem.value?.status || 'in-progress'
  const allowed = getAllowedNextStatuses(current, authStore.currentRole)
  const list = allowed.length > 0 ? allowed : (['waiting', 'resolved', 'in-progress'] as RequestStatus[])
  return list.map(st => ({
    label: STATUS_LABELS[st],
    value: st
  }))
})

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

const isAssignModalDeactivatedSelected = computed(() => {
  const val = assignModalAssignee.value.toLowerCase()
  return val.includes('деактивирован') || val.includes('олег соколов')
})

watch(assignModalAssignee, () => {
  if (isAssignModalDeactivatedSelected.value) {
    assignModalError.value =
      'Деактивированный сотрудник не может получить новое назначение. Выберите активного исполнителя.'
  } else {
    assignModalError.value = ''
  }
})

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
          author: authStore.user?.name || 'Брунгильда Брунгильдовна',
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

const handleAssigneeChange = async (val: string) => {
  if (!requestItem.value) return
  if (val.toLowerCase().includes('деактивирован') || val.toLowerCase().includes('олег соколов')) {
    assignModalAssignee.value = 'Олег Соколов · деактивирован'
    assignModalError.value =
      'Деактивированный сотрудник не может получить новое назначение. Выберите активного исполнителя.'
    isAssignModalOpen.value = true
    selectedAssignee.value = requestItem.value.assignee
    return
  }

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

// открытие модального окна назначения исполнителя (макеты 5txt и 7txt)
const openAssignModal = (presetDeactivated = false) => {
  assignModalComment.value = 'Проверьте права доступа группы'
  if (presetDeactivated) {
    assignModalAssignee.value = 'Олег Соколов · деактивирован'
    assignModalError.value =
      'Деактивированный сотрудник не может получить новое назначение. Выберите активного исполнителя.'
  } else {
    assignModalAssignee.value = 'Брунгильда Брунгильдовна'
    assignModalError.value = ''
  }
  isAssignModalOpen.value = true
}

const submitAssignModal = async () => {
  if (!requestItem.value) return
  if (isAssignModalDeactivatedSelected.value) {
    assignModalError.value =
      'Деактивированный сотрудник не может получить новое назначение. Выберите активного исполнителя.'
    return
  }

  try {
    const res = await $fetch<UpdateRequestResponseDto>(`/api/requests/${requestId.value}`, {
      method: 'PATCH',
      body: {
        assignee: assignModalAssignee.value,
        status: requestItem.value.status === 'new' ? 'assigned' : requestItem.value.status,
        comment: assignModalComment.value.trim(),
        actorName: authStore.user?.name || 'Оператор'
      }
    })
    if (res?.item) {
      localNormalized.value = normalizeRequestItem(res.item)
    }
    requestUiStore.clearOptimisticOverride(requestId.value)
    isAssignModalOpen.value = false
    await refreshDetail()
  } catch (err) {
    assignModalError.value =
      (err as { data?: { message?: string }; message?: string })?.data?.message ||
      'Деактивированный сотрудник не может получить новое назначение. Выберите активного исполнителя.'
  }
}

// открытие модального окна фиксации решения исполнителем (макеты 8txt)
const openResolveModal = (emptyErrorPreset = false) => {
  if (emptyErrorPreset) {
    resolveModalSummary.value = ''
    resolveModalError.value = 'Опишите результат решения.'
  } else {
    resolveModalSummary.value = 'Права доступа восстановлены. Вход проверен.'
    resolveModalError.value = ''
  }
  isResolveModalOpen.value = true
}

const submitResolveModal = async () => {
  if (!resolveModalSummary.value.trim()) {
    resolveModalError.value = 'Опишите результат решения.'
    return
  }
  resolveModalError.value = ''
  try {
    const res = await $fetch<UpdateRequestResponseDto>(`/api/requests/${requestId.value}`, {
      method: 'PATCH',
      body: {
        status: 'resolved',
        resolutionSummary: resolveModalSummary.value.trim(),
        actorName: authStore.user?.name || 'Брунгильда Брунгильдовна'
      }
    })
    if (res?.item) {
      localNormalized.value = normalizeRequestItem(res.item)
    }
    requestUiStore.clearOptimisticOverride(requestId.value)
    isResolveModalOpen.value = false
    await refreshDetail()
  } catch (err) {
    resolveModalError.value =
      (err as { data?: { message?: string }; message?: string })?.data?.message ||
      'Опишите результат решения.'
  }
}

// открытие модального окна изменения статуса с проверкой причины ожидания (макет 9txt)
const openStatusModal = (waitingErrorPreset = false) => {
  statusModalTarget.value = 'waiting'
  statusModalWaitingReason.value = ''
  statusModalError.value = waitingErrorPreset ? 'Укажите причину ожидания.' : ''
  isStatusModalOpen.value = true
}

const submitStatusModal = async () => {
  if (statusModalTarget.value === 'waiting' && !statusModalWaitingReason.value.trim()) {
    statusModalError.value = 'Укажите причину ожидания.'
    return
  }
  statusModalError.value = ''
  if (!requestItem.value) return

  if (statusModalTarget.value === 'resolved') {
    isStatusModalOpen.value = false
    openResolveModal(false)
    return
  }

  if (statusModalTarget.value === 'closed') {
    isStatusModalOpen.value = false
    openCloseModal(false)
    return
  }

  try {
    const res = await $fetch<UpdateRequestResponseDto>(`/api/requests/${requestId.value}`, {
      method: 'PATCH',
      body: {
        status: statusModalTarget.value,
        waitingReason: statusModalWaitingReason.value.trim() || undefined,
        actorName: authStore.user?.name || preferencesStore.name
      }
    })
    if (res?.item) {
      localNormalized.value = normalizeRequestItem(res.item)
    }
    requestUiStore.setOptimisticOverride(requestId.value, {
      status: statusModalTarget.value
    })
    isStatusModalOpen.value = false
    await refreshDetail()
  } catch (err) {
    statusModalError.value =
      (err as { data?: { message?: string }; message?: string })?.data?.message ||
      'Укажите причину ожидания.'
  }
}

// открытие модального окна закрытия заявки оператором (макет 10txt)
const openCloseModal = (closingErrorPreset = false) => {
  closeModalReason.value = ''
  closeModalError.value = closingErrorPreset ? 'Укажите причину ручного закрытия.' : ''
  isCloseModalOpen.value = true
}

const submitCloseModal = async () => {
  if (!closeModalReason.value.trim()) {
    closeModalError.value = 'Укажите причину ручного закрытия.'
    return
  }
  closeModalError.value = ''
  try {
    const res = await $fetch<UpdateRequestResponseDto>(`/api/requests/${requestId.value}`, {
      method: 'PATCH',
      body: {
        status: 'closed',
        closingReason: closeModalReason.value.trim(),
        actorName: authStore.user?.name || 'Оператор'
      }
    })
    if (res?.item) {
      localNormalized.value = normalizeRequestItem(res.item)
    }
    requestUiStore.setOptimisticOverride(requestId.value, {
      status: 'closed'
    })
    isCloseModalOpen.value = false
    await refreshDetail()
  } catch (err) {
    closeModalError.value =
      (err as { data?: { message?: string }; message?: string })?.data?.message ||
      'Укажите причину ручного закрытия.'
  }
}

const handleAddMockAttachment = () => {
  if (!localNormalized.value) return
  localNormalized.value.attachments.push({
    id: `att-${Date.now()}`,
    fileName: `log-${localNormalized.value.attachments.length + 1}.txt`,
    fileSizeLabel: '18 КБ'
  })
}

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
      />    </div>

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

    <template v-else-if="requestItem">
      <div v-if="requestItem.hasMissingData" class="soobshchenie-ob-izmenenii">
        <p class="chast-dannykh-zaiavki-nedostupna-ostal">
          Часть данных заявки недоступна. Остальные обращения отображаются.
        </p>
      </div>

      <p class="ne-rabotaet-dostup-k-crm">{{ requestItem.title }}</p>

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

      <div v-else-if="commentSendError" class="soobshchenie-ob-izmenenii">
        <p class="izmenenie-ne-sokhraneno">Не удалось отправить комментарий</p>
        <p class="zaiavka-byla-izmenena-drugim">{{ commentSendError }}</p>
        <OctagonButton
          variant="secondary"
          label23251="Отправить повторно"
          @click="handleSendComment"
        />
      </div>

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

          <!-- блок результата решения из макета 10.txt когда заявка решена или закрыта -->
          <div
            v-if="(requestItem.status === 'resolved' || requestItem.status === 'closed') && requestItem.resolutionSummary"
            class="rezul-tat-resheniia"
          >
            <p class="rezul-tat-resheniia-2">Результат решения</p>
            <p class="vosstanovleny-prava-gruppy-otdela">
              {{ requestItem.resolutionSummary }}
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

          <!-- блок вложений из макета 10.txt -->
          <div
            v-if="requestItem.status === 'resolved' || requestItem.status === 'closed' || requestItem.attachments.length > 0"
            class="vlozheniia"
          >
            <p class="vlozheniia-1">Вложения · {{ requestItem.attachments.length || 1 }}</p>
            <p
              v-for="att in (requestItem.attachments.length ? requestItem.attachments : [{ id: 'att-default', fileName: 'error-login.png', fileSizeLabel: '245 КБ' }])"
              :key="att.id"
              class="error-login-png-245-kb"
            >
              {{ att.fileName }} · {{ att.fileSizeLabel }}
            </p>
            <OctagonButton
              variant="secondary"
              label23251="Добавить файл"
              @click="handleAddMockAttachment"
            />
          </div>
        </div>

        <div class="parametry-zaiavki">
          <p class="parametry">Параметры</p>

          <p class="klient">Клиент</p>
          <p class="ao-vektor">{{ requestItem.customer }}</p>

          <p class="kategoriia">Категория</p>
          <p class="dostup-i-uchiotnye-zapisi">{{ requestItem.category }}</p>

          <!-- для оператора и админа поля исполнителя и приоритета интерактивны -->
          <template v-if="isOperatorOrAdmin">
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
          </template>

          <!-- для исполнителя и клиента поля исполнителя и приоритета отображаются текстом по макетам 8.txt и 9.txt -->
          <template v-else>
            <p class="klient">Исполнитель</p>
            <p class="ao-vektor">{{ requestItem.assignee }}</p>

            <p class="klient">Приоритет</p>
            <p class="ao-vektor">{{ PRIORITY_LABELS[requestItem.priority] }}</p>
          </template>

          <p class="srok-resheniia">Срок решения</p>
          <p class="segodnia-13-14">{{ requestItem.dueAt }}</p>

          <!-- кнопки действий в зависимости от роли пользователя и статуса заявки -->
          <template v-if="isAgentRole">
            <div class="octagon-button-3">
              <OctagonButton
                label23251="Изменить статус"
                @click="openStatusModal(false)"
              />
            </div>
            <div class="octagon-button-3">
              <OctagonButton
                variant="secondary"
                label23251="Зафиксировать решение"
                @click="openResolveModal(false)"
              />
            </div>
          </template>

          <template v-else-if="isOperatorOrAdmin">
            <div v-if="requestItem.status === 'resolved'" class="octagon-button-3">
              <OctagonButton
                label23251="Закрыть заявку"
                @click="openCloseModal(false)"
              />
            </div>
            <div v-else-if="requestItem.status === 'new' || requestItem.assignee === 'Не назначен'" class="octagon-button-3">
              <OctagonButton
                label23251="Назначить исполнителя"
                @click="openAssignModal(false)"
              />
            </div>
            <div v-else class="octagon-button-3">
              <OctagonButton
                label23251="Изменить статус"
                @click="openStatusModal(false)"
              />
            </div>

            <div v-if="requestItem.status !== 'new' && requestItem.assignee !== 'Не назначен'" class="octagon-button-3">
              <OctagonButton
                variant="secondary"
                label23251="Назначить исполнителя"
                @click="openAssignModal(false)"
              />
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- диалог назначения исполнителя и проверки деактивированного сотрудника из макетов 5.txt и 7.txt -->
    <Teleport to="body">
      <div
        v-if="isAssignModalOpen"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="isAssignModalOpen = false"
      >
        <div class="naznachenie">
          <form class="naznachit-ispolnitelia" @submit.prevent="submitAssignModal">
            <div class="zagolovok-okna">
              <p class="naznachit-ispolnitelia-2">Назначить исполнителя</p>
              <OctagonIconX @click="isAssignModalOpen = false" />
            </div>

            <p class="vyberite-aktivnogo-sotrudnika">Выберите активного сотрудника.</p>

            <WFGPTField
              v-model="assignModalAssignee"
              label23270="Исполнитель"
              type="select"
              :options="assignModalOptions"
              :value="assignModalAssignee.includes('деактивирован') ? assignModalAssignee : `${assignModalAssignee}  ▾`"
            />

            <WFGPTField
              v-model="assignModalComment"
              label23270="Комментарий"
              value="Проверьте права доступа группы"
            />

            <div v-if="assignModalError" class="oshibka-sokhraneniia">
              <p class="deaktivirovannyi-sotrudnik-ne-mozhet">
                {{ assignModalError }}
              </p>
            </div>

            <div class="deistviia">
              <OctagonButton
                variant="secondary"
                label23251="Отмена"
                @click="isAssignModalOpen = false"
              />
              <OctagonButton
                type="submit"
                :state="isAssignModalDeactivatedSelected ? 'disabled' : 'default'"
                :disabled="isAssignModalDeactivatedSelected"
                label23251="Назначить"
              />
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- диалог фиксации решения исполнителем из макетов 8.txt -->
    <Teleport to="body">
      <div
        v-if="isResolveModalOpen"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="isResolveModalOpen = false"
      >
        <div class="reshenie">
          <form class="zafiksirovat-reshenie" @submit.prevent="submitResolveModal">
            <div class="zagolovok-okna">
              <p class="zafiksirovat-reshenie-2">Зафиксировать решение</p>
              <OctagonIconX @click="isResolveModalOpen = false" />
            </div>

            <p class="rezul-tat-obiazatelen-dlia-statusa">
              Результат обязателен для статуса «Решена».
            </p>

            <WFGPTTextarea
              v-model="resolveModalSummary"
              label23270="Результат решения"
              :value="resolveModalSummary"
            />

            <p v-if="resolveModalError" class="opishite-rezul-tat-resheniia">
              {{ resolveModalError }}
            </p>

            <div class="deistviia">
              <OctagonButton
                variant="secondary"
                label23251="Отмена"
                @click="isResolveModalOpen = false"
              />
              <OctagonButton
                type="submit"
                label23251="Отправить решение"
              />
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- диалог смены статуса с обязательной причиной ожидания из макета 9.txt -->
    <Teleport to="body">
      <div
        v-if="isStatusModalOpen"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="isStatusModalOpen = false"
      >
        <div class="smena-statusa">
          <form class="izmenit-status" @submit.prevent="submitStatusModal">
            <div class="zagolovok-okna">
              <p class="izmenit-status-2">Изменить статус</p>
              <OctagonIconX @click="isStatusModalOpen = false" />
            </div>

            <p class="dostupnye-deistviia-zavisiat-ot">
              Доступные действия зависят от текущего статуса.
            </p>

            <WFGPTField
              :model-value="requestItem ? STATUS_LABELS[requestItem.status] : 'В работе'"
              label23270="Текущий статус"
              state="disabled"
              :disabled="true"
              value="В работе"
            />

            <WFGPTField
              v-model="statusModalTarget"
              label23270="Новый статус"
              type="select"
              :options="allowedStatusOptions"
              :value="STATUS_LABELS[statusModalTarget]"
            />

            <WFGPTTextarea
              v-if="statusModalTarget === 'waiting'"
              v-model="statusModalWaitingReason"
              label23270="Причина ожидания"
              :value="statusModalWaitingReason"
            />

            <p v-if="statusModalError" class="ukazhite-prichinu-ozhidaniia">
              {{ statusModalError }}
            </p>

            <div class="deistviia">
              <OctagonButton
                variant="secondary"
                label23251="Отмена"
                @click="isStatusModalOpen = false"
              />
              <OctagonButton
                type="submit"
                label23251="Сохранить"
              />
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- диалог закрытия заявки оператором с обязательной причиной из макета 10.txt -->
    <Teleport to="body">
      <div
        v-if="isCloseModalOpen"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="isCloseModalOpen = false"
      >
        <div class="zakrytie">
          <form class="zakryt-zaiavku" @submit.prevent="submitCloseModal">
            <div class="zagolovok-okna">
              <p class="zakryt-zaiavku-2">Закрыть заявку</p>
              <OctagonIconX @click="isCloseModalOpen = false" />
            </div>

            <p class="ukazhite-prichinu-ruchnogo-zakrytiia">
              Укажите причину ручного закрытия.
            </p>

            <WFGPTTextarea
              v-model="closeModalReason"
              label23270="Причина закрытия"
              :value="closeModalReason"
            />

            <p v-if="closeModalError" class="ukazhite-prichinu-ruchnogo-zakrytiia-2">
              {{ closeModalError }}
            </p>

            <div class="deistviia">
              <OctagonButton
                variant="secondary"
                label23251="Отмена"
                @click="isCloseModalOpen = false"
              />
              <OctagonButton
                type="submit"
                label23251="Закрыть заявку"
              />
            </div>
          </form>
        </div>
      </div>
    </Teleport>
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
.rezul-tat-resheniia,
.kommentarii,
.istoriia-izmenenii,
.vlozheniia {
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
.rezul-tat-resheniia-2,
.kommentarii-1,
.istoriia-zaiavki,
.vlozheniia-1,
.parametry {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.posle-obnovleniia-ne-udaiotsia-voiti-v,
.vosstanovleny-prava-gruppy-otdela,
.ne-mozhem-voiti-s-rabochikh-komp,
.error-login-png-245-kb {
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

/* стили модальных диалогов 4 этапа */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(23, 21, 58, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.naznachenie,
.reshenie,
.smena-statusa,
.zakrytie {
  width: 560px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(26.93% 70.32% at 54.55% 50%, #201D47 0%, #17153A 100%);
}

.naznachit-ispolnitelia,
.zafiksirovat-reshenie,
.izmenit-status,
.zakryt-zaiavku {
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

.zagolovok-okna {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
}

.naznachit-ispolnitelia-2,
.zafiksirovat-reshenie-2,
.izmenit-status-2,
.zakryt-zaiavku-2 {
  flex: 1 1 0;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.vyberite-aktivnogo-sotrudnika,
.rezul-tat-obiazatelen-dlia-statusa,
.dostupnye-deistviia-zavisiat-ot,
.ukazhite-prichinu-ruchnogo-zakrytiia {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.oshibka-sokhraneniia {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: #38213D;
  border: 1px solid #DE5994;
}

.deaktivirovannyi-sotrudnik-ne-mozhet {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.opishite-rezul-tat-resheniia,
.ukazhite-prichinu-ozhidaniia,
.ukazhite-prichinu-ruchnogo-zakrytiia-2 {
  align-self: stretch;
  color: #FF80A3;
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
}

.deistviia {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: flex-start;
  align-items: flex-start;
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
