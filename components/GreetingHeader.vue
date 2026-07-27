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
    <span class="avatar">{{ initials }}</span>
    <span class="greeting-text">
      <span class="greeting-title">Benvenuto</span>
      <span class="greeting-subtitle">Bentornato, {{ props.name }}</span>
    </span>
    <button type="button" class="icon-btn" aria-label="Notifiche" @click="$emit('notifications')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
      <span v-if="notificationCount > 0" class="badge">{{ notificationCount }}</span>
    </button>
    <button type="button" class="icon-btn" aria-label="Menu" @click="$emit('menu')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
    </button>
  </header>
</template>

<style scoped>
.greeting-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px var(--space-page-x) 20px;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-soft) 130%);
  border-bottom: 1px solid var(--color-border-secondary);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px var(--color-accent);
  background: var(--color-accent);
  color: var(--color-surface);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.greeting-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.greeting-title {
  font-size: var(--font-size-display);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: var(--line-height-tight);
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
