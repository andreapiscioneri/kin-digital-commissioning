<script setup lang="ts">
import type { DiscoveredDevice } from '~/composables/useDeviceCatalog'

const route = useRoute()
const projectId = route.params.id as string
const zone = (route.query.zona as string) || 'Ufficio 1.1'
const { scanDevices, provisionDevices } = useDeviceCatalog(projectId)
const { bluetoothEnabled } = useCommissioningFlow()
const { goClose, goForward } = useNavStack()

type Screen = 'intro' | 'scanning'
const screen = ref<Screen>('intro')
const found = ref<DiscoveredDevice[]>([])
const selected = ref<Set<string>>(new Set())
const showFilters = ref(false)
const showBluetoothOff = ref(false)
const search = ref('')

const filterTypes = ref<Record<string, boolean>>({ Lampada: true, Pulsantiere: true, Sensore: true })
const includeConfigured = ref(true)
const signalRange = ref(70)

const visibleDevices = computed(() => {
  let list = found.value
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((d: DiscoveredDevice) => d.code.toLowerCase().includes(q))
  }
  return list
})

function startScan() {
  if (!bluetoothEnabled.value) {
    showBluetoothOff.value = true
    return
  }
  screen.value = 'scanning'
  found.value = []
  const all = scanDevices()
  all.forEach((d, i) => {
    setTimeout(() => {
      found.value = [...found.value, d]
    }, i * 220)
  })
}

function retryBluetooth() {
  bluetoothEnabled.value = true
  showBluetoothOff.value = false
  startScan()
}

function toggle(id: string) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function applyFilters() {
  showFilters.value = false
}

function addToZone() {
  const ids = Array.from<string>(selected.value)
  const provisioned = provisionDevices(ids, zone)
  const next = (route.query.next as string) || `/progetti/${projectId}?tab=gruppi`
  if (provisioned.length > 0) {
    goForward(`/progetti/${projectId}/dispositivi/${provisioned[0].id}/configura?next=${encodeURIComponent(next)}`)
  } else {
    goClose(next)
  }
}
</script>

<template>
  <div class="screen">
    <StatusBar v-if="screen !== 'intro'" />

    <template v-if="screen === 'intro'">
      <div class="intro-bg">
        <img src="/images/scan-bg.jpg" alt="" class="intro-bg-image" />
        <div class="intro-bg-overlay" />
        <div class="intro-content">
          <StatusBar inverted />
          <AppHeader title="" leading="none" trailing="close" inverted @close="goClose(`/progetti/${projectId}`)" />
          <div class="body centered">
            <span class="radar-illustration" aria-hidden="true">
              <span class="radar-ring ring-1" />
              <span class="radar-ring ring-2" />
              <span class="radar-dot" />
            </span>
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

    <template v-else>
      <AppHeader title="Ricerca dispositivi" leading="back" trailing="close" @back="screen = 'intro'" @close="goClose(`/progetti/${projectId}`)" />

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
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.4" /><path d="M18 18l-4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        </div>
        <button type="button" class="toolbar-icon" aria-label="Filtri" @click="showFilters = true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 4h14l-5.5 7v5L8.5 18v-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
        </button>
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
        <Button variant="primary" :disabled="selected.size === 0" @click="addToZone">Aggiungi in “{{ zone }}”</Button>
      </div>
    </template>

    <AlertDialog v-model="showBluetoothOff" title="Il Bluetooth è disattivato" description="Attiva il Bluetooth nelle impostazioni di questo dispositivo per proseguire.">
      <template #icon>
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
      </template>
      <div class="dialog-btn-row">
        <Button variant="ghost" @click="showBluetoothOff = false">Annulla</Button>
        <Button variant="primary" @click="retryBluetooth">Riprova</Button>
      </div>
    </AlertDialog>

    <BottomSheet v-model="showFilters" title="Filtri">
      <p class="sheet-section-title">DISPOSITIVI</p>
      <CheckboxRow v-model="includeConfigured" label="Includi dispositivi già configurati" />
      <CheckboxRow v-model="filterTypes.Lampada" label="Lampada" />
      <CheckboxRow v-model="filterTypes.Pulsantiere" label="Pulsantiere" />
      <CheckboxRow v-model="filterTypes.Sensore" label="Sensore" />
      <p class="sheet-section-title">POTENZA SEGNALE</p>
      <SliderField v-model="signalRange" unit="dBm" />
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
  align-items: center;
  text-align: center;
  justify-content: center;
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
}

.intro-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(17, 17, 17, 0.55) 0%, rgba(17, 17, 17, 0.75) 60%, rgba(17, 17, 17, 0.92) 100%);
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
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 0 36px 0 12px;
  font-size: var(--font-size-body);
  font-family: var(--font-family);
  color: var(--color-primary);
  background: var(--color-surface);
}

.search-box svg {
  position: absolute;
  right: 12px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.toolbar-icon {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
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
</style>
