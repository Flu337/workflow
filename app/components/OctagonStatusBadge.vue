<script setup lang="ts">
import { STATUS_LABELS, type RequestStatus } from '~/types/workflow'

const props = withDefaults(
  defineProps<{
    status?: RequestStatus
  }>(),
  {
    status: 'new'
  }
)

const label = computed(() => STATUS_LABELS[props.status] || STATUS_LABELS.new)
</script>

<template>
  <div class="octagon-status-badge" :class="`status-${status}`">
    <div class="dot"></div>
    <p class="status-text">{{ label }}</p>
  </div>
</template>

<style scoped src="~/assets/css/components/OctagonStatusBadge.css"></style>
