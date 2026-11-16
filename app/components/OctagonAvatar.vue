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

<style scoped src="~/assets/css/components/OctagonAvatar.css"></style>
