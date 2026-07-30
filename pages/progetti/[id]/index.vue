<script setup lang="ts">
import type { ProvisionedDevice } from '~/composables/useDeviceCatalog'
import type { Collaborator } from '~/composables/useCollaboratorsStore'
import type { Level } from '~/composables/useLevelsStore'
import { projectImageOptions } from '~/composables/useProjectsStore'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const { projects, updateProject } = useProjectsStore()
const { levels } = useLevelsStore(projectId)
const { provisionedDevices, updateDevice } = useDeviceCatalog(projectId)
const { collaborators, removeCollaborator } = useCollaboratorsStore(projectId)
const { groups } = useGroupsStore(projectId)
const { scenes, updateScene, removeScene } = useScenesStore(projectId)
const { installerRoleEnabled } = useCommissioningFlow()
const { goBack, goForward } = useNavStack()

seedBeghelliIfEmpty(projectId)

const project = computed(() => projects.value.find((p) => p.id === projectId))
const hasWarmFilter = computed(() => {
  if (!project.value) return false
  return project.value.id === 'rossi-spa' || project.value.id.toLowerCase().includes('verdi') || project.value.name.toLowerCase().includes('verdi')
})
const menuOpen = ref(false)
const showFabFan = ref(false)
const showImageSheet = ref(false)
const showFloorplanExpanded = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const renamingSceneId = ref<string | null>(null)
const renameSceneValue = ref('')

const tabs = [
  { value: 'livelli', label: 'Progetto', icon: 'project' },
  { value: 'dispositivi', label: 'Dispositivi', icon: 'devices' },
  { value: 'scene', label: 'Scene', icon: 'scene' },
  { value: 'collaboratori', label: 'Diagnostica', icon: 'users' }
]

type ProjectTab = 'livelli' | 'dispositivi' | 'scene' | 'collaboratori'
const allowedTabs: ProjectTab[] = tabs.map((tab) => tab.value as ProjectTab)

function normalizeTab(tab: unknown): ProjectTab {
  if (typeof tab === 'string' && allowedTabs.includes(tab as ProjectTab)) {
    return tab as ProjectTab
  }
  return 'livelli'
}

const activeTab = ref<ProjectTab>(normalizeTab(route.query.tab))

function selectTab(tab: string) {
  const nextTab = normalizeTab(tab)
  if (nextTab === activeTab.value) return
  cancelInlineRename()
  showFabFan.value = false
  activeTab.value = nextTab
}

watch(activeTab, (tab: ProjectTab) => {
  if (route.query.tab === tab) return
  router.replace({ query: { ...route.query, tab } })
})

watch(() => route.query.tab, (tab: unknown) => {
  const normalizedTab = normalizeTab(tab)
  if (normalizedTab !== activeTab.value) {
    cancelInlineRename()
    activeTab.value = normalizedTab
  }
})

const totalSubLevels = computed(() => levels.value.reduce((sum: number, l: Level) => sum + l.subLevels, 0))

const selectedLevelId = ref('')
watch(
  levels,
  (list: Level[]) => {
    if (!selectedLevelId.value && list.length > 0) selectedLevelId.value = list[0].id
  },
  { immediate: true }
)

const selectedLevel = computed(() => levels.value.find((l: Level) => l.id === selectedLevelId.value))

const devicesForSelectedLevel = computed(() =>
  provisionedDevices.value.filter((d: ProvisionedDevice) => d.levelId === selectedLevelId.value)
)

const floorplanRooms = [
  { x: 12, y: 14, w: 42, h: 46, dot: { cx: 33, cy: 37 } },
  { x: 58, y: 14, w: 42, h: 46, dot: { cx: 79, cy: 37 } },
  { x: 104, y: 14, w: 42, h: 46, dot: { cx: 125, cy: 37 } },
  { x: 150, y: 14, w: 42, h: 46, dot: { cx: 171, cy: 37 } },
  { x: 196, y: 14, w: 42, h: 46, dot: { cx: 217, cy: 37 } },
  { x: 242, y: 14, w: 46, h: 46, dot: { cx: 263, cy: 37 } },
  { x: 12, y: 66, w: 130, h: 50, dot: null },
  { x: 150, y: 66, w: 138, h: 50, dot: null }
]

const floorplanLampStates = computed(() =>
  devicesForSelectedLevel.value.filter((d: ProvisionedDevice) => d.type === 'Lampada').map((d: ProvisionedDevice) => !!d.on)
)

