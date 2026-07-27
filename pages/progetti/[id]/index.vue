<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const { projects } = useProjectsStore()
const { levels } = useLevelsStore(projectId)
const { provisionedDevices, updateDevice } = useDeviceCatalog(projectId)
const { groups } = useGroupsStore(projectId)
const { scenes } = useScenesStore(projectId)
const { goBack, goForward } = useNavStack()

const project = computed(() => projects.value.find((p) => p.id === projectId))
const activeTab = ref((route.query.tab as string) || 'livelli')
const menuOpen = ref(false)
const showAddSheet = ref(false)

const tabs = [
  { value: 'livelli', label: 'Progetto', icon: 'project' },
  { value: 'dispositivi', label: 'Dispositivi', icon: 'devices' },
  { value: 'scene', label: 'Scene', icon: 'scene' },
  { value: 'diagnostica', label: 'Diagnostica', icon: 'diagnostics' }
]

watch(activeTab, (tab: string) => {
  router.replace({ query: { ...route.query, tab } })
})

const totalSubLevels = computed(() => levels.value.reduce((sum, l) => sum + l.subLevels, 0))

const selectedLevelId = ref('')
watch(
  levels,
  (list) => {
    if (!selectedLevelId.value && list.length > 0) selectedLevelId.value = list[0].id
  },
  { immediate: true }
)

const selectedLevel = computed(() => levels.value.find((l) => l.id === selectedLevelId.value))

const devicesForSelectedLevel = computed(() =>
  provisionedDevices.value.filter((d) => d.levelId === selectedLevelId.value)
)

const zonesForSelectedLevel = computed(() => {
  const map = new Map<string, typeof devicesForSelectedLevel.value>()
  for (const device of devicesForSelectedLevel.value) {
    if (!map.has(device.zone)) map.set(device.zone, [])
    map.get(device.zone)!.push(device)
  }
  return Array.from(map.entries()).map(([zone, devices]) => ({ zone, devices }))
})

function deviceIdLabel(d: { id: string; type: string }) {
  const prefix = d.type.slice(0, 3).toUpperCase()
  const suffix = d.id.slice(-4).toUpperCase()
  return `ID ${prefix}:${suffix}`
}

function toggleDevice(id: string, on: boolean) {
  updateDevice(id, { on })
}
</script>

