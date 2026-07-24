<script setup lang="ts">
defineProps<{ label: string; value: string }>()
</script>

<template>
  <div class="info-row">
    <span class="info-label">{{ label }}</span>
    <span class="info-value">{{ value }}</span>
  </div>
</template>

<style scoped>
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: var(--font-size-body);
}

.info-label {
  color: var(--color-text-secondary);
}

.info-value {
  color: var(--color-primary);
  font-weight: 500;
}
</style>
