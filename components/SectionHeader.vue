<script setup lang="ts">
withDefaults(defineProps<{ title: string; divider?: boolean }>(), { divider: true })
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="section-header" :class="{ divider }">
    <h2 class="section-title">{{ title }}</h2>
    <button v-if="$slots.action" type="button" class="section-action" @click="$emit('action')">
      <slot name="action" />
    </button>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
}

.section-header.divider {
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--color-primary);
}

.section-action {
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
