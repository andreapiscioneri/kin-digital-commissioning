<script setup lang="ts">
withDefaults(defineProps<{ title: string; caption?: string; divider?: boolean }>(), { caption: '', divider: true })
defineEmits<{ click: [] }>()
</script>

<template>
  <button type="button" class="link-row" :class="{ divider }" @click="$emit('click')">
    <span class="link-row-text">
      <span class="link-row-title">{{ title }}</span>
      <span v-if="caption" class="link-row-caption">{{ caption }}</span>
    </span>
    <svg class="chevron" width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </button>
</template>

<style scoped>
.link-row {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border: none;
  border-bottom: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.link-row.divider {
  border-bottom: 1px solid var(--color-border);
}

.link-row-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.link-row-title {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.link-row-caption {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  max-width: 280px;
}

.chevron {
  flex-shrink: 0;
  margin-top: 4px;
  color: var(--color-primary);
}
</style>
