<script setup lang="ts">
import { BleClient, type ScanResult } from '@capacitor-community/bluetooth-le'
import type { DiscoveredDevice, ProvisionedDevice } from '~/composables/useDeviceCatalog'

const route = useRoute()
const projectId = route.params.id as string
const zone = (route.query.zona as string) || 'Ufficio 1.1'
const levelId = route.query.levelId as string | undefined
const backDestination = computed(() => (route.query.back as string) || `/progetti/${projectId}`)
const { scanDevices, provisionDevices, provisionedDevices } = useDeviceCatalog(projectId)
const { getLevel } = useLevelsStore(projectId)
const { bluetoothEnabled } = useCommissioningFlow()
const { goBack, goBackTo, goClose, goForward } = useNavStack()
const { isNative } = usePlatform()

const levelName = computed(() => (levelId ? getLevel(levelId)?.name : undefined))

type Screen = 'intro' | 'scanning' | 'verifica'
const screen = ref<Screen>('intro')
const found = ref<DiscoveredDevice[]>([])
const selected = ref<Set<string>>(new Set())
const showFilters = ref(false)
const showBluetoothOff = ref(false)
const search = ref('')

const filterTypes = ref<Record<string, boolean>>({ Lampada: true, Pulsantiera: true, Sensore: true })
const includeConfigured = ref(true)
const appliedFilters = ref({ types: { ...filterTypes.value }, includeConfigured: true, signalRange: 100 })
const signalRange = ref(100)

const alreadyConfiguredIds = computed(() => new Set(provisionedDevices.value.map((d: ProvisionedDevice) => d.id)))

const filterChips = computed(() => {
  const chips: string[] = []
  const uncheckedTypes = Object.entries(appliedFilters.value.types).filter(([, v]) => !v).map(([k]) => k)
  if (uncheckedTypes.length > 0) chips.push(`Escluso: ${uncheckedTypes.join(', ')}`)
  if (!appliedFilters.value.includeConfigured) chips.push('Solo non configurati')
  if (appliedFilters.value.signalRange < 100) chips.push(`Fino a -${appliedFilters.value.signalRange}dBm`)
  return chips
})

const visibleDevices = computed(() => {
  let list = found.value
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((d: DiscoveredDevice) => d.code.toLowerCase().includes(q))
  }
  list = list.filter((d: DiscoveredDevice) => appliedFilters.value.types[d.type])
  list = list.filter((d: DiscoveredDevice) => Math.abs(d.rssi) <= appliedFilters.value.signalRange)
  if (!appliedFilters.value.includeConfigured) {
    list = list.filter((d: DiscoveredDevice) => !alreadyConfiguredIds.value.has(d.id))
  }
  return list
})

async function startScan() {
  screen.value = 'scanning'
  found.value = []

  if (!isNative.value) {
    if (!bluetoothEnabled.value) {
      showBluetoothOff.value = true
      screen.value = 'intro'
      return
    }
    const all = scanDevices()
    all.forEach((d, i) => {
      setTimeout(() => {
        found.value = [...found.value, d]
      }, i * 220)
    })
    return
  }

  try {
    await BleClient.initialize({ androidNeverForLocation: false })
    await BleClient.requestLEScan({}, (result: ScanResult) => {
      // Nessuna spec GATT nota per l'hardware Kin Sync: il "type" resta un
      // placeholder finché non arriva una mappatura service-UUID -> tipo dispositivo.
      const device: DiscoveredDevice = {
        id: result.device.deviceId,
        code: result.device.name || result.device.deviceId,
        type: 'Lampada',
        rssi: result.rssi ?? -99
      }
      if (!found.value.some((d: DiscoveredDevice) => d.id === device.id)) {
        found.value = [...found.value, device]
      }
    })
    setTimeout(() => BleClient.stopLEScan(), 8000)
  } catch {
    showBluetoothOff.value = true
    screen.value = 'intro'
  }
}

function retryBluetooth() {
  if (isNative.value) {
    showBluetoothOff.value = false
    startScan()
    return
  }
  bluetoothEnabled.value = true
  showBluetoothOff.value = false
  startScan()
}

