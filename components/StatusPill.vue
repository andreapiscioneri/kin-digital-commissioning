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
  background: #eef0f2;
  color: var(--color-primary);
}

.pill.success {
  background: rgba(62, 205, 136, 0.15);
  color: #1f8c56;
}

.pill.error {
  background: rgba(235, 81, 96, 0.12);
  color: var(--color-error);
}
</style>
