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

const currentOptionLabel = computed(() => {
  if (!isSelectMode.value) return ''
  const found = props.options.find(opt => opt.value === props.modelValue)
  if (found) return `${found.label}  ▾`
  return props.value
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
    } else if (props.options[activeIndex.value]) {
      selectOption(props.options[activeIndex.value])
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
      <span class="select-value-text">{{ currentOptionLabel }}</span>
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

<style scoped>
.wf-gpt-field-root {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-start;
  align-items: flex-start;
}

.field-label {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.input-box {
  position: relative;
  width: 100%;
  min-height: 48px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 14px;
  justify-content: flex-start;
  align-items: center;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
  outline: none;
}

.input-box:hover:not(.is-disabled),
.wf-gpt-field-root.state-hover .input-box {
  border-color: var(--color-border-strong, #615B94);
}

.input-box:focus-within,
.input-box:focus-visible,
.input-box.is-open,
.wf-gpt-field-root.state-focus .input-box {
  border-color: #635BFF;
  box-shadow: 0px 0px 0px 2px rgba(99, 91, 255, 0.35);
}

.wf-gpt-field-root.state-error .input-box {
  border-color: #FF80A3;
}

.wf-gpt-field-root.is-disabled .input-box {
  background: var(--color-bg-subtle, #2F2A6A);
  border-color: var(--color-border-default, #413E74);
  opacity: 0.65;
  cursor: not-allowed;
}

.native-input {
  flex: 1 1 0;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  outline: none;
}

.native-input::placeholder {
  color: var(--color-text-secondary, #B9B3D4);
  opacity: 1;
}

.native-input:disabled {
  color: var(--color-text-disabled, #8E88A8);
  cursor: not-allowed;
}

.static-value-text,
.select-value-text {
  flex: 1 1 0;
  width: 100%;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-box {
  cursor: pointer;
  user-select: none;
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  list-style: none;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-strong, #615B94);
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  max-height: 240px;
  overflow-y: auto;
  padding: 4px 0;
}

.select-option {
  padding: 10px 14px;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.select-option.is-active,
.select-option:hover {
  background: var(--color-bg-subtle, #2F2A6A);
  color: #FFFFFF;
}

.select-option.is-selected {
  color: var(--color-text-accent, #79CEE8);
  font-weight: 600;
}

.field-error-text {
  color: #FF80A3;
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}
</style>