const zonesForSelectedLevel = computed(() => {
  const map = new Map<string, typeof devicesForSelectedLevel.value>()
  for (const device of devicesForSelectedLevel.value) {
    if (!map.has(device.zone)) map.set(device.zone, [])
    map.get(device.zone)!.push(device)
  }

  const configuredZones = selectedLevel.value?.subLevelNames?.length
    ? [...selectedLevel.value.subLevelNames]
    : selectedLevel.value?.name
      ? [selectedLevel.value.name]
      : []

  const knownZones = configuredZones.map((zone) => ({ zone, devices: map.get(zone) || [] }))
  const extraZones = Array.from(map.entries())
    .filter(([zone]) => !configuredZones.includes(zone))
    .map(([zone, devices]) => ({ zone, devices }))

  return [...knownZones, ...extraZones]
})

const configuredDevicesCount = computed(() =>
  provisionedDevices.value.filter((d: ProvisionedDevice) => d.configured).length
)

const pendingDevicesCount = computed(() => provisionedDevices.value.length - configuredDevicesCount.value)

const lampsOnCount = computed(() =>
  provisionedDevices.value.filter((d: ProvisionedDevice) => d.type === 'Lampada' && !!d.on).length
)

const onlineCollaboratorsCount = computed(() => collaborators.value.filter((collaborator: Collaborator) => collaborator.active).length)

const scenesWithoutDevicesCount = computed(() => scenes.value.filter((scene) => scene.deviceIds.length === 0).length)

const diagnosticsIssues = computed(() => {
  const issues: { label: string; detail: string; tone: 'ok' | 'warn' | 'critical' }[] = []

  if (levels.value.length === 0) {
    issues.push({
      label: 'Struttura livelli',
      detail: 'Nessun livello creato nel progetto.',
      tone: 'critical'
    })
  } else {
    issues.push({
      label: 'Struttura livelli',
      detail: `${levels.value.length} livelli e ${totalSubLevels.value} sottolivelli configurati.`,
      tone: 'ok'
    })
  }

  if (provisionedDevices.value.length === 0) {
    issues.push({
      label: 'Dispositivi',
      detail: 'Nessun dispositivo associato al progetto.',
      tone: 'critical'
    })
  } else if (pendingDevicesCount.value > 0) {
    issues.push({
      label: 'Dispositivi',
      detail: `${pendingDevicesCount.value} dispositivi richiedono ancora configurazione.`,
      tone: 'warn'
    })
  } else {
    issues.push({
      label: 'Dispositivi',
      detail: 'Tutti i dispositivi risultano configurati.',
      tone: 'ok'
    })
  }

  if (scenes.value.length === 0) {
    issues.push({
      label: 'Scene',
      detail: 'Nessuna scena configurata.',
      tone: 'warn'
    })
  } else if (scenesWithoutDevicesCount.value > 0) {
    issues.push({
      label: 'Scene',
      detail: `${scenesWithoutDevicesCount.value} scene senza dispositivi assegnati.`,
      tone: 'warn'
    })
  } else {
    issues.push({
      label: 'Scene',
      detail: 'Scene complete e pronte all\'uso.',
      tone: 'ok'
    })
  }

  if (collaborators.value.length === 0) {
    issues.push({
      label: 'Team',
      detail: 'Nessun collaboratore invitato al progetto.',
      tone: 'warn'
    })
  } else {
    issues.push({
      label: 'Team',
      detail: `${onlineCollaboratorsCount.value}/${collaborators.value.length} collaboratori online.`,
      tone: 'ok'
    })
  }

  return issues
})

const diagnosticsHeadline = computed(() => {
  const criticalCount = diagnosticsIssues.value.filter((issue) => issue.tone === 'critical').length
  const warnCount = diagnosticsIssues.value.filter((issue) => issue.tone === 'warn').length
  if (criticalCount > 0) return 'Intervento necessario'
  if (warnCount > 0) return 'Stato da completare'
  return 'Stato operativo'
})

function deviceIdLabel(d: { id: string; type: string }) {
  const prefix = d.type.slice(0, 3).toUpperCase()
  const suffix = d.id.slice(-4).toUpperCase()
  return `ID ${prefix}:${suffix}`
}

function collaboratorInitial(email: string) {
  const initial = email.trim().charAt(0)
  return initial ? initial.toUpperCase() : '?'
}

