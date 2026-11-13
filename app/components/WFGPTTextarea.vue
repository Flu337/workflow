<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label23270?: string
    label?: string
    value?: string
    modelValue?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    label23270: 'Электронная почта',
    value: 'name@company.ru',
    modelValue: undefined,
    placeholder: '',
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const displayLabel = computed(() => props.label || props.label23270)

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="wf-gpt-textarea-root" :class="{ 'is-disabled': disabled }">
    <label class="textarea-label">{{ displayLabel }}</label>
    <div class="textarea-box">
      <textarea
        v-if="modelValue !== undefined"
        class="native-textarea"
        :value="modelValue"
        :placeholder="placeholder || value"
        :disabled="disabled"
        :aria-label="displayLabel"
        @input="handleInput"
      />
      <p v-else class="static-textarea-text">{{ value }}</p>
    </div>
  </div>
</template>

<style scoped>
.wf-gpt-textarea-root {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-start;
  align-items: flex-start;
}

.textarea-label {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.textarea-box {
  width: 100%;
  height: 112px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 14px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.textarea-box:hover {
  border-color: var(--color-border-strong, #615B94);
}

.textarea-box:focus-within {
  border-color: #635BFF;
  box-shadow: 0px 0px 0px 2px rgba(99, 91, 255, 0.35);
}

.native-textarea {
  flex: 1 1 0;
  width: 100%;
  height: 100%;
  resize: none;
  border: none;
  background: transparent;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  outline: none;
}

.native-textarea::placeholder {
  color: var(--color-text-secondary, #B9B3D4);
  opacity: 1;
}

.static-textarea-text {
  flex: 1 1 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}
</style>
