<script setup lang="ts">
withDefaults(
  defineProps<{
    initials?: string
  }>(),
  {
    initials: 'ББ'
  }
)
</script>

<template>
  <div class="octagon-avatar">
    <p class="avatar-initials">{{ initials }}</p>
  </div>
</template>

<style scoped>
.octagon-avatar {
  width: 32px;
  height: 32px;
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 999px;
  background: var(--color-bg-accent-soft, #302B69);
  flex-shrink: 0;
  user-select: none;
}

.avatar-initials {
  color: var(--color-text-accent, #79CEE8);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}
</style>
