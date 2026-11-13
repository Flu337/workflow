<script setup lang="ts">
</script>

<template>
  <div class="public-layout-shell">
    <slot />
  </div>
</template>

<style scoped>
.public-layout-shell {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(38.28% 49.47% at 54.55% 50%, #201D47 0%, #17153A 100%);
}
</style>
