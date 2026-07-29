<script setup lang="ts">
import type { DeviceCategory } from '~/composables/useHomeStore'

const props = defineProps<{ category: DeviceCategory }>()
defineEmits<{ open: []; toggleAll: [boolean] }>()

const onCount = computed(() => props.category.devices.filter((d) => d.on).length)
const allOn = computed(() => onCount.value === props.category.devices.length)
</script>

<template>
  <div class="category-card">
    <button type="button" class="category-open" @click="$emit('open')">
      <span class="category-icon">
        <svg v-if="category.icon === 'light'" width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.4 1 1.1 1 1.9v.2h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0012 3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
        <svg v-else-if="category.icon === 'plug'" width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 2v6M15 2v6M6 8h12l-1 6a5 5 0 01-10 0L6 8z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M12 17v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        <svg v-else-if="category.icon === 'motor'" width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.3" /><path d="M3 9h18M9 9v12" stroke="currentColor" stroke-width="1.3" /></svg>
        <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.3" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.3" /></svg>
      </span>
      <span class="category-label">{{ category.label }}</span>
      <span class="category-count" :class="{ on: onCount > 0 }">{{ category.devices.length }} dispositivi</span>
    </button>
    <ToggleSwitch class="category-toggle" :model-value="allOn" :aria-label="`Tutti i dispositivi ${category.label}`" @update:model-value="$emit('toggleAll', $event)" />
  </div>
</template>

<style scoped>
.category-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.category-open {
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 0 0 19px;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.category-icon {
  color: var(--color-primary);
}

.category-label {
  font-size: var(--font-size-label);
  font-weight: 700;
  color: var(--color-primary);
}

.category-count {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.category-count.on {
  color: var(--color-accent);
  font-weight: 600;
}

.category-toggle {
  position: absolute;
  right: 16px;
  bottom: 16px;
}
</style>
