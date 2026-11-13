<script setup lang="ts">
import type { RequestPriority } from '~/utils/types'

const route = useRoute()
const router = useRouter()
const { getRequestById, addComment, updateRequestParams } = useRequests()

const requestId = computed(() => String(route.params.id || '1042'))
const requestItem = computed(() => getRequestById(requestId.value))

if (!requestItem.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Страница не найдена'
  })
}

const commentText = ref('')
const selectedAssignee = ref(requestItem.value.assignee)
const selectedPriority = ref<RequestPriority>(requestItem.value.priority)

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

const assigneeOptions = [
  { label: 'Не назначен', value: 'Не назначен' },
  { label: 'Брунгильда Б.', value: 'Брунгильда Б.' },
  { label: 'Олег С.', value: 'Олег С.' },
  { label: 'Анна Кузнецова', value: 'Анна Кузнецова' }
]

const priorityOptions = [
  { label: 'Критический', value: 'critical' },
  { label: 'Высокий', value: 'high' },
  { label: 'Обычный', value: 'normal' },
  { label: 'Низкий', value: 'low' }
]

const isCommentEmpty = computed(() => !commentText.value.trim())

const handleSendComment = () => {
  if (isCommentEmpty.value || !requestItem.value) return
  addComment(requestItem.value.id, commentText.value)
  commentText.value = ''
}

const handlePriorityChange = (val: string) => {
  if (!requestItem.value) return
  updateRequestParams(requestItem.value.id, { priority: val as RequestPriority })
}

const handleAssignAction = () => {
  if (!requestItem.value) return
  const targetAssignee =
    selectedAssignee.value === 'Не назначен' ? 'Брунгильда Б.' : selectedAssignee.value
  selectedAssignee.value = targetAssignee
  updateRequestParams(requestItem.value.id, {
    assignee: targetAssignee,
    priority: selectedPriority.value
  })
}

const goBackToList = () => {
  router.push('/requests')
}
</script>

<template>
  <div v-if="requestItem" class="soderzhanie">
    <OctagonButton
      variant="ghost"
      label23251="← К списку заявок"
      @click="goBackToList"
    />

    <p class="ne-rabotaet-dostup-k-crm">{{ requestItem.title }}</p>
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
              :state="isCommentEmpty ? 'disabled' : 'default'"
              :disabled="isCommentEmpty"
              label23251="Отправить комментарий"
              @click="handleSendComment"
            />
          </div>
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
          />
        </div>

        <div class="wf-gpt-field-2">
          <WFGPTField
            v-model="selectedPriority"
            label23270="Приоритет"
            type="select"
            :options="priorityOptions"
            value="Высокий  ▾"
            @change="handlePriorityChange"
          />
        </div>

        <p class="srok-resheniia">Срок решения</p>
        <p class="segodnia-13-14">{{ requestItem.dueAt }}</p>

        <div class="octagon-button-3">
          <OctagonButton
            label23251="Назначить исполнителя"
            @click="handleAssignAction"
          />
        </div>
      </div>
    </div>
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

.ne-rabotaet-dostup-k-crm {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
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
}

.wf-gpt-textarea {
  align-self: stretch;
  width: 100%;
}

.octagon-button-2 {
  align-self: flex-start;
}

.layer-09-14-mariia-sozdala-zaiavku {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: pre-wrap;
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

@media (max-width: 1023px) {
  .soderzhanie {
    padding: 24px 32px;
  }
}

@media (max-width: 639px) {
  .soderzhanie {
    padding: 24px 16px;
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
