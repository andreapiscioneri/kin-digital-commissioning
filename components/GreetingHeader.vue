<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name?: string; notificationCount?: number }>(), {
  name: 'Marco',
  notificationCount: 0
})

const initials = computed(() =>
  props.name
    .split(' ')
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('')
)

defineEmits<{ menu: []; notifications: [] }>()
</script>

<template>
  <header class="greeting-header">
    <span class="avatar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
    </span>
    <span class="greeting-text">
      <span class="greeting-title">Benvenuto</span>
      <span class="greeting-subtitle">Bentornato, {{ props.name }}</span>
    </span>
    <button type="button" class="icon-btn notif-btn" aria-label="Notifiche" @click="$emit('notifications')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
      <span v-if="notificationCount > 0" class="notif-badge">{{ notificationCount }}</span>
    </button>
    <button type="button" class="icon-btn" aria-label="Menu" @click="$emit('menu')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
    </button>
  </header>
</template>

<style scoped>
.greeting-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px var(--space-page-x) 26px;
  overflow: hidden;
  background: transparent;
}

.avatar {
  position: relative;
  z-index: 1;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
}

.greeting-text {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.greeting-title {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: var(--line-height-tight);
  color: var(--color-primary);
}

.greeting-subtitle {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.icon-btn {
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: transparent;
  box-shadow: none;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.notif-btn {
  position: relative;
}

.notif-badge {
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
