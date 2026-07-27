<script setup lang="ts">
import type { Widget } from '~/composables/useHomeStore'

defineProps<{ widget: Widget; expanded?: boolean }>()
defineEmits<{ click: []; expand: [] }>()
</script>

<template>
  <div
    class="widget-card"
    :class="{ expanded }"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <span class="widget-top">
      <span class="widget-icon">
        <svg v-if="widget.type === 'temperature'" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 14.5V5a2 2 0 10-4 0v9.5a4 4 0 104 0z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><circle cx="10" cy="16" r="1.3" fill="currentColor" /></svg>
        <svg v-else-if="widget.type === 'humidity'" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
        <svg v-else-if="widget.type === 'energy'" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 3v6H6l9 12v-8h3L9 3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3c-2 2-2 4 0 6 2-2 2-4 0-6zM6 9c-1 2.5 0 4.5 2 5.5 1-2.5.5-4.5-2-5.5zM18 9c1 2.5 0 4.5-2 5.5-1-2.5-.5-4.5 2-5.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" /><path d="M12 12v9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
      </span>
      <span v-if="expanded" class="widget-label">{{ widget.label }}<template v-if="widget.detailLabel"> · {{ widget.detailLabel }}</template></span>
    </span>

    <span class="widget-value">{{ widget.value }}<span v-if="widget.unit" class="widget-unit">{{ widget.unit }}</span></span>

    <button v-if="expanded" type="button" class="widget-expand" aria-label="Espandi" @click.stop="$emit('expand')">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
  </div>
</template>

<style scoped>
.widget-card {
  position: relative;
  flex-shrink: 0;
  width: 84px;
  min-height: 76px;
  border: none;
  border-radius: var(--radius-card);
  background: var(--color-surface-alt);
  color: var(--color-primary);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  cursor: pointer;
  transition: width var(--duration-base) var(--ease-standard), background var(--duration-base) var(--ease-standard);
}

.widget-card.expanded {
  width: 168px;
  align-items: flex-start;
  background: var(--color-surface-alt);
  box-shadow: var(--shadow-card);
}

.widget-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.widget-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.widget-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.widget-value {
  font-size: var(--font-size-body);
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.widget-unit {
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.widget-expand {
  position: absolute;
  right: 10px;
  bottom: 10px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
}
</style>
