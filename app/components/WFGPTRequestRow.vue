<script setup lang="ts">
import type { RequestStatus, RequestPriority } from '~/types/workflow'

const props = withDefaults(
  defineProps<{
    id?: string
    title?: string
    customer?: string
    assignee?: string
    status?: RequestStatus
    priority?: RequestPriority
    compact?: boolean
  }>(),
  {
    id: '#1042',
    title: 'Не работает доступ к CRM',
    customer: 'АО «Вектор»',
    assignee: 'Брунгильда Б.',
    status: 'new',
    priority: 'high',
    compact: false
  }
)

const router = useRouter()

const routeId = computed(() => props.id.replace(/^#/, ''))
const safeTitle = computed(() => (props.title && props.title.trim() ? props.title.trim() : 'Без названия'))
const safeCustomer = computed(() => (props.customer && props.customer.trim() ? props.customer.trim() : 'Клиент не указан'))
const safeAssignee = computed(() => (props.assignee && props.assignee.trim() ? props.assignee.trim() : 'Не назначен'))

const navigateToDetail = () => {
  router.push(`/requests/${routeId.value}`)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    navigateToDetail()
  }
}
</script>

<template>
  <div
    class="wf-gpt-request-row-item"
    :class="{ 'is-compact': compact }"
    role="link"
    tabindex="0"
    :aria-label="`Заявка ${id}: ${safeTitle}`"
    @click="navigateToDetail"
    @keydown="handleKeydown"
  >
    <div class="row-desktop-tablet">
      <p class="col-id">{{ id }}</p>
      <p class="col-title">{{ safeTitle }}</p>
      <p class="col-customer">{{ safeCustomer }}</p>
      <p class="col-assignee">{{ safeAssignee }}</p>
      <div class="col-status">
        <OctagonStatusBadge :status="status" />
      </div>
      <div class="col-priority">
        <OctagonPriorityBadge :priority="priority" />
      </div>
    </div>

    <div class="row-mobile">
      <p class="mobile-id">{{ id }}</p>
      <p class="mobile-title">{{ safeTitle }}</p>
      <div class="mobile-customer-assignee">
        <p class="mobile-customer">{{ safeCustomer }}</p>
        <p class="mobile-assignee">{{ safeAssignee }}</p>
      </div>
      <div class="mobile-status-priority">
        <div class="mobile-col-status">
          <OctagonStatusBadge :status="status" />
        </div>
        <div class="mobile-col-priority">
          <OctagonPriorityBadge :priority="priority" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="~/assets/css/components/WFGPTRequestRow.css"></style>