const canManageCollaborators = computed(() =>
  installerRoleEnabled.value || collaborators.value.some((collaborator: Collaborator) => collaborator.role === 'Installer')
)

function removeCollaboratorFromProject(collaboratorId: string) {
  if (!canManageCollaborators.value) return
  removeCollaborator(collaboratorId)
}

function openSceneEditor(sceneId: string) {
  goForward(`/progetti/${projectId}/scene/nuova?sceneId=${sceneId}`)
}

function startInlineRename(scene: { id: string; name: string }) {
  renamingSceneId.value = scene.id
  renameSceneValue.value = scene.name
}

function commitInlineRename(sceneId: string) {
  const nextName = renameSceneValue.value.trim()
  if (!nextName) return
  updateScene(sceneId, { name: nextName })
  renamingSceneId.value = null
  renameSceneValue.value = ''
}

function cancelInlineRename() {
  renamingSceneId.value = null
  renameSceneValue.value = ''
}

function deleteSceneFromProject(sceneId: string) {
  removeScene(sceneId)
  if (renamingSceneId.value === sceneId) {
    cancelInlineRename()
  }
}

function toggleDevice(id: string, on: boolean) {
  updateDevice(id, { on })
}

function replaceProjectImage(image: string) {
  updateProject(projectId, { image })
  showImageSheet.value = false
}

function openDeviceImagePicker() {
  imageInput.value?.click()
}

function onProjectImageSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      updateProject(projectId, { image: reader.result })
      showImageSheet.value = false
    }
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function closeFabFan() {
  showFabFan.value = false
}

function toggleFabFan() {
  addDevice()
}

function addLevel() {
  closeFabFan()
  goForward(`/progetti/${projectId}/livelli/nuovo`)
}

function addSubLevel() {
  closeFabFan()
  if (selectedLevelId.value) {
    goForward(`/progetti/${projectId}/livelli/${selectedLevelId.value}`)
    return
  }
  goForward(`/progetti/${projectId}/livelli/nuovo`)
}

function addDevice() {
  closeFabFan()
  const levelQuery = selectedLevelId.value ? `?levelId=${selectedLevelId.value}` : ''
  goForward(`/progetti/${projectId}/dispositivi/scan${levelQuery}`)
}
</script>

