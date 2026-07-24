<script setup lang="ts">
withDefaults(defineProps<{ initials?: string; name?: string; notificationCount?: number }>(), {
  initials: 'MR',
  name: 'Marco',
  notificationCount: 0
})
defineEmits<{ menu: []; notifications: [] }>()
</script>

<template>
  <header class="greeting-header">
    <span class="avatar">{{ initials }}</span>
    <span class="greeting-text">
      <span class="greeting-title">Ciao!</span>
      <span class="greeting-subtitle">Bentornato, {{ name }}</span>
    </span>
    <button type="button" class="icon-btn" aria-label="Notifiche" @click="$emit('notifications')">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 00-5 5v3l-1.5 3h13L15 10V7a5 5 0 00-5-5zM8 16a2 2 0 004 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <span v-if="notificationCount > 0" class="badge">{{ notificationCount }}</span>
    </button>
    <button type="button" class="icon-btn" aria-label="Menu" @click="$emit('menu')">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
    </button>
  </header>
</template>

<style scoped>
.greeting-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px var(--space-page-x) 16px;
  background: #f0f0f0;
  border-bottom: 1px solid var(--color-border);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #d9d9d9;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-small);
  flex-shrink: 0;
}

.greeting-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.greeting-title {
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--color-primary);
}

.greeting-subtitle {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.icon-btn {
  position: relative;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  border-radius: 8px;
  background: var(--color-error);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