function toggle(id: string) {
  if (alreadyConfiguredIds.value.has(id)) return
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function applyFilters() {
  appliedFilters.value = {
    types: { ...filterTypes.value },
    includeConfigured: includeConfigured.value,
    signalRange: signalRange.value
  }
  showFilters.value = false
}

const detectedSelected = computed(() => found.value.filter((d: DiscoveredDevice) => selected.value.has(d.id)))

function goToVerifica() {
  screen.value = 'verifica'
}

function retryVerifica() {
  screen.value = 'scanning'
  startScan()
}

function confirmDevices() {
  const devices = detectedSelected.value
  const provisioned = provisionDevices(devices, zone, levelId)
  const next = (route.query.next as string) || `/progetti/${projectId}?tab=gruppi`
  const returnsToWizard = next.includes('/wizard-guidato/')
  if (provisioned.length > 0) {
    goForward(`/progetti/${projectId}/dispositivi/${provisioned[0].id}/configura?next=${encodeURIComponent(next)}`)
  } else {
    if (returnsToWizard) {
      goForward(next)
      return
    }
    goClose(next)
  }
}

function backFromIntro() {
  if (route.query.back) {
    goBackTo(backDestination.value)
    return
  }
  goBack(backDestination.value)
}
</script>

<template>
  <div class="screen">
    <StatusBar v-if="screen !== 'intro'" />

    <template v-if="screen === 'intro'">
      <div class="intro-bg">
        <img src="/images/bluetooth-new.png" alt="" class="intro-bg-image" />
        <div class="intro-bg-overlay" />
        <div class="intro-content">
          <StatusBar inverted />
          <AppHeader title="" leading="back" trailing="close" inverted @back="backFromIntro" @close="goClose(`/progetti/${projectId}`)" />
          <div class="body centered">
            <h1 class="title">Aggiungi dispositivi a “{{ zone }}”</h1>
            <p class="subtitle">Questo processo ti guiderà nell'individuazione dei dispositivi da aggiungere alla zona.</p>
            <div class="note">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
              <span>Assicurati di avere attivato il Bluetooth su questo dispositivo.</span>
            </div>
          </div>
          <div class="footer">
            <Button variant="primary" size="lg" @click="startScan">Avvia scansione Bluetooth</Button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="screen === 'scanning'">
      <AppHeader title="Ricerca dispositivi" leading="back" trailing="close" @back="screen = 'intro'" @close="goClose(`/progetti/${projectId}`)" />
      <p v-if="levelName" class="breadcrumb">{{ levelName }} <span class="breadcrumb-sep">›</span> {{ zone }}</p>

      <div class="scan-status">
        <span class="scan-status-text">
          <Loader v-if="found.length < 6" variant="spinner" />
          <span>{{ found.length < 6 ? 'Scansione in corso…' : 'Scansione completata' }}<br /><small>Dispositivi individuati: {{ found.length }}</small></span>
        </span>
        <button type="button" class="icon-only" aria-label="Aggiorna" @click="startScan">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M17 10a7 7 0 11-2-4.9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M17 3v4h-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <input v-model="search" type="search" placeholder="Cerca dispositivo" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" /><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        </div>
        <button type="button" class="toolbar-icon" aria-label="Filtri" @click="showFilters = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 5h16l-6 7.5V19l-4 2v-8.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" /></svg>
        </button>
      </div>

      <div v-if="filterChips.length > 0" class="filter-chips">
        <span v-for="chip in filterChips" :key="chip" class="filter-chip">{{ chip }}</span>
      </div>

      <div class="body">
        <template v-if="visibleDevices.length > 0">
          <p class="section-caption">Dispositivi trovati</p>
          <p class="hint">Seleziona i dispositivi da aggiungere alla zona.</p>
          <div class="device-list">
            <DeviceRow
              v-for="d in visibleDevices"
              :key="d.id"
              :code="d.code"
              :type="d.type"
              :rssi="d.rssi"
              :selected="selected.has(d.id)"
              :configured="alreadyConfiguredIds.has(d.id)"
              @toggle="toggle(d.id)"
            />
          </div>
        </template>

        <EmptyState v-else-if="found.length === 0 && screen === 'scanning'" variant="centered" title="Nessun dispositivo trovato" subtitle="Verifica che i dispositivi siano alimentati, che il Bluetooth sia attivo e il dispositivo si trovi entro il raggio di rilevamento.">
          <template #icon>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" /><path d="M15 15l6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          </template>
          <Button variant="primary" @click="startScan">Avvia nuova scansione</Button>
        </EmptyState>
      </div>

      <div class="footer">
        <Button variant="primary" :disabled="selected.size === 0" @click="goToVerifica">Aggiungi in “{{ zone }}”</Button>
      </div>
    </template>

    <template v-else-if="screen === 'verifica'">
      <AppHeader title="Verifica dispositivi" leading="back" trailing="close" @back="screen = 'scanning'" @close="goClose(`/progetti/${projectId}`)" />
      <div class="body centered">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3" /><path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <p class="lead">Sono stati rilevati {{ detectedSelected.length }} dei {{ selected.size }} dispositivi selezionati.</p>
        <p class="subtitle">I dispositivi non rilevati potrebbero essere fuori portata o non più raggiungibili via Bluetooth.</p>
        <p class="subtitle">Se necessario, esegui una nuova scansione prima di continuare.</p>
      </div>
      <div class="footer">
        <div class="dialog-btn-row">
          <Button variant="ghost" @click="retryVerifica">Riprova</Button>
          <Button variant="primary" @click="confirmDevices">Continua</Button>
        </div>
      </div>
    </template>

    <AlertDialog
      v-if="!isNative"
      v-model="showBluetoothOff"
      system
      row-actions
      title="Il Bluetooth è disattivato"
      description="Attiva il Bluetooth nelle impostazioni di questo dispositivo per proseguire."
    >
      <Button variant="ios" @click="showBluetoothOff = false">Annulla</Button>
      <Button variant="ios" @click="retryBluetooth"><strong>Riprova</strong></Button>
    </AlertDialog>

    <BottomSheet v-model="showFilters" title="Filtri">
      <p class="sheet-section-title">DISPOSITIVI</p>
      <CheckboxRow v-model="includeConfigured" label="Includi dispositivi già configurati" />
      <CheckboxRow v-model="filterTypes.Lampada" label="Lampada" />
      <CheckboxRow v-model="filterTypes.Pulsantiera" label="Pulsantiere" />
      <CheckboxRow v-model="filterTypes.Sensore" label="Sensore" />
      <p class="sheet-section-title">POTENZA SEGNALE</p>
      <SliderField v-model="signalRange" label="Fino a" :min="30" :max="100" :step="5" unit="dBm" />
      <Button variant="primary" @click="applyFilters">Applica</Button>
    </BottomSheet>
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
  gap: 8px;
  padding: 16px var(--space-page-x) 20px;
}

