<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitleStrong?: string
    subtitle?: string
    editable?: boolean
    clickable?: boolean
  }>(),
  { subtitleStrong: '', subtitle: '', editable: false, clickable: false }
)

const emit = defineEmits<{ click: []; edit: [] }>()
</script>

<template>
  <div class="list-item" :class="{ clickable }" @click="clickable && emit('click')">
    <span v-if="$slots.icon" class="list-item-icon"><slot name="icon" /></span>

    <span class="list-item-text">
      <span class="list-item-title">{{ title }}</span>
      <span v-if="subtitleStrong || subtitle" class="list-item-subtitle">
        <strong v-if="subtitleStrong">{{ subtitleStrong }}</strong> {{ subtitle }}
      </span>
    </span>

    <button v-if="editable" type="button" class="edit-btn" aria-label="Modifica" @click.stop="emit('edit')">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.3 1.8l2.9 2.9L4.9 14 1.5 14.5 2 11.1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
    </button>
    <svg v-else-if="clickable" class="chevron" width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </div>
</template>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
}

.list-item.clickable {
  cursor: pointer;
}

.list-item-icon {
  flex-shrink: 0;
  display: flex;
}

.list-item-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-item-title {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.list-item-subtitle {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.list-item-subtitle strong {
  color: var(--color-primary);
  font-weight: 600;
}

.edit-btn {
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
}

.chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}
</style>
