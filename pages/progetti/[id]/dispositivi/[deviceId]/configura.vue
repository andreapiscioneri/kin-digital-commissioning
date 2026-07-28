<script setup lang="ts">
import type { ProvisionedDevice } from '~/composables/useDeviceCatalog'

const route = useRoute()
const projectId = route.params.id as string
const deviceId = route.params.deviceId as string
const { getDevice, updateDevice, provisionedDevices } = useDeviceCatalog(projectId)
const { goBack, goClose, goForward } = useNavStack()

const device = getDevice(deviceId)

const name = ref(device?.name || '')
const nameTouched = ref(false)
const nameError = computed(() => (nameTouched.value && !name.value.trim() ? 'Campo obbligatorio' : ''))
const minBrightness = ref(20)
const maxBrightness = ref(70)
const powerOnBehaviour = ref('last')
const calibrationMode = ref('auto')
const naturalLightCalibration = ref('auto')
const currentLux = ref(450)
const movementCount = ref(153)
const buttonSlots = ref(['', '', '', ''])

function identify() {
  // Simula il lampeggio del LED del dispositivo (nessun hardware reale collegato)
}

function nextDeviceOrFinish() {
  const list = provisionedDevices.value
  const idx = list.findIndex((d: ProvisionedDevice) => d.id === deviceId)
  const next = list[idx + 1]
  const nextParam = (route.query.next as string) || ''
  const returnsToWizard = nextParam.includes('/wizard-guidato/')
  const suffix = nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''
  if (next) {
    goForward(`/progetti/${projectId}/dispositivi/${next.id}/configura${suffix}`)
  } else {
    if (returnsToWizard) {
      goForward(nextParam)
      return
    }
    goClose(nextParam || `/progetti/${projectId}?tab=gruppi`)
  }
}

function save() {
  updateDevice(deviceId, { name: name.value, configured: true })
  nextDeviceOrFinish()
}
</script>

<template>
  <div class="screen">
    <template v-if="device">
    <StatusBar />
    <AppHeader :title="device.code" leading="back" trailing="none" @back="goBack(`/progetti/${projectId}`)" />

    <div class="body">
      <div class="device-head">
        <IconBadge :size="64">
          <svg v-if="device.type === 'Lampada'" width="28" height="28" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="5" stroke="currentColor" stroke-width="1.3" /><path d="M8 15h4M8.5 17h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          <svg v-else-if="device.type === 'Sensore'" width="28" height="28" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" /><circle cx="10" cy="10" r="2.4" fill="currentColor" /></svg>
          <svg v-else width="28" height="28" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        </IconBadge>
        <StatusPill tone="success">Disponibile</StatusPill>
      </div>

      <TextField v-model="name" label="Nome dispositivo" required :error="nameError" @blur="nameTouched = true" />

      <div class="identify-block">
        <p class="identify-title">Individua dispositivo</p>
        <p class="identify-caption">Puoi far lampeggiare il LED del dispositivo</p>
        <Button variant="secondary" @click="identify">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.3" /><path d="M10 1v2M10 17v2M1 10h2M17 10h2M4 4l1.5 1.5M14.5 14.5L16 16M16 4l-1.5 1.5M5.5 14.5L4 16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          Identifica
        </Button>
      </div>

      <SelectField :model-value="device.zone" label="Zona" :options="[{ value: device.zone, label: device.zone }]" />
      <SelectField model-value="" label="Gruppo" placeholder="Nessun gruppo selezionato" :options="[]" />

      <template v-if="device.type === 'Lampada' || device.type === 'Sensore'">
        <SectionHeader title="Illuminazione" />
        <SliderField v-model="minBrightness" label="Luminosità minima" />
        <SliderField v-model="maxBrightness" label="Luminosità massima" />

        <SectionHeader title="Alimentazione" />
        <div class="field-block">
          <p class="field-title">Comportamento alla riaccensione</p>
          <SegmentedControl v-model="powerOnBehaviour" :options="[{ value: 'off', label: 'OFF' }, { value: 'on', label: 'ON' }, { value: 'last', label: 'Ultimo stato' }]" />
        </div>
      </template>

      <template v-if="device.type === 'Lampada'">
        <SectionHeader title="Sensori" />
        <div class="field-block">
          <p class="field-title">Modalità calibrazione</p>
          <SegmentedControl v-model="calibrationMode" :options="[{ value: 'auto', label: 'Automatica' }, { value: 'manual', label: 'Manuale' }]" />
        </div>
        <LinkRow title="Sensibilità PIR" caption="Definisce quanto facilmente il sensore rileva la presenza di persone in movimento." :divider="false" />
      </template>

      <template v-if="device.type === 'Sensore'">
        <SectionHeader title="Stato calibrazione" />
        <SegmentedControl v-model="calibrationMode" :options="[{ value: 'auto', label: 'Automatica' }, { value: 'manual', label: 'Manuale' }]" />

        <SectionHeader title="Controllo del gruppo" />
        <LinkRow title="Sensibilità PIR" caption="Definisce quanto facilmente il sensore rileva la presenza di persone in movimento." />
        <div class="field-block">
          <p class="field-title">Calibrazione luce naturale</p>
          <SegmentedControl v-model="naturalLightCalibration" :options="[{ value: 'auto', label: 'Automatica' }, { value: 'manual', label: 'Manuale' }]" />
        </div>

        <SectionHeader title="Dati in tempo reale" />
        <div class="readonly-block">
          <p class="field-title">Livello Lux attuale</p>
          <p class="readonly-value">{{ currentLux }} lux</p>
        </div>
        <div class="readonly-block">
          <p class="field-title">Contatore movimenti</p>
          <p class="readonly-value">{{ movementCount }}</p>
        </div>
      </template>

      <template v-if="device.type === 'Pulsantiera'">
        <SectionHeader title="Configurazione pulsanti" />
        <div class="button-grid">
          <button v-for="(slot, i) in buttonSlots" :key="i" type="button" class="button-slot">
            <span class="button-slot-plus">+</span>
            <span>{{ slot || 'Associa funzione' }}</span>
          </button>
        </div>
      </template>

      <SectionHeader title="Parametri avanzati">
        <template #action>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
        </template>
      </SectionHeader>

      <SectionHeader title="Informazioni" :divider="false" />
      <div class="info-list">
        <InfoRow label="Modello" :value="`ID LAMP: ${device.id.toUpperCase()}`" />
        <InfoRow label="Serial number" value="12345675843993" />
        <InfoRow label="MAC address" value="0000-0000-0000-0000" />
        <InfoRow label="Versione Firmware" value="1.00" />
      </div>
      <button type="button" class="delete-link">Elimina dispositivo</button>
    </div>

    <div class="footer">
      <Button variant="primary" size="lg" :disabled="!name.trim()" @click="save">Salva</Button>
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
  gap: 20px;
  padding: 20px var(--space-page-x);
}

.device-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.identify-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.identify-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.identify-caption {
  margin: 0 0 8px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.readonly-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.readonly-value {
  margin: 0;
  padding: 13px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  color: var(--color-primary);
  font-size: var(--font-size-body);
}

.button-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.button-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 90px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface-alt);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  cursor: pointer;
}

.button-slot-plus {
  font-size: 20px;
  line-height: 1;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.delete-link {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--color-error);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}
</style>
