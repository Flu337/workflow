<script setup lang="ts">
import { PRIORITY_LABELS, type RequestPriority } from '~/types/workflow'

const props = withDefaults(
  defineProps<{
    priority?: RequestPriority
  }>(),
  {
    priority: 'critical'
  }
)

const label = computed(() => PRIORITY_LABELS[props.priority] || PRIORITY_LABELS.critical)
</script>

<template>
  <div class="octagon-priority-badge" :class="`priority-${priority}`">
    <svg
      v-if="priority === 'critical'"
      class="priority-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 2L1.333 13.333H14.667L8 2Z"
        stroke="#FF91AE"
        stroke-width="1.667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8 6.667V9.333M8 11.333H8.007"
        stroke="#FF91AE"
        stroke-width="1.667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <svg
      v-else-if="priority === 'high'"
      class="priority-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.667 7.333L8 4L11.333 7.333M4.667 12L8 8.667L11.333 12"
        stroke="#FFD482"
        stroke-width="1.667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <svg
      v-else-if="priority === 'normal'"
      class="priority-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.333 6H12.667M3.333 10H12.667"
        stroke="#BBB6FF"
        stroke-width="1.667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <svg
      v-else
      class="priority-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.667 6.667L8 10L11.333 6.667"
        stroke="#B9B3D4"
        stroke-width="1.667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <p class="priority-text">{{ label }}</p>
  </div>
</template>

<style scoped src="~/assets/css/components/OctagonPriorityBadge.css"></style>