<template>
  <div class="screen">
    <div class="hero-photo" :class="{ 'is-rossi': hasWarmFilter }">
      <img v-if="project?.image" :src="project.image" alt="" class="hero-image" :class="{ 'hero-image-rossi': hasWarmFilter }" />
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
      <div class="hero-bottom-row">
        <span class="hero-title-group">
          <p class="hero-title">{{ project?.name }}</p>
          <span v-if="project?.category" class="hero-category-badge">{{ project.category }}</span>
        </span>
        <button type="button" class="hero-image-edit" aria-label="Cambia immagine progetto" @click="showImageSheet = true">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 3a3 3 0 014 4l-9 9-4.5 1.5L4 13z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
          Modifica immagine
        </button>
      </div>
    </div>

    <div class="stats-card">
      <button type="button" class="stat-col" :class="{ active: activeTab === 'livelli' }" @click="selectTab('livelli')">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M2 9h16" stroke="currentColor" stroke-width="1.3" /></svg>
        <span class="stat-label">Livelli</span>
        <span class="stat-value">{{ levels.length }}</span>
      </button>
      <span class="stat-divider" />
      <button type="button" class="stat-col" :class="{ active: activeTab === 'livelli' }" @click="selectTab('livelli')">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.3" /><rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.3" /><rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.3" /></svg>
        <span class="stat-label">Sottolivelli</span>
        <span class="stat-value">{{ totalSubLevels }}</span>
      </button>
      <span class="stat-divider" />
      <button type="button" class="stat-col" :class="{ active: activeTab === 'dispositivi' }" @click="selectTab('dispositivi')">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        <span class="stat-label">Dispositivi</span>
        <span class="stat-value">{{ provisionedDevices.length }}</span>
      </button>
      <span class="stat-divider" />
      <button type="button" class="stat-col" :class="{ active: activeTab === 'collaboratori' }" @click="selectTab('collaboratori')">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6.5" r="3" stroke="currentColor" stroke-width="1.3" /><path d="M1.5 17c1-3 3-4.7 5.5-4.7S11.5 14 12.5 17" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="14.5" cy="7" r="2.4" stroke="currentColor" stroke-width="1.3" /><path d="M13 12.6c2.2.2 3.7 1.7 4.5 4.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        <span class="stat-label">Diagnostica</span>
        <div v-if="collaborators.length > 0" class="collaborator-avatar-stack">
          <span
            v-for="collaborator in collaborators"
            :key="collaborator.id"
            class="collaborator-avatar-mini"
            :class="{ 'is-active': collaborator.active }"
            :title="collaborator.email"
          >{{ collaboratorInitial(collaborator.email) }}</span>
        </div>
        <span v-else class="stat-value">0</span>
      </button>
    </div>
    <p class="last-sync">Ultima sincronizzazione: {{ project?.lastSync }}</p>

    <div class="body">
      <section class="scenes">
        <SectionHeader title="Scenari" :divider="false" />
        <div class="scene-icon-row">
          <div v-for="scene in scenes" :key="scene.id" class="scene-icon-item">
            <span class="scene-icon-circle"><SceneIcon :icon="scene.icon" :size="20" /></span>
            <span class="scene-icon-label">{{ scene.name }}</span>
          </div>
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
              <div class="floorplan-caption">PLANIMETRIA {{ (selectedLevel?.name || '').toUpperCase() }} · 3D</div>
              <FloorplanScene3D class="floorplan-3d-host" :rooms="floorplanRooms" :lamp-states="floorplanLampStates" />
              <p class="floorplan-hint">Trascina per ruotare · due dita per zoomare</p>
              <button type="button" class="floorplan-expand" aria-label="Espandi planimetria" @click="showFloorplanExpanded = true">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7 2H2v5M13 2h5v5M2 13v5h5M18 13v5h-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
            </div>

            <div v-if="showFloorplanExpanded" class="floorplan-modal">
              <div class="floorplan-modal-header">
                <span class="floorplan-modal-title">PLANIMETRIA {{ (selectedLevel?.name || '').toUpperCase() }} · 3D</span>
                <button type="button" class="floorplan-modal-close" aria-label="Chiudi vista espansa" @click="showFloorplanExpanded = false">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
                </button>
              </div>
              <FloorplanScene3D class="floorplan-3d-host floorplan-3d-host-expanded" :rooms="floorplanRooms" :lamp-states="floorplanLampStates" />
              <p class="floorplan-hint">Trascina per ruotare · due dita per zoomare</p>
            </div>

            <template v-if="zonesForSelectedLevel.length === 0">
              <EmptyState variant="card" title="Nessun dispositivo in questo livello" subtitle="Aggiungi dispositivi a questo livello per vederli qui.">
                <Button variant="secondary" @click="goForward(`/progetti/${projectId}/dispositivi/scan?levelId=${selectedLevelId}`)">+ Aggiungi dispositivi</Button>
              </EmptyState>
            </template>
            <template v-else>
              <div v-for="group in zonesForSelectedLevel" :key="group.zone" class="zone-card" @click="goForward(`/progetti/${projectId}/livelli/${selectedLevelId}`)">
                <div class="zone-header">
                  <div class="zone-header-text">
                    <p class="zone-title">{{ group.zone }}</p>
                    <p class="zone-count">{{ group.devices.length }} dispositivi</p>
                  </div>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" class="zone-chevron"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </div>
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

        <template v-else-if="activeTab === 'collaboratori'">
          <div class="diagnostic-card">
            <p class="diagnostic-title">Diagnostica progetto</p>
            <p class="diagnostic-headline">{{ diagnosticsHeadline }}</p>
            <p class="diagnostic-caption">Recap rapido dello stato attuale della configurazione.</p>
          </div>

          <div class="diagnostic-grid">
            <div class="diagnostic-kpi">
              <span class="diagnostic-kpi-label">Dispositivi configurati</span>
              <strong class="diagnostic-kpi-value">{{ configuredDevicesCount }}/{{ provisionedDevices.length }}</strong>
            </div>
            <div class="diagnostic-kpi">
              <span class="diagnostic-kpi-label">Lampade accese</span>
              <strong class="diagnostic-kpi-value">{{ lampsOnCount }}</strong>
            </div>
            <div class="diagnostic-kpi">
              <span class="diagnostic-kpi-label">Scene</span>
              <strong class="diagnostic-kpi-value">{{ scenes.length }}</strong>
            </div>
            <div class="diagnostic-kpi">
              <span class="diagnostic-kpi-label">Gruppi creati</span>
              <strong class="diagnostic-kpi-value">{{ groups.length }}</strong>
            </div>
          </div>

          <div class="diagnostic-list">
            <div v-for="issue in diagnosticsIssues" :key="issue.label" class="diagnostic-item" :class="`tone-${issue.tone}`">
              <span class="diagnostic-dot" />
              <span class="diagnostic-item-content">
                <strong class="diagnostic-item-title">{{ issue.label }}</strong>
                <span class="diagnostic-item-detail">{{ issue.detail }}</span>
              </span>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'scene'">
          <template v-if="scenes.length === 0">
            <EmptyState variant="card" title="Nessuno scenario creato" subtitle="Crea uno scenario per controllare più dispositivi con un solo tocco.">
              <Button variant="secondary" @click="goForward(`/progetti/${projectId}/scene/nuova`)">+ Crea scenario</Button>
            </EmptyState>
          </template>
          <template v-else>
            <div v-for="scene in scenes" :key="scene.id" class="scene-row">
              <IconBadge :size="32"><SceneIcon :icon="scene.icon" /></IconBadge>

              <div class="scene-main" @click="startInlineRename(scene)">
                <template v-if="renamingSceneId === scene.id">
                  <input
                    v-model="renameSceneValue"
                    class="scene-inline-input"
                    type="text"
                    maxlength="60"
                    @click.stop
                    @keydown.enter.prevent="commitInlineRename(scene.id)"
                    @keydown.esc.prevent="cancelInlineRename"
                  >
                </template>
                <template v-else>
                  <span class="scene-name">{{ scene.name }}</span>
                  <span class="scene-subtitle">{{ scene.deviceIds.length }} dispositivi</span>
                </template>
              </div>

              <div class="scene-actions">
                <button
                  v-if="renamingSceneId === scene.id"
                  type="button"
                  class="scene-action-link"
                  @click.stop="commitInlineRename(scene.id)"
                >
                  Salva
                </button>
                <button
                  v-if="renamingSceneId === scene.id"
                  type="button"
                  class="scene-action-link"
                  @click.stop="cancelInlineRename"
                >
                  Annulla
                </button>
                <button
                  v-if="renamingSceneId !== scene.id"
                  type="button"
                  class="scene-action-btn"
                  aria-label="Modifica scenario"
                  @click.stop="openSceneEditor(scene.id)"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.3 1.8l2.9 2.9L4.9 14 1.5 14.5 2 11.1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
                </button>
                <button
                  v-if="renamingSceneId !== scene.id"
                  type="button"
                  class="scene-action-btn scene-action-delete"
                  aria-label="Elimina scenario"
                  @click.stop="deleteSceneFromProject(scene.id)"
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3.5A1.5 1.5 0 019.5 2h1A1.5 1.5 0 0112 3.5V5M15 5v11a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 16V5h10z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M8.5 8.5v6M11.5 8.5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
                </button>
              </div>
            </div>
            <Button variant="secondary" @click="goForward(`/progetti/${projectId}/scene/nuova`)">+ Crea scenario</Button>
          </template>
        </template>

      </section>
    </div>

    <button
      v-if="showFabFan"
      type="button"
      class="fab-overlay"
      aria-label="Chiudi menu aggiunta"
      @click="closeFabFan"
    />

    <div class="fab-fan" :class="{ open: showFabFan }" aria-hidden="true">
      <button type="button" class="fab-action fab-action-level" aria-label="Aggiungi livello" @click="addLevel">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="3" y="2.5" width="14" height="15" rx="1.8" stroke="currentColor" stroke-width="1.3" /><path d="M3 7.5h14" stroke="currentColor" stroke-width="1.3" /><path d="M10 10v5M7.5 12.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        <span class="fab-action-label">Livello</span>
      </button>
      <button type="button" class="fab-action fab-action-sublevel" aria-label="Aggiungi sottolivello" @click="addSubLevel">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="4" rx="1.2" stroke="currentColor" stroke-width="1.2" /><rect x="3" y="9" width="14" height="4" rx="1.2" stroke="currentColor" stroke-width="1.2" /><path d="M10 13v4M8 15h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        <span class="fab-action-label">Sottolivello</span>
      </button>
      <button type="button" class="fab-action fab-action-device" aria-label="Aggiungi dispositivo" @click="addDevice">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><path d="M10 13.5v3M8.5 15h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        <span class="fab-action-label">Dispositivo</span>
      </button>
    </div>

    <button
      type="button"
      class="fab"
      :class="{ open: showFabFan }"
      aria-label="Aggiungi dispositivo"
      :aria-expanded="showFabFan"
      @click="toggleFabFan"
    >
      <svg class="fab-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="#fff" stroke-width="1.8" stroke-linecap="round" /></svg>
    </button>

    <BottomSheet v-model="showImageSheet" title="Immagine progetto">
      <button type="button" class="image-upload-btn" @click="openDeviceImagePicker">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3v9M6.5 6.5L10 3l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><rect x="3" y="12" width="14" height="5" rx="1.5" stroke="currentColor" stroke-width="1.5" /></svg>
        Carica da dispositivo
      </button>
      <div class="image-option-grid">
        <button
          v-for="image in projectImageOptions"
          :key="image"
          type="button"
          class="image-option"
          :class="{ selected: project?.image === image }"
          @click="replaceProjectImage(image)"
        >
          <img :src="image" alt="" />
          <span class="image-option-check" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10.5 3L4.8 8.7 1.8 5.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
        </button>
      </div>
    </BottomSheet>

    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      class="hidden-file-input"
      @change="onProjectImageSelected"
    />

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
  filter: grayscale(0.6) contrast(1.12) saturate(1.25);
}

