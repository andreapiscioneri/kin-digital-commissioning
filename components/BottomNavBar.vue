<script setup lang="ts">
const { items, isVisible, showFab, fabPath } = useBottomNav()
const { goClose, goForward } = useNavStack()

function go(path: string) {
  goClose(path)
}

function openFabAction() {
  goForward(fabPath.value)
}
</script>

<template>
  <nav v-show="isVisible" class="bottom-nav">
    <button
      v-for="item in items"
      :key="item.path"
      type="button"
      class="nav-item"
      :class="{ active: item.active }"
      @click="go(item.path)"
    >
      <span class="nav-icon">
        <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.5" /></svg>
        <svg v-else-if="item.icon === 'projects'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><path d="M7 6V4.5A1.5 1.5 0 018.5 3h3A1.5 1.5 0 0113 4.5V6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
        <svg v-else-if="item.icon === 'project'" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 16h4v-5h4v5h4V9.5L10 4 4 9.5V16z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
        <svg v-else-if="item.icon === 'devices'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="7" y="2" width="6" height="12" rx="1.2" stroke="currentColor" stroke-width="1.4" /><circle cx="10" cy="16" r="2.2" stroke="currentColor" stroke-width="1.4" /></svg>
        <svg v-else-if="item.icon === 'scene'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.8" y="2.8" width="5.4" height="5.4" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="11.8" y="2.8" width="5.4" height="5.4" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="2.8" y="11.8" width="5.4" height="5.4" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="11.8" y="11.8" width="5.4" height="5.4" rx="1" stroke="currentColor" stroke-width="1.4" /></svg>
        <svg v-else-if="item.icon === 'diagnostics'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="1.5" stroke="currentColor" stroke-width="1.4" /><path d="M6 12h8M6 8h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        <svg v-else-if="item.icon === 'notifications'" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6" r="3" stroke="currentColor" stroke-width="1.4" /><path d="M3.5 17c1.2-3.2 3.8-5 6.5-5s5.3 1.8 6.5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </span>
      <span class="nav-label">{{ item.label }}</span>
    </button>

    <button v-if="showFab" type="button" class="nav-fab" aria-label="Azione rapida" @click="openFabAction">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="#fff" stroke-width="1.8" stroke-linecap="round" /></svg>
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
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  box-shadow: var(--shadow-menu);
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

.nav-fab {
  position: absolute;
  left: 50%;
  top: -22px;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 4px solid var(--color-bg);
  background: linear-gradient(135deg, #ff6a2f 0%, #db3700 60%, #b02b00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: none;
  z-index: 51;
}

</style>
