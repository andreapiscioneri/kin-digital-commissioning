<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'centered' | 'card'
    title: string
    subtitle?: string
  }>(),
  { variant: 'centered', subtitle: '' }
)
</script>

<template>
  <div class="empty-state" :class="variant">
    <div v-if="$slots.icon" class="empty-icon"><slot name="icon" /></div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="subtitle" class="empty-subtitle">{{ subtitle }}</p>
    <div v-if="$slots.default" class="empty-actions"><slot /></div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.empty-state.centered {
  padding: 40px 20px;
  gap: 8px;
}

.empty-state.centered .empty-icon {
  margin-bottom: 16px;
  color: var(--color-text-secondary);
}

.empty-state.card {
  background: #f0f0f0;
  border-radius: var(--radius-card);
  padding: 20px;
  align-items: flex-start;
  text-align: left;
  gap: 4px;
  width: 100%;
}

.empty-title {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--color-primary);
}

.empty-state.card .empty-title {
  font-size: var(--font-size-label);
}

.empty-subtitle {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.empty-actions {
  width: 100%;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