.body.centered {
  align-items: flex-start;
  text-align: left;
  justify-content: flex-end;
  padding-bottom: 36px;
  gap: 16px;
}

.intro-bg {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.intro-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.3) contrast(1.08) saturate(1.14);
}

.intro-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(17, 17, 17, 0.36) 0%, rgba(17, 17, 17, 0.24) 40%, rgba(17, 17, 17, 0.66) 100%);
}

.intro-content {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.radar-illustration {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.radar-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  animation: radar-pulse 2.4s ease-out infinite;
}

.radar-ring.ring-2 {
  animation-delay: 1.2s;
}

.radar-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
}

@keyframes radar-pulse {
  0% {
    width: 14px;
    height: 14px;
    opacity: 0.9;
  }
  100% {
    width: 120px;
    height: 120px;
    opacity: 0;
  }
}

.title {
  margin: 0;
  font-size: var(--font-size-display);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: var(--line-height-tight);
  color: #ffffff;
}

.subtitle {
  margin: 0;
  font-size: var(--font-size-body);
  color: rgba(255, 255, 255, 0.8);
}

.note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-small);
  margin-top: 8px;
}

.note svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}

.scan-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px var(--space-page-x) 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.scan-status-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.scan-status-text small {
  color: var(--color-text-secondary);
}

.icon-only {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px var(--space-page-x) 0;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  width: 100%;
  height: 44px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-button);
  padding: 0 40px 0 16px;
  font-size: var(--font-size-body);
  font-family: var(--font-family);
  color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.search-box svg {
  position: absolute;
  right: 12px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.toolbar-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  border: none;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.section-caption {
  margin: 8px 0 0;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-primary);
}

.hint {
  margin: 0 0 4px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
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

.dialog-btn-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.dialog-btn-row .btn {
  width: auto;
  flex: 1;
}

.sheet-section-title {
  margin: 8px 0;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.breadcrumb {
  margin: 8px var(--space-page-x) 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.breadcrumb-sep {
  margin: 0 4px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px var(--space-page-x) 0;
}

.filter-chip {
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: var(--font-size-small);
  font-weight: 500;
}

.lead {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}
</style>