<template>
  <div class="screen">
    <div class="hero-photo">
      <img v-if="project?.image" :src="project.image" alt="" class="hero-image" />
      <StatusBar inverted class="hero-status-bar" />
      <div class="hero-overlay-top">
        <button type="button" class="hero-icon-btn" aria-label="Indietro" @click="goBack('/progetti')">
          <svg width="18" height="15" viewBox="0 0 20 16" fill="none"><path d="M1 8h17M1 8l6-6M1 8l6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <div class="hero-icon-group">
          <button type="button" class="hero-icon-btn" aria-label="Notifiche" @click="goForward('/account/notifiche')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          </button>
          <button type="button" class="hero-icon-btn" aria-label="Menu" @click="menuOpen = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          </button>
        </div>
      </div>
      <p class="hero-title">{{ project?.name }}</p>
    </div>

    <div class="stats-card">
      <div class="stat-col">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M2 9h16" stroke="currentColor" stroke-width="1.3" /></svg>
        <span class="stat-label">Livelli</span>
        <span class="stat-value">{{ levels.length }}</span>
      </div>
      <span class="stat-divider" />
      <div class="stat-col">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.3" /><rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.3" /><rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.3" /></svg>
        <span class="stat-label">Sottolivelli</span>
        <span class="stat-value">{{ totalSubLevels }}</span>
      </div>
      <span class="stat-divider" />
      <div class="stat-col">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        <span class="stat-label">Dispositivi</span>
        <span class="stat-value">{{ provisionedDevices.length }}</span>
      </div>
    </div>
    <p class="last-sync">Ultima sincronizzazione: {{ project?.lastSync }}</p>

    <div class="body">
      <section class="scenes">
        <SectionHeader title="Scenari" :divider="false" />
        <div class="scene-icon-row">
          <button
            v-for="scene in scenes"
            :key="scene.id"
            type="button"
            class="scene-icon-item"
            @click="goForward(`/progetti/${projectId}/scene/${scene.id}`)"
          >
            <span class="scene-icon-circle"><SceneIcon :icon="scene.icon" :size="20" /></span>
            <span class="scene-icon-label">{{ scene.name }}</span>
          </button>
          <button type="button" class="scene-icon-item" @click="goForward(`/progetti/${projectId}/scene/nuova`)">
            <span class="scene-icon-circle new">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </span>
            <span class="scene-icon-label">Nuova</span>
          </button>
        </div>
      </section>

      <section class="tab-content">
        <template v-if="activeTab === 'livelli'">
          <template v-if="levels.length === 0">
            <EmptyState variant="card" title="Nessun livello creato" subtitle="Aggiungi almeno un livello per organizzare il tuo progetto.">
              <Button variant="secondary" @click="goForward(`/progetti/${projectId}/livelli/nuovo`)">+ Aggiungi livelli</Button>
            </EmptyState>
          </template>
          <template v-else>
            <div class="floor-tabs">
              <button
                v-for="(level, i) in levels"
                :key="level.id"
                type="button"
                class="floor-tab"
                :class="{ active: selectedLevelId === level.id }"
                @click="selectedLevelId = level.id"
              >
                {{ level.name || `Piano ${i + 1}` }}
              </button>
            </div>
            <p class="floor-summary">{{ selectedLevel?.subLevels || 0 }} sottolivelli · {{ devicesForSelectedLevel.length }} dispositivi</p>

            <div class="floorplan-card">
              <div class="floorplan-caption">PLANIMETRIA {{ (selectedLevel?.name || '').toUpperCase() }}</div>
              <svg class="floorplan-svg" viewBox="0 0 300 130" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="298" height="128" fill="#fff" stroke="#c7d2da" stroke-width="1" />
                <path d="M1 1v128M300 1v128" stroke="#c7d2da" stroke-width="1" />
                <g stroke="#8fa3b3" stroke-width="1">
                  <rect x="12" y="14" width="42" height="46" />
                  <rect x="58" y="14" width="42" height="46" />
                  <rect x="104" y="14" width="42" height="46" />
                  <rect x="150" y="14" width="42" height="46" />
                  <rect x="196" y="14" width="42" height="46" />
                  <rect x="242" y="14" width="46" height="46" />
                  <rect x="12" y="66" width="130" height="50" />
                  <rect x="150" y="66" width="138" height="50" />
                </g>
                <g fill="#c9d6df">
                  <circle cx="33" cy="37" r="3" />
                  <circle cx="79" cy="37" r="3" />
                  <circle cx="125" cy="37" r="3" />
                  <circle cx="171" cy="37" r="3" />
                  <circle cx="217" cy="37" r="3" />
                  <circle cx="263" cy="37" r="3" />
                </g>
              </svg>
              <button type="button" class="floorplan-expand" aria-label="Espandi planimetria">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7 2H2v5M13 2h5v5M2 13v5h5M18 13v5h-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
            </div>

            <template v-if="zonesForSelectedLevel.length === 0">
              <EmptyState variant="card" title="Nessun dispositivo in questo livello" subtitle="Aggiungi dispositivi a questo livello per vederli qui.">
                <Button variant="secondary" @click="goForward(`/progetti/${projectId}/dispositivi/scan?levelId=${selectedLevelId}`)">+ Aggiungi dispositivi</Button>
              </EmptyState>
            </template>
            <template v-else>
              <div v-for="group in zonesForSelectedLevel" :key="group.zone" class="zone-card">
                <p class="zone-title">{{ group.zone }}</p>
                <p class="zone-count">{{ group.devices.length }} dispositivi</p>
                <div v-for="d in group.devices" :key="d.id" class="zone-device-row">
                  <IconBadge :size="32">
                    <svg v-if="d.type === 'Lampada'" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="5" stroke="currentColor" stroke-width="1.3" /><path d="M8 15h4M8.5 17h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
                    <svg v-else-if="d.type === 'Sensore'" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" /><circle cx="10" cy="10" r="2.4" fill="currentColor" /></svg>
                    <svg v-else width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
                  </IconBadge>
                  <span class="zone-device-text" @click="goForward(`/progetti/${projectId}/dispositivi/${d.id}/configura`)">
                    <span class="zone-device-code">{{ d.name }}</span>
                    <span class="zone-device-type">{{ deviceIdLabel(d) }}</span>
                  </span>
                  <ToggleSwitch v-if="d.type === 'Lampada'" :model-value="!!d.on" @update:model-value="toggleDevice(d.id, $event)" />
                </div>
                <button
                  type="button"
                  class="zone-add-btn"
                  @click="goForward(`/progetti/${projectId}/dispositivi/scan?levelId=${selectedLevelId}&zona=${encodeURIComponent(group.zone)}`)"
                >
                  + Aggiungi dispositivo
                </button>
              </div>
            </template>
          </template>
        </template>

        <template v-else-if="activeTab === 'dispositivi'">
          <template v-if="provisionedDevices.length === 0">
            <EmptyState variant="card" title="Nessun dispositivo aggiunto" subtitle="Avvia una scansione Bluetooth per individuare i dispositivi da aggiungere.">
              <Button variant="secondary" @click="goForward(`/progetti/${projectId}/dispositivi/scan`)">+ Aggiungi dispositivi</Button>
            </EmptyState>
          </template>
          <template v-else>
            <div class="device-list">
              <DeviceRow
                v-for="d in provisionedDevices"
                :key="d.id"
                :code="d.name"
                :type="d.type"
                :show-settings="true"
                @toggle="goForward(`/progetti/${projectId}/dispositivi/${d.id}/configura`)"
                @settings="goForward(`/progetti/${projectId}/dispositivi/${d.id}/configura`)"
              />
            </div>
          </template>
        </template>

        <template v-else-if="activeTab === 'scene'">
          <template v-if="scenes.length === 0">
            <EmptyState variant="card" title="Nessuno scenario creato" subtitle="Crea uno scenario per controllare più dispositivi con un solo tocco.">
              <Button variant="secondary" @click="goForward(`/progetti/${projectId}/scene/nuova`)">+ Crea scenario</Button>
            </EmptyState>
          </template>
          <template v-else>
            <ListItem
              v-for="scene in scenes"
              :key="scene.id"
              :title="scene.name"
              :subtitle-strong="String(scene.deviceIds.length)"
              subtitle="dispositivi"
              clickable
              @click="goForward(`/progetti/${projectId}/scene/${scene.id}`)"
            />
            <Button variant="secondary" @click="goForward(`/progetti/${projectId}/scene/nuova`)">+ Crea scenario</Button>
          </template>
        </template>

        <template v-else-if="activeTab === 'diagnostica'">
          <EmptyState variant="card" title="Diagnostica non ancora disponibile" subtitle="Questa funzionalità sarà disponibile in un prossimo aggiornamento." />
        </template>
      </section>
    </div>

    <nav class="project-nav">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="project-nav-item"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <svg v-if="tab.icon === 'project'" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.7 2 4 4.7 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><circle cx="10" cy="8" r="2.2" stroke="currentColor" stroke-width="1.4" /></svg>
        <svg v-else-if="tab.icon === 'devices'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" /></svg>
        <svg v-else-if="tab.icon === 'scene'" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.4" /><path d="M10 1v2M10 17v2M1 10h2M17 10h2M4 4l1.5 1.5M14.5 14.5L16 16M16 4l-1.5 1.5M5.5 14.5L4 16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 15h16M4 15V9l3-2 3 3 4-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span class="project-nav-label">{{ tab.label }}</span>
      </button>
    </nav>

    <button type="button" class="fab" aria-label="Aggiungi" @click="showAddSheet = true">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="#fff" stroke-width="1.8" stroke-linecap="round" /></svg>
    </button>

    <BottomSheet v-model="showAddSheet" title="Aggiungi">
      <button type="button" class="sheet-action" @click="showAddSheet = false; goForward(`/progetti/${projectId}/livelli/nuovo`)">Aggiungi livello</button>
      <button type="button" class="sheet-action" @click="showAddSheet = false; goForward(`/progetti/${projectId}/dispositivi/scan?levelId=${selectedLevelId}`)">Aggiungi dispositivo</button>
      <button type="button" class="sheet-action" @click="showAddSheet = false; goForward(`/progetti/${projectId}/gruppi/nuovo`)">Crea gruppo</button>
    </BottomSheet>

    <SideMenu v-model="menuOpen" :project-id="projectId" />
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  position: relative;
}

