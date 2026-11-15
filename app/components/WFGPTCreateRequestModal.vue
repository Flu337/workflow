<script setup lang="ts">
import type { RequestPriority } from '../../shared/types/workflow'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'created', id: string): void
}>()

const { createNewRequest } = useRequests()

const title = ref('Не работает доступ к CRM')
const category = ref('Доступ и учётные записи')
const description = ref(
  'После обновления не удаётся войти в CRM. При попытке входа появляется сообщение «Доступ запрещён». Проблема затрагивает отдел продаж.'
)
const priority = ref<RequestPriority>('high')
const errorMessage = ref('')
const isSubmitting = ref(false)

const categoryOptions = [
  { label: 'Доступ и учётные записи', value: 'Доступ и учётные записи' },
  { label: 'Инфраструктура и безопасность', value: 'Инфраструктура и безопасность' },
  { label: 'Отчётность и аналитика', value: 'Отчётность и аналитика' },
  { label: 'Интеграции и API', value: 'Интеграции и API' },
  { label: 'Почта и коммуникации', value: 'Почта и коммуникации' },
  { label: 'Офисное оборудование', value: 'Офисное оборудование' }
]

const priorityOptions = [
  { label: 'Критический', value: 'critical' },
  { label: 'Высокий', value: 'high' },
  { label: 'Обычный', value: 'normal' },
  { label: 'Низкий', value: 'low' }
]

const closeModal = () => {
  errorMessage.value = ''
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  errorMessage.value = ''
  if (!title.value.trim()) {
    errorMessage.value = 'Укажите название заявки.'
    return
  }

  isSubmitting.value = true
  try {
    const created = await createNewRequest({
      title: title.value.trim(),
      customer: 'АО «Вектор»',
      category: category.value,
      priority: priority.value,
      description: description.value.trim()
    })
    emit('created', created.id)
    closeModal()
  } catch (err) {
    errorMessage.value =
      (err as { data?: { message?: string }; message?: string })?.data?.message ||
      'Не удалось создать заявку.'
  } finally {
    isSubmitting.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    e.preventDefault()
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-create-title"
      @click.self="closeModal"
    >
      <div class="sozdanie-zaiavki">
        <form class="novaia-zaiavka" @submit.prevent="handleSubmit">
          <div class="zagolovok-okna">
            <p id="modal-create-title" class="novaia-zaiavka-2">Новая заявка</p>
            <OctagonIconX @click="closeModal" />
          </div>

          <p class="opishite-problemu-operator-naznachit">
            Опишите проблему — оператор назначит исполнителя.
          </p>

          <WFGPTField
            v-model="title"
            label23270="Название"
            value="Не работает доступ к CRM"
          />

          <WFGPTField
            v-model="category"
            label23270="Категория"
            type="select"
            :options="categoryOptions"
            :value="`${category}  ▾`"
          />

          <WFGPTTextarea
            v-model="description"
            label23270="Описание"
            :value="description"
          />

          <WFGPTField
            v-model="priority"
            label23270="Приоритет"
            type="select"
            :options="priorityOptions"
            value="Высокий  ▾"
          />

          <p v-if="errorMessage" class="modal-error-text">{{ errorMessage }}</p>

          <div class="deistviia">
            <OctagonButton
              variant="secondary"
              label23251="Отмена"
              @click="closeModal"
            />
            <OctagonButton
              type="submit"
              :disabled="!title.trim() || isSubmitting"
              :state="!title.trim() || isSubmitting ? 'disabled' : 'default'"
              label23251="Создать заявку"
            />
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(23, 21, 58, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.sozdanie-zaiavki {
  width: 560px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(45.39% 41.73% at 54.55% 50%, #201D47 0%, #17153A 100%);
}

.novaia-zaiavka {
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

.novaia-zaiavka-2 {
  flex: 1 1 0;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.opishite-problemu-operator-naznachit {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.modal-error-text {
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
</style>
