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

<style scoped src="~/assets/css/components/WFGPTTextarea.css"></style>
