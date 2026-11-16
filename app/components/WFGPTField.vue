<script setup lang="ts">
export interface SelectOption {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    label23270?: string
    label?: string
    value?: string
    modelValue?: string
    placeholder?: string
    type?: 'text' | 'email' | 'password' | 'select'
    options?: SelectOption[]
    state?: 'default' | 'hover' | 'focus' | 'disabled' | 'error'
    disabled?: boolean
    errorMessage?: string
  }>(),
  {
    label23270: 'Электронная почта',
    value: 'name@company.ru',
    modelValue: undefined,
    placeholder: '',
    type: 'text',
    options: () => [],
    state: 'default',
    disabled: false,
    errorMessage: ''
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const displayLabel = computed(() => props.label || props.label23270)
const isDisabled = computed(() => props.disabled || props.state === 'disabled')

const isSelectMode = computed(() => props.type === 'select' || props.options.length > 0)

const isDropdownOpen = ref(false)
const activeIndex = ref(0)
const fieldRef = ref<HTMLElement | null>(null)

const currentOptionText = computed(() => {
  if (!isSelectMode.value) return ''
  const found = props.options.find(opt => opt.value === props.modelValue)
  if (found) return found.label
  return props.value.replace(/\s*▾\s*$/, '')
})

const toggleDropdown = () => {
  if (isDisabled.value || !isSelectMode.value) return
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    const idx = props.options.findIndex(o => o.value === props.modelValue)
    activeIndex.value = idx >= 0 ? idx : 0
  }
}

const selectOption = (opt: SelectOption) => {
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  isDropdownOpen.value = false
}

// управление списком с клавиатуры
const handleSelectKeydown = (e: KeyboardEvent) => {
  if (isDisabled.value || !isSelectMode.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (!isDropdownOpen.value) {
      toggleDropdown()
    } else {
      const currentOption = props.options[activeIndex.value]
      if (currentOption) {
        selectOption(currentOption)
      }
    }
  } else if (e.key === 'Escape') {
    if (isDropdownOpen.value) {
      e.preventDefault()
      isDropdownOpen.value = false
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!isDropdownOpen.value) {
      isDropdownOpen.value = true
    } else {
      activeIndex.value = (activeIndex.value + 1) % props.options.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (!isDropdownOpen.value) {
      isDropdownOpen.value = true
    } else {
      activeIndex.value = (activeIndex.value - 1 + props.options.length) % props.options.length
    }
  } else if (e.key === 'Tab') {
    isDropdownOpen.value = false
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
}

const handleClickOutside = (event: MouseEvent) => {
  if (fieldRef.value && !fieldRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div
    ref="fieldRef"
    class="wf-gpt-field-root"
    :class="[state !== 'default' ? `state-${state}` : '', { 'is-disabled': isDisabled }]"
  >
    <label class="field-label">{{ displayLabel }}</label>

    <div
      v-if="isSelectMode"
      class="input-box select-box"
      :class="{ 'is-open': isDropdownOpen }"
      role="combobox"
      :aria-expanded="isDropdownOpen"
      aria-haspopup="listbox"
      :aria-label="displayLabel"
      :tabindex="isDisabled ? -1 : 0"
      @click="toggleDropdown"
      @keydown="handleSelectKeydown"
    >
      <span class="select-value-text">{{ currentOptionText }}</span>
      <span class="strelka-raskrytiia">▾</span>
      <ul v-if="isDropdownOpen" class="select-dropdown" role="listbox">
        <li
          v-for="(opt, idx) in options"
          :key="opt.value"
          role="option"
          :aria-selected="opt.value === modelValue"
          class="select-option"
          :class="{
            'is-selected': opt.value === modelValue,
            'is-active': idx === activeIndex
          }"
          @mouseenter="activeIndex = idx"
          @click.stop="selectOption(opt)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </div>

    <div v-else-if="modelValue !== undefined" class="input-box">
      <input
        :type="type === 'select' ? 'text' : type"
        class="native-input"
        :value="modelValue"
        :placeholder="placeholder || value"
        :disabled="isDisabled"
        :aria-label="displayLabel"
        @input="handleInput"
      />
    </div>

    <div v-else class="input-box" :tabindex="isDisabled ? -1 : 0">
      <p class="static-value-text">{{ value }}</p>
    </div>

    <p v-if="errorMessage" class="field-error-text">{{ errorMessage }}</p>
  </div>
</template>

<style scoped src="~/assets/css/components/WFGPTField.css"></style>
