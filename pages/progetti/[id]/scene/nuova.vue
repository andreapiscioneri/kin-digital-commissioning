<script setup lang="ts">
import type { ProvisionedDevice } from '~/composables/useDeviceCatalog'
import type { Group } from '~/composables/useGroupsStore'

const route = useRoute()
const projectId = route.params.id as string
const { provisionedDevices } = useDeviceCatalog(projectId)
const { groups } = useGroupsStore(projectId)
const { scenes, createScene, getScene, updateScene } = useScenesStore(projectId)
const { goBack, goClose, goForward } = useNavStack()

type Screen = 'intro' | 'form' | 'icon-picker' | 'select-devices' | 'personalizza'
const sceneIdFromQuery = computed(() => (typeof route.query.sceneId === 'string' ? route.query.sceneId : ''))
const editingScene = computed(() => (sceneIdFromQuery.value ? getScene(sceneIdFromQuery.value) || null : null))
const isEditing = computed(() => !!editingScene.value)
const editHydrated = ref(false)

const screen = ref<Screen>(sceneIdFromQuery.value ? 'form' : 'intro')
const screenDirection = ref<'forward' | 'back'>('forward')
const screenTransition = computed(() => `page-${screenDirection.value}`)

const name = ref('')
const nameTouched = ref(false)
const nameError = computed(() => (nameTouched.value && !name.value.trim() ? 'Campo obbligatorio' : ''))
const icon = ref('bulb')
const selectDeviceTab = ref<'zone' | 'dispositivi' | 'gruppi'>('zone')
const selectedDeviceIds = ref<Set<string>>(new Set())
const expandedKey = ref<string | null>(null)

const brightness = ref(70)
const colorTemp = ref(2700)
const automaticSensor = ref(70)
const corridorDimmer = ref(70)
const corridorTimeAfter = ref('00h 00m 05s')
const targetMode = ref<'tutti' | 'singolo'>('tutti')

const zones = computed(() => {
  const set = new Set<string>(provisionedDevices.value.map((d: ProvisionedDevice) => d.zone))
  return Array.from(set)
})

function devicesInZone(zone: string) {
  return provisionedDevices.value.filter((d: ProvisionedDevice) => d.zone === zone)
}

const deviceTypes = ['Lampada', 'Sensore', 'Pulsantiera'] as const
function devicesOfType(type: string) {
  return provisionedDevices.value.filter((d: ProvisionedDevice) => d.type === type)
}

function toggleExpand(key: string) {
  expandedKey.value = expandedKey.value === key ? null : key
}

