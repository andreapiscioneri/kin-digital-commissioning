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
const menuOpen = ref(false)
const showAddSheet = ref(false)
const showImageSheet = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const renamingSceneId = ref<string | null>(null)
const renameSceneValue = ref('')

const tabs = [
  { value: 'livelli', label: 'Progetto', icon: 'project' },
  { value: 'dispositivi', label: 'Dispositivi', icon: 'devices' },
  { value: 'scene', label: 'Scene', icon: 'scene' },
  { value: 'collaboratori', label: 'Collaboratori', icon: 'users' }
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
  showAddSheet.value = false
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
      <span class="stat-divider" />
      <div class="stat-col">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6.5" r="3" stroke="currentColor" stroke-width="1.3" /><path d="M1.5 17c1-3 3-4.7 5.5-4.7S11.5 14 12.5 17" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="14.5" cy="7" r="2.4" stroke="currentColor" stroke-width="1.3" /><path d="M13 12.6c2.2.2 3.7 1.7 4.5 4.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        <span class="stat-label">Collaboratori</span>
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
      </div>
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

        <template v-else-if="activeTab === 'collaboratori'">
          <template v-if="collaborators.length === 0">
            <EmptyState variant="card" title="Nessun collaboratore invitato" subtitle="Invita collaboratori per condividere la gestione del progetto.">
              <Button variant="secondary" @click="goForward(`/progetti/${projectId}/utenti`)">+ Invita collaboratori</Button>
            </EmptyState>
          </template>
          <template v-else>
            <div class="collaborators-list">
              <div v-for="collaborator in collaborators" :key="collaborator.id" class="collaborator-row">
                <span class="collaborator-avatar">{{ collaboratorInitial(collaborator.email) }}</span>
                <span class="collaborator-content">
                  <span class="collaborator-email">{{ collaborator.email }}</span>
                  <span class="collaborator-role">{{ collaborator.role }}</span>
                  <span class="collaborator-status" :class="{ online: collaborator.active, offline: !collaborator.active }">
                    <span class="collaborator-status-dot" />
                    {{ collaborator.active ? 'Online' : 'Offline' }}
                  </span>
                </span>
                <button
                  v-if="canManageCollaborators"
                  type="button"
                  class="collaborator-remove-btn"
                  aria-label="Elimina collaboratore"
                  @click="removeCollaboratorFromProject(collaborator.id)"
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3.5A1.5 1.5 0 019.5 2h1A1.5 1.5 0 0112 3.5V5M15 5v11a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 16V5h10z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M8.5 8.5v6M11.5 8.5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
                </button>
              </div>
            </div>
            <Button variant="secondary" @click="goForward(`/progetti/${projectId}/utenti`)">+ Invita collaboratori</Button>
          </template>
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

    <nav class="project-nav">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="project-nav-item"
        :class="{ active: activeTab === tab.value }"
        @click="selectTab(tab.value)"
      >
        <svg v-if="tab.icon === 'project'" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.7 2 4 4.7 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><circle cx="10" cy="8" r="2.2" stroke="currentColor" stroke-width="1.4" /></svg>
        <svg v-else-if="tab.icon === 'devices'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" /><rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" /></svg>
        <svg v-else-if="tab.icon === 'users'" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="2.2" stroke="currentColor" stroke-width="1.4" /><circle cx="13" cy="7" r="2.2" stroke="currentColor" stroke-width="1.4" /><path d="M3.2 15c.8-2.1 2.2-3.3 3.8-3.3s3 1.2 3.8 3.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M9 15c.8-2.1 2.2-3.3 3.8-3.3s3 1.2 3.8 3.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        <svg v-else-if="tab.icon === 'scene'" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.4" /><path d="M10 1v2M10 17v2M1 10h2M17 10h2M4 4l1.5 1.5M14.5 14.5L16 16M16 4l-1.5 1.5M5.5 14.5L4 16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 15h16M4 15V9l3-2 3 3 4-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span class="project-nav-label">{{ tab.label }}</span>
      </button>
    </nav>

    <button type="button" class="fab" aria-label="Aggiungi" @click="showAddSheet = true">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="#fff" stroke-width="1.8" stroke-linecap="round" /></svg>
    </button>

    <BottomSheet v-model="showAddSheet" title="Aggiungi">
      <button type="button" class="sheet-action" @click="showAddSheet = false; goForward(`/progetti/${projectId}/livelli/nuovo`)">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="2.5" width="14" height="15" rx="1.8" stroke="currentColor" stroke-width="1.3" /><path d="M3 7.5h14" stroke="currentColor" stroke-width="1.3" /><path d="M10 10v5M7.5 12.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        Aggiungi livello
      </button>
      <button type="button" class="sheet-action" @click="showAddSheet = false; goForward(`/progetti/${projectId}/dispositivi/scan?levelId=${selectedLevelId}`)">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><path d="M10 13.5v3M8.5 15h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        Aggiungi dispositivo
      </button>
      <button type="button" class="sheet-action" @click="showAddSheet = false; goForward(`/progetti/${projectId}/gruppi/nuovo`)">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="2.2" stroke="currentColor" stroke-width="1.3" /><circle cx="13" cy="7" r="2.2" stroke="currentColor" stroke-width="1.3" /><path d="M3.5 15c.8-2.3 2.3-3.6 3.9-3.6S10.5 12.7 11.3 15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><path d="M8.7 15c.8-2.3 2.3-3.6 3.9-3.6s3.1 1.3 3.9 3.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        Crea gruppo
      </button>
    </BottomSheet>

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

.hero-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.2) 35%, rgba(0, 0, 0, 0.7) 100%);
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

.collaborators-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
}

.collaborator-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
}

.collaborator-row:last-child {
  border-bottom: none;
}

.collaborator-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  border: 1px solid rgba(17, 17, 17, 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.collaborator-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.collaborator-email {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collaborator-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.collaborator-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.collaborator-status.online {
  color: var(--color-success);
}

.collaborator-status.offline {
  color: var(--color-error);
}

.collaborator-role {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.collaborator-remove-btn {
  margin-left: auto;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 0;
  background: transparent;
 color: var(--color-error);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.project-nav {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom, 0));
  z-index: 4;
  display: flex;
  align-items: stretch;
  height: 64px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  box-shadow: var(--shadow-menu);
}

.project-nav-item {
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

.project-nav-item.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.project-nav-label {
  font-size: 11px;
  font-weight: 500;
}

.fab {
  position: absolute;
  left: 50%;
  bottom: calc(46px + env(safe-area-inset-bottom, 0));
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 4px solid var(--color-bg);
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-fab);
  z-index: 5;
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
