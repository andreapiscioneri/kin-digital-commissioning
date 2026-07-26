<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    caption?: string
    selectType?: 'radio' | 'checkbox' | 'none'
    selected?: boolean
    disabled?: boolean
    expandable?: boolean
    expanded?: boolean
  }>(),
  { caption: '', selectType: 'none', selected: false, disabled: false, expandable: false, expanded: false }
)

const emit = defineEmits<{ click: []; toggleExpand: [] }>()
</script>

<template>
  <div class="row" :class="{ disabled }" @click="!disabled && emit('click')">
    <span v-if="selectType === 'radio'" class="mark radio" :class="{ checked: selected }" aria-hidden="true" />
    <span v-else-if="selectType === 'checkbox'" class="mark checkbox" :class="{ checked: selected }" aria-hidden="true">
      <svg v-if="selected" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="var(--color-surface)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>

    <span v-if="$slots.icon" class="row-icon"><slot name="icon" /></span>

    <span class="row-text">
      <span class="row-label">{{ label }}</span>
      <span v-if="caption" class="row-caption">{{ caption }}</span>
    </span>

    <button
      v-if="expandable"
      type="button"
      class="chevron-btn"
      :class="{ expanded }"
      @click.stop="emit('toggleExpand')"
    >
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <svg v-else-if="selectType === 'none'" class="chevron-static" width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  cursor: pointer;
}

.row.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mark {
  flex-shrink: 0;
}

.mark.radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  position: relative;
}

.mark.radio.checked {
  border-color: var(--color-accent);
}

.mark.radio.checked::after {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: var(--color-accent);
}

.mark.checkbox {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-checkbox);
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
}

.mark.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.row-icon {
  flex-shrink: 0;
  display: flex;
}

.row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-label {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.row-caption {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.chevron-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-standard);
}

.chevron-btn.expanded {
  transform: rotate(180deg);
}

.chevron-static {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}
</style>
