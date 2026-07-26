<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'success' | 'error' }>(), { tone: 'neutral' })
</script>

<template>
  <span class="pill" :class="tone"><slot /></span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-button);
  font-size: var(--font-size-small);
  font-weight: 500;
  background: var(--color-surface-alt);
  color: var(--color-primary);
}

.pill.success {
  background: color-mix(in srgb, var(--color-success) 18%, transparent);
  color: var(--color-success);
}

.pill.error {
  background: color-mix(in srgb, var(--color-error) 15%, transparent);
  color: var(--color-error);
}
</style>
