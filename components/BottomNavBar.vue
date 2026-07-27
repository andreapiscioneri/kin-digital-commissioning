<script setup lang="ts">
const { items, isVisible } = useBottomNav()
const route = useRoute()
const { goClose } = useNavStack()

function go(path: string) {
  if (route.path === path) return
  goClose(path)
}
</script>

<template>
  <nav v-show="isVisible" class="bottom-nav">
    <button
      v-for="item in items"
      :key="item.path"
      type="button"
      class="nav-item"
      :class="{ active: route.path === item.path }"
      @click="go(item.path)"
    >
      <span class="nav-icon">
        <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.5" /></svg>
        <svg v-else-if="item.icon === 'projects'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><path d="M7 6V4.5A1.5 1.5 0 018.5 3h3A1.5 1.5 0 0113 4.5V6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </span>
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom, 0));
  z-index: 50;
  display: flex;
  align-items: stretch;
  height: 64px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  box-shadow: 0 12px 28px -10px rgba(17, 17, 17, 0.22), 0 0 0 1px rgba(17, 17, 17, 0.04);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 8px 6px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item.active {
  background: var(--color-accent-soft);
}

.nav-item.active {
  color: var(--color-accent);
}

.nav-icon {
  position: relative;
  display: flex;
}

.nav-badge {
  position: absolute;
  top: -4px;
  right: -8px;
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

.nav-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
