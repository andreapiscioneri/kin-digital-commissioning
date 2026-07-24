<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 40 })
</script>

<template>
  <span class="icon-badge" :style="{ width: size + 'px', height: size + 'px' }">
    <slot />
  </span>
</template>

<style scoped>
.icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f0f0;
  color: var(--color-primary);
  flex-shrink: 0;
}
</style>
