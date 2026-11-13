<script setup lang="ts">
import type { RequestStatus, RequestPriority } from '~/utils/types'

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
    :aria-label="`Заявка ${id}: ${title}`"
    @click="navigateToDetail"
    @keydown="handleKeydown"
  >
    <div class="row-desktop-tablet">
      <p class="col-id">{{ id }}</p>
      <p class="col-title">{{ title }}</p>
      <p class="col-customer">{{ customer }}</p>
      <p class="col-assignee">{{ assignee }}</p>
      <div class="col-status">
        <OctagonStatusBadge :status="status" />
      </div>
      <div class="col-priority">
        <OctagonPriorityBadge :priority="priority" />
      </div>
    </div>

    <div class="row-mobile">
      <p class="mobile-id">{{ id }}</p>
      <p class="mobile-title">{{ title }}</p>
      <div class="mobile-customer-assignee">
        <p class="mobile-customer">{{ customer }}</p>
        <p class="mobile-assignee">{{ assignee }}</p>
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

<style scoped>
.wf-gpt-request-row-item {
  width: 100%;
  background: var(--color-bg-surface, #23204D);
  border-top: 1px solid rgba(65, 62, 116, 0.35);
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.wf-gpt-request-row-item:first-child {
  border-top: none;
}

.wf-gpt-request-row-item:hover {
  background: #282459;
}

.wf-gpt-request-row-item:focus-visible {
  background: #282459;
  box-shadow: inset 0 0 0 2px #635BFF;
}

.row-desktop-tablet {
  width: 100%;
  min-height: 54px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 0px 16px;
  justify-content: flex-start;
  align-items: center;
}

.wf-gpt-request-row-item.is-compact .row-desktop-tablet {
  min-height: 44px;
}

.row-mobile {
  display: none;
}

.col-id {
  width: 62px;
  flex-shrink: 0;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.col-title {
  flex: 1 1 0;
  min-width: 0;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-customer {
  width: 140px;
  flex-shrink: 0;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-assignee {
  width: 110px;
  flex-shrink: 0;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-status {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.col-priority {
  width: 130px;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

/* на 768 скрываются колонки клиента и исполнителя */
@media (max-width: 1023px) {
  .col-customer,
  .col-assignee {
    display: none;
  }
}

/* на 360 строка перестраивается в карточку */
@media (max-width: 639px) {
  .row-desktop-tablet {
    display: none;
  }

  .row-mobile {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .mobile-id {
    color: var(--color-text-secondary, #B9B3D4);
    font-family: "Montserrat", sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
  }

  .mobile-title {
    align-self: stretch;
    color: var(--color-text-primary, #E8E7EC);
    font-family: "Montserrat", sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }

  .mobile-customer-assignee {
    display: flex;
    flex-direction: row;
    gap: 8px;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .mobile-customer,
  .mobile-assignee {
    color: var(--color-text-primary, #E8E7EC);
    font-family: "Montserrat", sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
  }

  .mobile-status-priority {
    display: flex;
    flex-direction: row;
    gap: 8px;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }

  .mobile-col-status,
  .mobile-col-priority {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
</style>
