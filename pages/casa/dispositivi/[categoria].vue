<script setup lang="ts">
import { useHomeStore } from '~/composables/useHomeStore'

const route = useRoute()
const categoryId = route.params.categoria as string
const { deviceCategories, toggleCategoryDevice, toggleAllInCategory } = useHomeStore()
const { goBack } = useNavStack()

const menuOpen = ref(false)
const category = computed(() => deviceCategories.value.find((c) => c.id === categoryId))
const onCount = computed(() => category.value?.devices.filter((d) => d.on).length ?? 0)
const allOn = computed(() => !!category.value && onCount.value === category.value.devices.length)
</script>

<template>
  <div v-if="category" class="screen">
    <StatusBar />
    <AppHeader :title="category.label" leading="back" trailing="none" @back="goBack('/casa')" />

    <div class="body">
      <span class="category-hero-icon">
        <svg v-if="category.icon === 'light'" width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.4 1 1.1 1 1.9v.2h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0012 3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" /></svg>
        <svg v-else-if="category.icon === 'plug'" width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M9 2v6M15 2v6M6 8h12l-1 6a5 5 0 01-10 0L6 8z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" /><path d="M12 17v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" /></svg>
        <svg v-else-if="category.icon === 'motor'" width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.2" /><path d="M3 9h18M9 9v12" stroke="currentColor" stroke-width="1.2" /></svg>
        <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.2" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.2" /></svg>
      </span>

      <div class="all-row">
        <span class="all-label">Tutti gli elementi</span>
        <ToggleSwitch :model-value="allOn" aria-label="Tutti gli elementi" @update:model-value="(v) => toggleAllInCategory(category!.id, v)" />
      </div>

      <div class="device-list">
        <div v-for="d in category.devices" :key="d.id" class="device-row">
          <span class="device-icon">
            <svg v-if="d.icon === 'light' || d.icon === 'ceiling'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.4 1 1.1 1 1.9v.2h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0012 3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
            <svg v-else-if="d.icon === 'plug'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 2v6M15 2v6M6 8h12l-1 6a5 5 0 01-10 0L6 8z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
            <svg v-else-if="d.icon === 'motor'" width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.3" /><path d="M3 9h18M9 9v12" stroke="currentColor" stroke-width="1.3" /></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          </span>
          <span class="device-text">
            <span class="device-name">{{ d.name }}</span>
            <span class="device-subtitle">{{ d.subtitle }}</span>
          </span>
          <button type="button" class="device-more" aria-label="Altre azioni">
            <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor"><circle cx="2" cy="2" r="2" /><circle cx="2" cy="8" r="2" /><circle cx="2" cy="14" r="2" /></svg>
          </button>
          <ToggleSwitch :model-value="d.on" :aria-label="d.name" @update:model-value="toggleCategoryDevice(category!.id, d.id)" />
        </div>
      </div>
    </div>

    <CasaSideMenu v-model="menuOpen" />
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 8px var(--space-page-x) 24px;
}

.category-hero-icon {
  align-self: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin: 12px 0 20px;
}

.all-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
}

.all-label {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.device-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.device-name {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.device-subtitle {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.device-more {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
}
</style>