function toggleDevice(id: string) {
  const next = new Set(selectedDeviceIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedDeviceIds.value = next
}

function toggleGroupDevices(groupId: string) {
  const group = groups.value.find((g: Group) => g.id === groupId)
  if (!group) return
  const next = new Set(selectedDeviceIds.value)
  const allSelected = group.deviceIds.every((id: string) => next.has(id))
  group.deviceIds.forEach((id: string) => (allSelected ? next.delete(id) : next.add(id)))
  selectedDeviceIds.value = next
}

const canContinueDevices = computed(() => selectedDeviceIds.value.size > 0)

watch(sceneIdFromQuery, () => {
  editHydrated.value = false
})

watch(
  editingScene,
  (scene) => {
    if (!scene || editHydrated.value) return
    name.value = scene.name
    icon.value = scene.icon
    selectedDeviceIds.value = new Set(scene.deviceIds)
    brightness.value = scene.brightness
    colorTemp.value = scene.colorTemp
    automaticSensor.value = scene.automaticSensor
    corridorDimmer.value = scene.corridorDimmer
    corridorTimeAfter.value = scene.corridorTimeAfter
    screen.value = 'form'
    editHydrated.value = true
  },
  { immediate: true }
)

function goToScreen(nextScreen: Screen, direction: 'forward' | 'back' = 'forward') {
  screenDirection.value = direction
  screen.value = nextScreen
}

function backFromForm() {
  if (isEditing.value) {
    goClose(`/progetti/${projectId}?tab=scene`)
    return
  }
  goToScreen('intro', 'back')
}

function save() {
  const nextName = name.value.trim()
  const deviceIds = Array.from(selectedDeviceIds.value)
  if (!nextName || deviceIds.length === 0) return

  const patch = {
    name: nextName,
    icon: icon.value,
    deviceIds,
    brightness: brightness.value,
    colorTemp: colorTemp.value,
    automaticSensor: automaticSensor.value,
    corridorDimmer: corridorDimmer.value,
    corridorTimeAfter: corridorTimeAfter.value
  }

  if (editingScene.value) {
    updateScene(editingScene.value.id, patch)
  } else {
    const scene = createScene(nextName, icon.value, deviceIds)
    updateScene(scene.id, patch)
  }
  goClose(`/progetti/${projectId}?tab=scene`)
}
</script>

<template>
  <div class="screen">
    <Transition :name="screenTransition" mode="out-in">
      <div :key="screen" class="screen-body">

    <template v-if="screen === 'intro'">
      <div class="intro-bg">
        <img src="/images/james-yarema-zdjZ4kCaJaY-unsplash.jpg" alt="" class="intro-bg-image" />
        <div class="intro-bg-overlay" />
        <div class="intro-content">
          <StatusBar inverted />
          <AppHeader title="" leading="back" trailing="close" inverted @back="goClose(`/progetti/${projectId}`)" @close="goClose(`/progetti/${projectId}`)" />
          <div class="body centered">
            <svg class="illustration" width="140" height="120" viewBox="0 0 140 120" fill="none" aria-hidden="true">
              <rect x="20" y="20" width="40" height="70" rx="6" stroke="currentColor" stroke-width="1.2" />
              <rect x="30" y="35" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1" />
              <rect x="42" y="35" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1" />
              <rect x="30" y="47" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1" />
              <rect x="42" y="47" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1" />
              <circle cx="100" cy="45" r="16" stroke="currentColor" stroke-width="1.2" />
              <path d="M94 60h12M96 64h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
            <h1 class="title">Configura scene</h1>
            <p class="subtitle">Crea scene per richiamare combinazioni di impostazioni di illuminazione con un solo tocco.</p>
          </div>
          <div class="footer">
            <Button variant="primary" @click="goToScreen('form', 'forward')">Continua</Button>
            <Button variant="ghost" class="skip" @click="goClose(`/progetti/${projectId}`)">Salta</Button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="screen === 'form'">
      <StatusBar />
      <AppHeader :title="isEditing ? 'Modifica scena' : 'Nuova scena'" leading="back" trailing="close" @back="backFromForm" @close="goClose(`/progetti/${projectId}?tab=scene`)" />
      <div class="body centered">
        <button type="button" class="icon-picker-trigger" @click="goToScreen('icon-picker', 'forward')">
          <SceneIcon :icon="icon" :size="28" />
          <span class="icon-edit-badge">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M11.3 1.8l2.9 2.9L4.9 14 1.5 14.5 2 11.1z" stroke="var(--color-surface)" stroke-width="1.3" stroke-linejoin="round" /></svg>
          </span>
        </button>
        <p class="scene-form-title">Scegli l'icona e il nome della scena che vuoi creare</p>

        <div class="scene-name-field">
          <TextField v-model="name" label="Nome scena" required placeholder="Inserisci il nome" :error="nameError" @blur="nameTouched = true" />
        </div>

        <p class="scene-form-caption">Seleziona i dispositivi che vuoi gestire con questa scena e personalizza il loro comportamento</p>

        <div class="devices-block">
          <p class="field-label">Dispositivi controllati</p>
          <Button variant="secondary" @click="goToScreen('select-devices', 'forward')">
            {{ selectedDeviceIds.size > 0 ? `${selectedDeviceIds.size} dispositivi selezionati` : 'Seleziona dispositivi' }}
          </Button>
        </div>
      </div>
      <div class="footer footer-surface">
        <Button variant="primary" :disabled="!name.trim() || selectedDeviceIds.size === 0" @click="goToScreen('personalizza', 'forward')">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'icon-picker'">
      <StatusBar />
      <AppHeader title="Seleziona icona" leading="back" trailing="none" @back="goToScreen('form', 'back')" />
      <div class="icon-grid">
        <button
          v-for="i in ['sun','moon','star','home','glass','fast-forward','umbrella','coffee','music','heart','lock','bulb-off','bulb','grid','cloud']"
          :key="i"
          type="button"
          class="icon-grid-item"
          :class="{ active: icon === i }"
          @click="icon = i; goToScreen('form', 'back')"
        >
          <SceneIcon :icon="i" :size="22" />
        </button>
      </div>
    </template>

    <template v-else-if="screen === 'select-devices'">
      <StatusBar />
      <AppHeader title="Seleziona dispositivi" leading="back" trailing="none" @back="goToScreen('form', 'back')" />
      <div class="body">
        <p class="scene-form-caption">Puoi selezionare i dispositivi per zona, tipologia di dispositivo o gruppi.</p>
        <SegmentedControl v-model="selectDeviceTab" :options="[{ value: 'zone', label: 'Zone' }, { value: 'dispositivi', label: 'Dispositivi' }, { value: 'gruppi', label: 'Gruppi' }]" />

        <template v-if="selectDeviceTab === 'zone'">
          <div v-for="zone in zones" :key="zone" class="type-block">
            <SelectableRow
              :label="zone"
              :caption="`${devicesInZone(zone).filter((d: ProvisionedDevice) => selectedDeviceIds.has(d.id)).length}/${devicesInZone(zone).length} dispositivi`"
              select-type="checkbox"
              expandable
              :expanded="expandedKey === zone"
              @click="toggleExpand(zone)"
              @toggle-expand="toggleExpand(zone)"
            />
            <div v-if="expandedKey === zone" class="device-checklist">
              <DeviceRow v-for="d in devicesInZone(zone)" :key="d.id" :code="d.name" :type="d.type" :selected="selectedDeviceIds.has(d.id)" :show-settings="false" @toggle="toggleDevice(d.id)" />
            </div>
          </div>
          <p v-if="zones.length === 0" class="hint">Nessuna zona con dispositivi disponibile.</p>
        </template>

        <template v-else-if="selectDeviceTab === 'dispositivi'">
          <div v-for="type in deviceTypes" :key="type" class="type-block">
            <SelectableRow
              :label="`${type === 'Lampada' ? 'Lampade' : type === 'Sensore' ? 'Sensori' : 'Pulsantiere'} (${devicesOfType(type).length})`"
              select-type="checkbox"
              expandable
              :expanded="expandedKey === type"
              :disabled="devicesOfType(type).length === 0"
              @click="toggleExpand(type)"
              @toggle-expand="toggleExpand(type)"
            />
            <div v-if="expandedKey === type" class="device-checklist">
              <DeviceRow v-for="d in devicesOfType(type)" :key="d.id" :code="d.name" :type="d.type" :selected="selectedDeviceIds.has(d.id)" :show-settings="false" @toggle="toggleDevice(d.id)" />
            </div>
          </div>
        </template>

        <template v-else>
          <SelectableRow
            v-for="g in groups"
            :key="g.id"
            :label="g.name"
            :caption="`${g.deviceIds.length} dispositivi`"
            select-type="checkbox"
            :selected="g.deviceIds.every((id: string) => selectedDeviceIds.has(id))"
            @click="toggleGroupDevices(g.id)"
          />
          <p v-if="groups.length === 0" class="hint">Nessun gruppo creato.</p>
        </template>
      </div>
      <div class="footer footer-surface">
        <Button variant="primary" :disabled="!canContinueDevices" @click="goToScreen('form', 'back')">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'personalizza'">
      <StatusBar />
      <AppHeader title="Personalizza scene" leading="back" trailing="close" @back="goToScreen('form', 'back')" @close="goClose(`/progetti/${projectId}`)" />
      <div class="body">
        <p class="scene-form-caption">Crea e gestisci le tue scene, personalizzando il comportamento dei dispositivi loro attivazione.</p>

        <p class="field-label">Target</p>
        <SegmentedControl v-model="targetMode" :options="[{ value: 'tutti', label: 'Tutti i dispositivi' }, { value: 'singolo', label: 'Singolo dispositivo' }]" />
        <ListItem :title="`${zones[0] || 'Zona'} (${selectedDeviceIds.size})`" clickable />

        <SliderField v-model="brightness" label="Luminosità" />
        <SliderField v-model="colorTemp" label="Temperatura colore" :min="2700" :max="6500" unit="K" />
        <SliderField v-model="automaticSensor" label="Automatic sensor mode" />

        <SectionHeader title="Corridor mode" />
        <SliderField v-model="corridorDimmer" label="Dimmer" />
        <div class="field-block">
          <p class="field-title">Time after</p>
          <Button variant="secondary">{{ corridorTimeAfter }}</Button>
        </div>

        <LinkRow title="Time based scenarios" caption="Lorem ipsum dolor sit amet, consectetur adipiscing elit." />
        <LinkRow title="Assign scene to push button" caption="Lorem ipsum dolor sit amet, consectetur adipiscing elit." />
        <LinkRow title="Assign scene to user" caption="Lorem ipsum dolor sit amet, consectetur adipiscing elit." :divider="false" />
      </div>
      <div class="footer footer-surface">
        <Button variant="primary" @click="save">Salva modifiche</Button>
      </div>
    </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.screen-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px var(--space-page-x);
}

