<script setup lang="ts">
import type { ProvisionedDevice } from '~/composables/useDeviceCatalog'
import type { Group } from '~/composables/useGroupsStore'

const route = useRoute()
const projectId = route.params.id as string
const { provisionedDevices } = useDeviceCatalog(projectId)
const { groups } = useGroupsStore(projectId)
const { scenes, createScene } = useScenesStore(projectId)
const { goBack, goClose, goForward } = useNavStack()

type Screen = 'intro' | 'form' | 'icon-picker' | 'select-devices' | 'personalizza'
const screen = ref<Screen>('intro')

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

function save() {
  const isFirstScene = scenes.value.length === 0
  const scene = createScene(name.value, icon.value, Array.from(selectedDeviceIds.value))
  updateSceneParams(scene.id)
  if (isFirstScene) {
    goClose(`/progetti/${projectId}/completato`)
  } else {
    goClose(`/progetti/${projectId}/scene`)
  }
}

function updateSceneParams(sceneId: string) {
  const { updateScene } = useScenesStore(projectId)
  updateScene(sceneId, {
    brightness: brightness.value,
    colorTemp: colorTemp.value,
    automaticSensor: automaticSensor.value,
    corridorDimmer: corridorDimmer.value,
    corridorTimeAfter: corridorTimeAfter.value
  })
}
</script>

<template>
  <div class="screen">
    <StatusBar />

    <template v-if="screen === 'intro'">
      <AppHeader title="" leading="none" trailing="close" @close="goClose(`/progetti/${projectId}`)" />
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
        <Button variant="primary" @click="screen = 'form'">Continua</Button>
        <Button variant="ghost" class="skip" @click="goClose(`/progetti/${projectId}`)">Salta</Button>
      </div>
    </template>

    <template v-else-if="screen === 'form'">
      <AppHeader title="Nuova scena" leading="back" trailing="close" @back="screen = 'intro'" @close="goClose(`/progetti/${projectId}`)" />
      <div class="body centered">
        <button type="button" class="icon-picker-trigger" @click="screen = 'icon-picker'">
          <SceneIcon :icon="icon" :size="28" />
          <span class="icon-edit-badge">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M11.3 1.8l2.9 2.9L4.9 14 1.5 14.5 2 11.1z" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" /></svg>
          </span>
        </button>
        <p class="scene-form-title">Scegli l'icona e il nome della scena che vuoi creare</p>

        <div class="scene-name-field">
          <TextField v-model="name" label="Nome scena" required placeholder="Inserisci il nome" :error="nameError" @blur="nameTouched = true" />
        </div>

        <p class="scene-form-caption">Seleziona i dispositivi che vuoi gestire con questa scena e personalizza il loro comportamento</p>

        <div class="devices-block">
          <p class="field-label">Dispositivi controllati</p>
          <Button variant="secondary" @click="screen = 'select-devices'">
            {{ selectedDeviceIds.size > 0 ? `${selectedDeviceIds.size} dispositivi selezionati` : 'Seleziona dispositivi' }}
          </Button>
        </div>
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="!name.trim() || selectedDeviceIds.size === 0" @click="screen = 'personalizza'">Salva modifiche</Button>
      </div>
    </template>

    <template v-else-if="screen === 'icon-picker'">
      <AppHeader title="Seleziona icona" leading="back" trailing="none" @back="screen = 'form'" />
      <div class="icon-grid">
        <button
          v-for="i in ['sun','moon','star','home','glass','fast-forward','umbrella','coffee','music','heart','lock','bulb-off','bulb','grid','cloud']"
          :key="i"
          type="button"
          class="icon-grid-item"
          :class="{ active: icon === i }"
          @click="icon = i; screen = 'form'"
        >
          <SceneIcon :icon="i" :size="22" />
        </button>
      </div>
    </template>

    <template v-else-if="screen === 'select-devices'">
      <AppHeader title="Seleziona dispositivi" leading="back" trailing="none" @back="screen = 'form'" />
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
      <div class="footer">
        <Button variant="primary" :disabled="!canContinueDevices" @click="screen = 'form'">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'personalizza'">
      <AppHeader title="Personalizza scene" leading="none" trailing="close" @close="goClose(`/progetti/${projectId}`)" />
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
      <div class="footer">
        <Button variant="primary" @click="save">Salva</Button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.body {
  flex: 1;
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
  padding: 16px var(--space-page-x) 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skip {
  align-self: center;
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
