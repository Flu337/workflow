<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label23251?: string
    label?: string
    variant?: 'primary' | 'secondary' | 'ghost'
    state?: 'default' | 'hover' | 'focus' | 'disabled'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    fullWidth?: boolean
  }>(),
  {
    label23251: 'Кнопка',
    variant: 'primary',
    state: 'default',
    disabled: false,
    type: 'button',
    fullWidth: false
  }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isDisabled = computed(() => props.disabled || props.state === 'disabled')
const displayText = computed(() => props.label || props.label23251)

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    class="octagon-btn"
    :class="[
      `variant-${variant}`,
      state !== 'default' ? `state-${state}` : '',
      { 'is-full-width': fullWidth }
    ]"
    @click="handleClick"
  >
    <span class="btn-label">
      <slot>{{ displayText }}</slot>
    </span>
  </button>
</template>

<style scoped src="~/assets/css/components/OctagonButton.css"></style>
