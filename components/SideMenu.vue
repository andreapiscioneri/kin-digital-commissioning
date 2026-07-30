<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; projectId?: string }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const { goForward } = useNavStack()
const colorMode = useColorMode()
const menuLogoSrc = computed(() => (colorMode.value === 'dark' ? '/images/Kin-2.png' : '/images/Kin.png'))
const { projects } = useProjectsStore()
const currentProject = computed(() => projects.value.find(p => p.id === props.projectId))
const expandedSection = ref<string | null>(null)

const themeOptions = [
  { value: 'light', label: 'Chiaro' },
  { value: 'dark', label: 'Scuro' },
  { value: 'system', label: 'Sistema' }
]

type MenuItem = { label: string; icon: 'user' | 'help' | 'team' | 'bell' | 'plus' | 'home' | 'report' | 'code' | 'chart' | 'doc'; path: string }
type MenuSectionItem = { label: string; icon: string; items?: { label: string; path: string }[] }

const items = computed<MenuSectionItem[]>(() => {
  if (props.projectId) {
    return [
      { label: 'Modifica progetto', icon: 'home', path: `/progetti/${props.projectId}` },
      { label: 'Gestione utenti', icon: 'team', path: `/progetti/${props.projectId}/utenti` },
      { label: 'Gestione avvisi', icon: 'bell', path: '/account/notifiche' },
      { 
        label: 'Programmazione', 
        icon: 'code',
        items: [
          { label: 'Gruppi', path: `/progetti/${props.projectId}` },
          { label: 'Automazioni', path: `/progetti/${props.projectId}` },
          { label: 'Scene', path: `/progetti/${props.projectId}` }
        ]
      },
      {
        label: 'Diagnostica',
        icon: 'chart',
        items: [
          { label: 'Documentazione/Report', path: `/progetti/${props.projectId}` }
        ]
      },
      { 
        label: 'Documentazione', 
        icon: 'doc',
        items: [
          { label: 'Repository', path: `/progetti/${props.projectId}` },
          { label: 'Foto del progetto', path: `/progetti/${props.projectId}` }
        ]
      }
    ]
  }
  return [
    { label: 'Dati profilo', icon: 'user', path: '/account/profilo' },
    {
      label: 'Team di collaboratori',
      icon: 'team',
      path: '/account/profilo'
    },
    { label: 'Gestione avvisi', icon: 'bell', path: '/account/notifiche' },
    { label: 'Assistenza', icon: 'help', path: '/account/assistenza' },
    { label: 'Crea nuovo progetto', icon: 'plus', path: '/progetti/nuovo' }
  ]
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

function openNewProject() {
  close()
  goForward('/progetti/nuovo')
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

          <template v-if="props.projectId && currentProject">
            <div class="menu-project-header">
              <p class="menu-project-name">{{ currentProject.name }}</p>
            </div>
          </template>

          <nav class="menu-list">
            <template v-if="props.projectId">
              <template v-for="item in items" :key="item.label">
                <button 
                  type="button" 
                  class="menu-item" 
                  :class="{ expanded: expandedSection === item.label }"
                  @click="item.items ? (expandedSection = expandedSection === item.label ? null : item.label) : open(item.path)"
                >
                  <svg v-if="item.icon === 'home'" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-7 7 7v7a1 1 0 01-1 1h-12a1 1 0 01-1-1v-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M7.5 13v5h5v-5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
                  <svg v-else-if="item.icon === 'team'" width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6.5" r="3" stroke="currentColor" stroke-width="1.4" /><path d="M1.5 17c1-3 3-4.7 5.5-4.7S11.5 14 12.5 17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="14.5" cy="7" r="2.4" stroke="currentColor" stroke-width="1.4" /><path d="M13 12.6c2.2.2 3.7 1.7 4.5 4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
                  <svg v-else-if="item.icon === 'bell'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                  <svg v-else-if="item.icon === 'code'" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 4l-4 6 4 6M14 4l4 6-4 6M11 3l-2 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  <svg v-else-if="item.icon === 'chart'" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M2 7h16M5 10v6M10 8v8M15 6v10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
                  <svg v-else-if="item.icon === 'doc'" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 2h8l4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M13 2v4h4M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  <span>{{ item.label }}</span>
                  <svg v-if="item.items" width="8" height="14" viewBox="0 0 8 14" fill="none" class="menu-item-chevron"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
                <template v-if="item.items && expandedSection === item.label">
                  <button 
                    v-for="subitem in item.items" 
                    :key="subitem.label"
                    type="button" 
                    class="menu-subitem"
                    @click="open(subitem.path)"
                  >
                    {{ subitem.label }}
                  </button>
                </template>
              </template>
            </template>
            <template v-else>
              <button v-for="item in items" :key="item.label" type="button" class="menu-item" @click="open(item.path)">
              <svg v-if="item.icon === 'home'" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-7 7 7v7a1 1 0 01-1 1h-12a1 1 0 01-1-1v-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M7.5 13v5h5v-5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
              <svg v-else-if="item.icon === 'report'" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M2 7h16M6 10v6M10 12v4M14 10v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
              <svg v-else-if="item.icon === 'code'" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 4l-4 6 4 6M14 4l4 6-4 6M11 3l-2 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <svg v-else-if="item.icon === 'chart'" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M2 7h16M5 10v6M10 8v8M15 6v10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
              <svg v-else-if="item.icon === 'doc'" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 2h8l4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M13 2v4h4M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <svg v-else-if="item.icon === 'user'" width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.5" stroke="currentColor" stroke-width="1.4" /><path d="M3 17c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <svg v-else-if="item.icon === 'help'" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.4" /><path d="M12 3v2M12 17v2M21 12h-2M5 12H3M18.5 5.5l-1.4 1.4M7.9 17.1l-1.4 1.4M18.5 18.5l-1.4-1.4M7.9 6.9l-1.4-1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.4" /></svg>
              <svg v-else-if="item.icon === 'team'" width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6.5" r="3" stroke="currentColor" stroke-width="1.4" /><path d="M1.5 17c1-3 3-4.7 5.5-4.7S11.5 14 12.5 17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="14.5" cy="7" r="2.4" stroke="currentColor" stroke-width="1.4" /><path d="M13 12.6c2.2.2 3.7 1.7 4.5 4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
              <svg v-else-if="item.icon === 'battery'" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="1.5" y="6" width="14" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4" /><path d="M17.5 8.5v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M9 8l-2.2 3.2h2.6L7.2 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <svg v-else-if="item.icon === 'plus'" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
              <span>{{ item.label }}</span>
            </button>
            </template>
          </nav>

          <div class="menu-footer">
            <div class="menu-theme-modes">
              <button type="button" class="mode-icon" :class="{ active: colorMode.value === 'light' }" title="Light mode" @click="colorMode.preference = 'light'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
              <button type="button" class="mode-icon" :class="{ active: colorMode.value === 'dark' }" title="Dark mode" @click="colorMode.preference = 'dark'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
            </div>

            <Button variant="secondary" @click="openScan">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" stroke="currentColor" stroke-width="1.3" /><rect x="12" y="2" width="6" height="6" stroke="currentColor" stroke-width="1.3" /><rect x="2" y="12" width="6" height="6" stroke="currentColor" stroke-width="1.3" /><path d="M12 12h2.5M16 12h2M12 16h2M16 15v3h2" stroke="currentColor" stroke-width="1.3" /></svg>
              Scan QR Code
            </Button>
            <p class="menu-version">Versione in uso: 0.0.000</p>
            <img :src="menuLogoSrc" alt="Kin" class="menu-brand-logo" />
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
  padding: calc(env(safe-area-inset-top, 0) + 8px) 0 16px;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-project-header {
  padding: 16px 0 12px;
  border-bottom: 1px solid var(--color-border);
}

.menu-project-name {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 700;
  color: var(--color-primary);
}

.menu-footer-divider {
  height: 1px;
  background: var(--color-border);
  margin: 20px 0;
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

.menu-item:last-child {
  border-bottom: none;
}

.menu-item-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  margin-left: auto;
  transition: transform 0.2s ease;
}

.menu-item.expanded .menu-item-chevron {
  transform: rotate(90deg);
}

.menu-subitem {
  display: block;
  width: 100%;
  padding: 10px 0 10px 30px;
  border: none;
  border-bottom: 1px solid var(--color-border-secondary);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: color 0.15s ease;
}

.menu-subitem:hover {
  color: var(--color-primary);
}

.menu-subitem:last-child {
  border-bottom: none;
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
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.menu-brand-logo {
  height: 92px;
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

.menu-theme-modes {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid var(--color-border-secondary);
  border-bottom: 1px solid var(--color-border-secondary);
}

.mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 1.5px solid var(--color-border-secondary);
  border-radius: 16px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.mode-icon.active {
  border-color: var(--color-accent);
  background: rgba(219, 55, 0, 0.07);
  color: var(--color-accent);
}

.mode-icon.active svg {
  stroke: var(--color-accent);
  stroke-width: 1.8;
}

.mode-icon:active {
  transform: scale(0.95);
}

.mode-icon svg {
  color: var(--color-accent);
}
</style>
