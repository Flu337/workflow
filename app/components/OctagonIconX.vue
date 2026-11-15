<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    type="button"
    class="octagon-icon-x-btn ui-icon-btn"
    aria-label="Закрыть диалоговое окно"
    @click="emit('click', $event)"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 5L15 15M15 5L5 15"
        stroke="#B9B3D4"
        stroke-width="1.67"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<style scoped>
.octagon-icon-x-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.octagon-icon-x-btn:hover {
  background: var(--color-bg-subtle, #2F2A6A);
}

.octagon-icon-x-btn:focus-visible {
  border-color: #635BFF;
  outline: none;
}
</style>