.hero-image-rossi {
  filter: sepia(0.58) saturate(1.42) hue-rotate(-15deg) contrast(1.08) brightness(0.86);
}

.hero-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.2) 35%, rgba(0, 0, 0, 0.7) 100%);
}

.hero-photo.is-rossi::after {
  background: linear-gradient(to bottom, rgba(226, 92, 20, 0.24) 0%, rgba(190, 82, 26, 0.12) 40%, rgba(124, 45, 5, 0.2) 100%);
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
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hero-bottom-row {
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding: 0 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.hero-title-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}

.hero-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #fff;
  text-align: left;
  min-width: 0;
}

.hero-category-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.46);
  border: 1px solid rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.22);
}

.hero-image-edit {
  border: none;
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(17, 17, 17, 0.38);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex-shrink: 0;
}

.hero-photo {
  display: flex;
  flex-direction: column;
}

.stats-card {
  position: relative;
  z-index: 2;
  margin: -12px var(--space-page-x) 0;
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
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-family);
}

.stat-col.active {
  color: var(--color-text-secondary);
}

.stat-col.active .stat-value {
  color: var(--color-primary);
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

.collaborator-avatar-stack {
  display: flex;
  align-items: center;
}

.collaborator-avatar-mini {
  position: relative;
  z-index: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(17, 17, 17, 0.35);
  cursor: default;
}

.collaborator-avatar-mini.is-active {
  z-index: 1;
  background: var(--color-accent);
  color: #fff;
}

.collaborator-avatar-mini:not(:first-child) {
  margin-left: -8px;
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
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scene-icon-row::-webkit-scrollbar {
  display: none;
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

.scene-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.scene-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
}

.scene-name {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.scene-subtitle {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.scene-inline-input {
  width: 100%;
  border: 1px solid var(--color-border-secondary);
  border-radius: 10px;
  padding: 8px 10px;
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  color: var(--color-primary);
  background: var(--color-surface);
}

.scene-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.scene-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: var(--color-surface-alt);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.scene-action-delete {
  color: var(--color-error);
}

.scene-action-link {
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 600;
  padding: 0 2px;
  cursor: pointer;
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
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.floor-tabs::-webkit-scrollbar {
  display: none;
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
  background: var(--color-surface);
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

.floorplan-3d-host {
  width: 100%;
  height: 260px;
  display: block;
  background: linear-gradient(180deg, #dfe6ea, #b9c4cc);
}

.dark-mode .floorplan-3d-host {
  background: linear-gradient(180deg, #2a323b, #14181d);
}

.floorplan-hint {
  margin: 0;
  padding: 6px 10px 10px;
  font-size: 10px;
  color: var(--color-text-secondary);
  text-align: center;
}

.floorplan-expand {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: none;
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  box-shadow: var(--shadow-card);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.floorplan-modal {
  position: absolute;
  inset: 0;
  z-index: 55;
  width: 100%;
  height: 100%;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top, 0);
  overscroll-behavior: contain;
}

.floorplan-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  flex-shrink: 0;
}

.floorplan-modal-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

.floorplan-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: var(--color-surface-alt);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.floorplan-3d-host-expanded {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.floorplan-modal .floorplan-hint {
  flex-shrink: 0;
  padding-bottom: max(10px, env(safe-area-inset-bottom, 0));
}

.zone-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
  padding: 14px 14px 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.zone-card:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.zone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.zone-header-text {
  flex: 1;
  min-width: 0;
}

.zone-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.zone-count {
  margin: 2px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.zone-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  margin-left: 12px;
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

.diagnostic-card {
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diagnostic-title {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.diagnostic-headline {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.diagnostic-caption {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.diagnostic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.diagnostic-kpi {
  border: 1px solid var(--color-border-secondary);
  border-radius: 14px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.diagnostic-kpi-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.diagnostic-kpi-value {
  font-size: 1rem;
  color: var(--color-primary);
}

.diagnostic-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
}

.diagnostic-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
}

.diagnostic-item:last-child {
  border-bottom: none;
}

.diagnostic-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--color-success);
}

.diagnostic-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.diagnostic-item-title {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.diagnostic-item-detail {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.diagnostic-item.tone-warn .diagnostic-dot {
  background: var(--color-warning, #df9300);
}

.diagnostic-item.tone-critical .diagnostic-dot {
  background: var(--color-error);
}


.fab {
  position: absolute;
  right: 20px;
  bottom: calc(24px + env(safe-area-inset-bottom, 0));
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
  z-index: 7;
  transition: transform var(--duration-base) var(--ease-standard);
}

.fab:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 45%, white);
  outline-offset: 3px;
}

.fab-action:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.fab.open {
  transform: rotate(45deg);
}

.fab-icon {
  transition: transform var(--duration-base) var(--ease-standard);
}

.fab-overlay {
  position: absolute;
  inset: 0;
  border: none;
  background: rgba(17, 17, 17, 0.32);
  z-index: 5;
  cursor: default;
  animation: fab-scrim-in 180ms ease;
}

@keyframes fab-scrim-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fab-fan {
  position: absolute;
  right: 20px;
  bottom: calc(24px + env(safe-area-inset-bottom, 0));
  z-index: 6;
}

.fab-action {
  position: absolute;
  right: 0;
  bottom: 0;
  transform: translateY(0) scale(0.6);
  opacity: 0;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--color-primary) 14%, var(--color-border));
  border-radius: 28px;
  background: color-mix(in srgb, var(--color-surface) 97%, #ffffff);
  color: var(--color-primary);
  box-shadow: 0 10px 24px -14px rgba(17, 17, 17, 0.45), 0 3px 10px -6px rgba(17, 17, 17, 0.32);
  height: 48px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease;
}

.fab-action-device {
  transition-delay: 0ms;
}

.fab-action-sublevel {
  transition-delay: 30ms;
}

.fab-action-level {
  transition-delay: 60ms;
}

.fab-fan.open .fab-action {
  opacity: 1;
  pointer-events: auto;
}

.fab-fan.open .fab-action-device {
  transform: translateY(-64px) scale(1);
}

.fab-fan.open .fab-action-sublevel {
  transform: translateY(-122px) scale(1);
}

.fab-fan.open .fab-action-level {
  transform: translateY(-180px) scale(1);
}

.fab-action-label {
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.1;
  white-space: nowrap;
}

.sheet-action {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
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

.sheet-action svg {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.image-option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.image-upload-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed var(--color-border-secondary);
  background: var(--color-surface-alt);
  color: var(--color-primary);
  border-radius: 10px;
  padding: 10px 12px;
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  font-weight: 500;
  margin-bottom: 10px;
  cursor: pointer;
}

.image-option {
  position: relative;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 0;
  background: transparent;
  overflow: hidden;
  cursor: pointer;
}

.image-option img {
  width: 100%;
  height: 92px;
  object-fit: cover;
  display: block;
  filter: grayscale(0.6) contrast(1.12) saturate(1.25);
}

.image-option.selected {
  border-color: var(--color-accent);
}

.image-option-check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.image-option.selected .image-option-check {
  opacity: 1;
}

.hidden-file-input {
  display: none;
}

.sheet-action:last-child {
  border-bottom: none;
}

</style>