.hero-photo {
  position: relative;
  height: 220px;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--color-primary);
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.1) 35%, rgba(0, 0, 0, 0.65) 100%);
}

.hero-status-bar {
  position: relative;
  z-index: 1;
}

.hero-overlay-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px 0;
}

.hero-icon-group {
  display: flex;
  gap: 8px;
}

.hero-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hero-title {
  position: relative;
  z-index: 1;
  margin: auto 0 0;
  padding: 0 20px 34px;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #fff;
  text-align: left;
}

.hero-photo {
  display: flex;
  flex-direction: column;
}

.stats-card {
  position: relative;
  z-index: 2;
  margin: -22px var(--space-page-x) 0;
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border-radius: 20px;
  box-shadow: 0 10px 24px -10px rgba(17, 17, 17, 0.25);
  padding: 14px 8px;
}

.stat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--color-text-secondary);
}

.stat-label {
  font-size: 11px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-divider {
  width: 1px;
  align-self: stretch;
  background: var(--color-border);
}

.last-sync {
  margin: 10px 0 0;
  padding: 0 var(--space-page-x);
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scenes {
  padding: 16px var(--space-page-x) 0;
}

.scene-icon-row {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 12px;
}

.scene-icon-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.scene-icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-icon-circle.new {
  background: var(--color-surface);
  border: 1.5px dashed var(--color-border-secondary);
  color: var(--color-text-secondary);
}

.scene-icon-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px var(--space-page-x) 100px;
}

.floor-tabs {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border);
}