.body.centered {
  align-items: center;
  text-align: center;
}

.illustration {
  color: var(--color-primary);
  margin-bottom: 8px;
}

.title {
  margin: 0;
  font-size: var(--font-size-display);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: var(--line-height-tight);
  color: var(--color-primary);
}

.subtitle {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.footer {
  padding: 16px var(--space-page-x) calc(24px + env(safe-area-inset-bottom, 0));
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-surface {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
}

.skip {
  align-self: center;
}

.intro-bg {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.intro-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.6) contrast(1.12) saturate(1.25);
}

.intro-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 2;
  position: relative;
}

.intro-content .illustration {
  color: rgba(255, 255, 255, 0.85);
}

.intro-content .title {
  color: #fff;
}

.intro-content .subtitle {
  color: rgba(255, 255, 255, 0.85);
}

.intro-content .footer {
  z-index: 3;
  position: relative;
}

.intro-content .skip {
  color: #fff;
}

.icon-picker-trigger {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-edit-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-form-title {
  margin: 4px 0 0;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  text-align: center;
}

.scene-name-field {
  width: 100%;
  text-align: left;
  margin-top: 8px;
}

.scene-form-caption {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  text-align: left;
}

.devices-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.field-label {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.field-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.icon-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 20px var(--space-page-x);
}

.icon-grid-item {
  aspect-ratio: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-grid-item.active {
  border-color: var(--color-primary);
  border-width: 2px;
}

.type-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-checklist {
  padding: 0 4px;
}

.hint {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}
</style>
