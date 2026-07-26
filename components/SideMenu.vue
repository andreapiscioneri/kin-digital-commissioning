<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; projectId?: string }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const { goForward } = useNavStack()
const colorMode = useColorMode()

const themeOptions = [
  { value: 'light', label: 'Chiaro' },
  { value: 'dark', label: 'Scuro' },
  { value: 'system', label: 'Sistema' }
]

type MenuItem = { label: string; icon: 'user' | 'help' | 'team' | 'bell'; path: string }

const items = computed<MenuItem[]>(() => {
  const list: MenuItem[] = [
    { label: 'Dati profilo', icon: 'user', path: '/account/profilo' },
    { label: 'Assistenza', icon: 'help', path: '/account/assistenza' }
  ]
  if (props.projectId) {
    list.push({ label: 'Team di collaboratori', icon: 'team', path: `/progetti/${props.projectId}/utenti` })
  }
  list.push({ label: 'Gestione avvisi', icon: 'bell', path: '/account/notifiche' })
  return list
})

function close() {
  emit('update:modelValue', false)
}

function open(path: string) {
  close()
  goForward(path)
}

function openScan() {
  close()
  goForward(props.projectId ? `/scan-qr?projectId=${props.projectId}` : '/scan-qr')
}
</script>

<template>
  <Transition name="menu-overlay">
    <div v-if="modelValue" class="menu-overlay" @mousedown.self="close">
      <Transition name="menu-panel" appear>
        <aside v-if="modelValue" class="menu-panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div class="menu-top">
            <IconButton ariaLabel="Chiudi" @click="close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </IconButton>
          </div>

          <nav class="menu-list">
            <button v-for="item in items" :key="item.label" type="button" class="menu-item" @click="open(item.path)">
              <svg v-if="item.icon === 'user'" width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.5" stroke="currentColor" stroke-width="1.4" /><path d="M3 17c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <svg v-else-if="item.icon === 'help'" width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.4" /><path d="M7.8 8a2.2 2.2 0 114 1.3c-.7.6-1.3 1-1.3 2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="10" cy="14.5" r="0.9" fill="currentColor" /></svg>
              <svg v-else-if="item.icon === 'team'" width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6.5" r="3" stroke="currentColor" stroke-width="1.4" /><path d="M1.5 17c1-3 3-4.7 5.5-4.7S11.5 14 12.5 17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="14.5" cy="7" r="2.4" stroke="currentColor" stroke-width="1.4" /><path d="M13 12.6c2.2.2 3.7 1.7 4.5 4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <div class="menu-theme">
            <p class="menu-section-title">Tema</p>
            <SegmentedControl v-model="colorMode.preference" :options="themeOptions" />
          </div>

          <div class="menu-footer">
            <Button variant="secondary" @click="openScan">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" stroke="currentColor" stroke-width="1.3" /><rect x="12" y="2" width="6" height="6" stroke="currentColor" stroke-width="1.3" /><rect x="2" y="12" width="6" height="6" stroke="currentColor" stroke-width="1.3" /><path d="M12 12h2.5M16 12h2M12 16h2M16 15v3h2" stroke="currentColor" stroke-width="1.3" /></svg>
              Scan QR Code
            </Button>
            <p class="menu-version">Versione in uso: 0.0.000</p>
            <p class="menu-made-by">
              Made by
              <img src="/images/gewiss-logo.png" alt="Gewiss" class="menu-made-by-logo" />
              · KINsync
            </p>
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
  padding: 12px 20px 24px;
  box-shadow: var(--shadow-menu);
  overflow-y: auto;
}

.menu-top {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0 16px;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  text-align: left;
  cursor: pointer;
}

.menu-theme {
  padding-top: 20px;
}

.menu-section-title {
  margin: 0 0 10px;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.menu-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 24px;
}

.menu-version {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
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
  height: 12px;
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
