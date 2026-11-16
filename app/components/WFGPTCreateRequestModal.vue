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

const titleError = ref('')
const descriptionError = ref('')
const saveError = ref('')
const isSubmitting = ref(false)
let submitLock = false

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

watch(title, (val) => {
  if (!val.trim()) {
    titleError.value = 'Укажите название заявки.'
  } else {
    titleError.value = ''
  }
})

watch(description, (val) => {
  if (!val.trim()) {
    descriptionError.value = 'Опишите проблему.'
  } else {
    descriptionError.value = ''
  }
})

const hasValidationErrors = computed(
  () => !title.value.trim() || !description.value.trim()
)

const isSubmitDisabled = computed(
  () => isSubmitting.value || Boolean(titleError.value || descriptionError.value)
)

const primaryButtonLabel = computed(() => {
  if (isSubmitting.value) return 'Создаём…'
  if (saveError.value) return 'Повторить'
  return 'Создать заявку'
})

const closeModal = () => {
  titleError.value = ''
  descriptionError.value = ''
  saveError.value = ''
  isSubmitting.value = false
  submitLock = false
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (submitLock || isSubmitting.value) return

  titleError.value = !title.value.trim() ? 'Укажите название заявки.' : ''
  descriptionError.value = !description.value.trim() ? 'Опишите проблему.' : ''
  if (hasValidationErrors.value) {
    return
  }

  submitLock = true
  isSubmitting.value = true
  saveError.value = ''

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
  } catch {
    // при ошибке сохранения введённые данные остаются в полях а кнопка меняется на повторить
    saveError.value = 'Не удалось сохранить изменения. Данные не потеряны. Повторите попытку.'
  } finally {
    isSubmitting.value = false
    submitLock = false
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
            :value="title"
            :state="titleError ? 'error' : 'default'"
          />
          <p v-if="titleError" class="oshibka-polia-nazvanie">
            {{ titleError }}
          </p>

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
            :state="descriptionError ? 'error' : 'default'"
          />
          <p v-if="descriptionError" class="oshibka-polia-opisanie">
            {{ descriptionError }}
          </p>

          <WFGPTField
            v-model="priority"
            label23270="Приоритет"
            type="select"
            :options="priorityOptions"
            value="Высокий  ▾"
          />

          <div v-if="saveError" class="oshibka-sokhraneniia">
            <p class="ne-udalos-sokhranit-izmeneniia-dannye">
              {{ saveError }}
            </p>
          </div>

          <div class="deistviia">
            <OctagonButton
              variant="secondary"
              label23251="Отмена"
              @click="closeModal"
            />
            <OctagonButton
              type="submit"
              :disabled="isSubmitDisabled"
              :state="isSubmitDisabled ? 'disabled' : 'default'"
              :label23251="primaryButtonLabel"
            />
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped src="~/assets/css/components/WFGPTCreateRequestModal.css"></style>
