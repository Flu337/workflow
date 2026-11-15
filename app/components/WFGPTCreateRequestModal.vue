<script setup lang="ts">
import type { RequestPriority } from '~/types/workflow'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'created', id: string): void
}>()

const { createNewRequest } = useRequests()

const title = ref('')
const customer = ref('АО «Вектор»')
const category = ref('Доступ и учётные записи')
const priority = ref<RequestPriority>('high')
const description = ref('')

const priorityOptions = [
  { label: 'Критический', value: 'critical' },
  { label: 'Высокий', value: 'high' },
  { label: 'Обычный', value: 'normal' },
  { label: 'Низкий', value: 'low' }
]

const customerOptions = [
  { label: 'АО «Вектор»', value: 'АО «Вектор»' },
  { label: 'ООО «Сфера»', value: 'ООО «Сфера»' },
  { label: 'ООО «Пульс»', value: 'ООО «Пульс»' }
]

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!title.value.trim()) return
  const created = createNewRequest({
    title: title.value,
    customer: customer.value,
    category: category.value,
    priority: priority.value,
    description: description.value
  })
  title.value = ''
  description.value = ''
  emit('created', created.id)
  closeModal()
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
      <div class="modal-card">
        <div class="modal-header">
          <p id="modal-create-title" class="modal-title">Создать заявку</p>
          <button
            type="button"
            class="ui-icon-btn"
            aria-label="Закрыть модальное окно"
            @click="closeModal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="#B9B3D4"
                stroke-width="1.67"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <form class="modal-form" @submit.prevent="handleSubmit">
          <WFGPTField
            v-model="title"
            label23270="Тема заявки"
            placeholder="Например: Не работает доступ к CRM"
          />

          <WFGPTField
            v-model="customer"
            label23270="Клиент"
            type="select"
            :options="customerOptions"
          />

          <WFGPTField
            v-model="priority"
            label23270="Приоритет"
            type="select"
            :options="priorityOptions"
          />

          <WFGPTTextarea
            v-model="description"
            label23270="Описание проблемы"
            placeholder="Опишите детали обращения…"
          />

          <div class="modal-actions">
            <OctagonButton
              variant="secondary"
              label23251="Отмена"
              @click="closeModal"
            />
            <OctagonButton
              type="submit"
              :disabled="!title.trim()"
              :state="!title.trim() ? 'disabled' : 'default'"
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
  background: rgba(15, 13, 38, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 4px;
}
</style>