.floor-tab {
  flex-shrink: 0;
  padding: 0 0 10px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  font-weight: 500;
  cursor: pointer;
}

.floor-tab.active {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 700;
}

.floor-summary {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.floorplan-card {
  position: relative;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: #fff;
}

.floorplan-caption {
  position: absolute;
  top: 8px;
  left: 10px;
  z-index: 1;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

.floorplan-svg {
  width: 100%;
  height: auto;
  display: block;
}

.floorplan-expand {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-card);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.zone-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
  padding: 14px 14px 6px;
}

.zone-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.zone-count {
  margin: 2px 0 8px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.zone-device-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid var(--color-border);
}

.zone-device-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  cursor: pointer;
}

.zone-device-code {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.zone-device-type {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.zone-add-btn {
  margin: 4px 0 10px;
  padding: 10px;
  border-radius: var(--radius-input);
  border: 1.5px dashed var(--color-border-secondary);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  cursor: pointer;
}

.device-list {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 0 14px;
}

.device-list :deep(.device-row:last-child) {
  border-bottom: none;
}

.project-nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: flex;
  align-items: stretch;
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.project-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.project-nav-item.active {
  color: var(--color-accent);
}

.project-nav-label {
  font-size: 11px;
  font-weight: 500;
}

.fab {
  position: absolute;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 4px solid var(--color-surface);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-fab);
  z-index: 5;
}

.sheet-action {
  width: 100%;
  text-align: left;
  padding: 14px 0;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  color: var(--color-primary);
  cursor: pointer;
}

.sheet-action:last-child {
  border-bottom: none;
}
</style>
