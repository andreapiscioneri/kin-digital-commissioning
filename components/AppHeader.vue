<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    leading?: 'back' | 'none'
    trailing?: 'close' | 'none'
    divider?: boolean
  }>(),
  { title: '', leading: 'back', trailing: 'none', divider: true }
)

const emit = defineEmits<{ back: []; close: [] }>()
</script>

<template>
  <header class="app-header" :class="{ 'no-divider': !divider }">
    <button v-if="leading === 'back'" type="button" class="icon-btn" aria-label="Indietro" @click="emit('back')">
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none"><path d="M1 8h17M1 8l6-6M1 8l6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <span v-else class="icon-spacer" />

    <h1 class="app-header-title">{{ title }}</h1>

    <button v-if="trailing === 'close'" type="button" class="icon-btn" aria-label="Chiudi" @click="emit('close')">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
    </button>
    <span v-else class="icon-spacer" />
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px var(--space-page-x) 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.app-header.no-divider {
  border-bottom: none;
}

.app-header-title {
  flex: 1;
  margin: 0;
  text-align: center;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.icon-spacer {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}
</style>
