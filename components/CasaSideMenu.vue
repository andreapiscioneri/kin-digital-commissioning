<script setup lang="ts">
import { useHomeStore } from '~/composables/useHomeStore'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
const colorMode = useColorMode()
const menuLogoSrc = computed(() => (colorMode.value === 'dark' ? '/images/Kin-2.png' : '/images/Kin.png'))

const { property } = useHomeStore()

type MenuItem = { label: string; icon: string }

const mainItems: MenuItem[] = [
  { label: 'Gestione casa', icon: 'home' },
  { label: 'Scenari', icon: 'scenes' },
  { label: 'Programmazione', icon: 'calendar' },
  { label: 'Termoregolazione', icon: 'thermo' },
  { label: 'Energia', icon: 'energy' },
  { label: 'Irrigazione', icon: 'irrigation' },
  { label: 'Timer', icon: 'timer' },
  { label: 'Disattiva dispositivi', icon: 'power' }
]

const secondaryItems: MenuItem[] = [
  { label: 'Guida', icon: 'guide' },
  { label: 'Gestisci avvisi', icon: 'bell' },
  { label: 'Profilo', icon: 'profile' }
]

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Transition name="menu-overlay">
    <div v-if="modelValue" class="menu-overlay" @mousedown.self="close">
      <Transition name="menu-panel" appear>
        <aside v-if="modelValue" class="menu-panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div class="menu-top">
            <span class="menu-eyebrow">Il tuo Progetto</span>
            <IconButton ariaLabel="Chiudi" class="menu-close" @click="close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
            </IconButton>
            <button type="button" class="menu-property">
              {{ property.name }}
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>

          <nav class="menu-list">
            <button v-for="item in mainItems" :key="item.label" type="button" class="menu-item">
              <svg v-if="item.icon === 'home'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 11l8-7 8 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /><path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
              <svg v-else-if="item.icon === 'scenes'" width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.4" /><path d="M10 9l6 3-6 3V9z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
              <svg v-else-if="item.icon === 'calendar'" width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.4" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <svg v-else-if="item.icon === 'thermo'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 14.5V5a2 2 0 10-4 0v9.5a4 4 0 104 0z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
              <svg v-else-if="item.icon === 'energy'" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.4" /><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="1.2" /></svg>
              <svg v-else-if="item.icon === 'irrigation'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3c-2 2-2 4 0 6 2-2 2-4 0-6zM6 9c-1 2.5 0 4.5 2 5.5 1-2.5.5-4.5-2-5.5zM18 9c1 2.5 0 4.5-2 5.5-1-2.5-.5-4.5 2-5.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" /><path d="M12 12v9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
              <svg v-else-if="item.icon === 'timer'" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="1.4" /><path d="M12 9v4l3 2M10 2h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M7 6.5a8 8 0 105.5-.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <nav class="menu-list secondary">
            <button v-for="item in secondaryItems" :key="item.label" type="button" class="menu-item">
              <svg v-if="item.icon === 'guide'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 7h6l-1.5 3L11 13H5V7zM13 6h6l-1.5 3L19 12h-6V6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
              <svg v-else-if="item.icon === 'bell'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.4" /><path d="M5 20c1.3-4 4-6 7-6s5.7 2 7 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <div class="menu-footer">
            <img :src="menuLogoSrc" alt="Kin" class="menu-made-by-logo" />
          </div>
        </aside>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.menu-overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay-scrim);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.menu-panel {
  width: 100%;
  height: 100%;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  padding: 16px 20px 24px;
  box-shadow: var(--shadow-menu);
  overflow-y: auto;
}

.menu-top {
  position: relative;
  padding-top: calc(env(safe-area-inset-top, 0) + 4px);
  padding-bottom: 16px;
}

.menu-eyebrow {
  display: block;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.menu-close {
  position: absolute;
  top: -4px;
  right: 0;
}

.menu-property {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  padding: 0;
  font-family: var(--font-family);
  font-size: var(--font-size-display);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-primary);
  cursor: pointer;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-list.secondary {
  margin-top: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  text-align: left;
  cursor: pointer;
}

.menu-footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

.menu-made-by {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.menu-made-by-logo {
  height: 78px;
  width: auto;
}

.menu-overlay-enter-active,
.menu-overlay-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.menu-overlay-enter-from,
.menu-overlay-leave-to {
  opacity: 0;
}

.menu-panel-enter-active {
  transition: transform var(--duration-slow) var(--ease-standard);
}

.menu-panel-leave-active {
  transition: transform var(--duration-base) var(--ease-standard);
}

.menu-panel-enter-from,
.menu-panel-leave-to {
  transform: translateX(100%);
}
</style>
