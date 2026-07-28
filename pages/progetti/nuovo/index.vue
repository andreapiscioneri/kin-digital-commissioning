<script setup lang="ts">
import { BleClient } from '@capacitor-community/bluetooth-le'

const { bluetoothEnabled, resetNewProjectDraft } = useCommissioningFlow()
const { goClose } = useNavStack()
const { isNative } = usePlatform()

resetNewProjectDraft()

const showBluetoothOff = ref(false)
const showInterrupt = ref(false)

async function onContinue() {
  if (isNative.value) {
    try {
      await BleClient.initialize({ androidNeverForLocation: false })
      const enabled = await BleClient.isEnabled()
      if (!enabled) {
        try {
          await BleClient.enable()
        } catch {
          // iOS non espone un enable() programmatico: CoreBluetooth mostra il proprio
          // alert di sistema alla prima interrogazione dello stato quando è spento.
        }
      }
    } catch {
      // BLE non disponibile o permesso negato: si prosegue comunque, lo stato
      // reale verrà rivalutato nella schermata di scan.
    }
    navigateTo('/progetti/nuovo/dati')
    return
  }

  if (!bluetoothEnabled.value) {
    showBluetoothOff.value = true
    return
  }
  navigateTo('/progetti/nuovo/dati')
}

function retryBluetooth() {
  bluetoothEnabled.value = true
  showBluetoothOff.value = false
}

function confirmInterrupt() {
  showInterrupt.value = false
  goClose('/progetti')
}
</script>

<template>
  <div class="screen">
    <div class="intro-bg">
      <img src="/images/nuovo-progetto-bg.jpg" alt="" class="intro-bg-image" />
      <div class="intro-bg-overlay" />
      <div class="intro-content">
        <StatusBar inverted />
        <AppHeader title="" leading="back" trailing="close" inverted @back="goClose('/progetti')" @close="showInterrupt = true" />

        <div class="body">
          <svg class="illustration" width="200" height="160" viewBox="0 0 220 180" fill="none" aria-hidden="true">
            <path d="M110 20l80 46v0l-80 46-80-46z" stroke="currentColor" stroke-width="1.2" />
            <path d="M30 66v58l80 46v-58M190 66v58l-80 46" stroke="currentColor" stroke-width="1.2" />
            <path d="M55 50l40-23 40 23M60 62v50M100 40v96M140 62v50" stroke="currentColor" stroke-width="1" />
            <rect x="70" y="75" width="20" height="16" stroke="currentColor" stroke-width="1" />
            <rect x="110" y="75" width="20" height="16" stroke="currentColor" stroke-width="1" />
          </svg>

          <h1 class="title">Creazione progetto</h1>
          <p class="subtitle">Questo processo ti guiderà nella creazione di un nuovo progetto, configurando livelli, sottolivelli e dispositivi.</p>
        </div>

        <div class="footer">
          <div class="note">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
            <span>Assicurati di avere attivato il Bluetooth su questo dispositivo.</span>
          </div>
          <Button variant="primary" @click="onContinue">Continua</Button>
        </div>
      </div>
    </div>

    <AlertDialog
      v-if="!isNative"
      v-model="showBluetoothOff"
      system
      title="Il Bluetooth è disattivato"
    >
      <div class="alert-content">
        <p class="alert-description">Attiva il Bluetooth nelle impostazioni di questo dispositivo per proseguire.</p>
        <p class="alert-link">Vai a impostazioni</p>
      </div>
      <div class="alert-buttons">
        <Button variant="ios" @click="showBluetoothOff = false">Annulla</Button>
        <Button variant="ios" @click="retryBluetooth"><strong>Riprova</strong></Button>
      </div>
    </AlertDialog>

    <AlertDialog v-model="showInterrupt" title="Interrompi creazione progetto" description="Sei sicuro di voler interrompere la creazione del tuo progetto?">
      <template #icon>
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
      </template>
      <p class="alert-extra">Interrompendo tutti i dettagli andranno persi.</p>
      <div class="dialog-btn-row">
        <Button variant="ghost" @click="showInterrupt = false">Annulla</Button>
        <Button variant="primary" @click="confirmInterrupt">Interrompi</Button>
      </div>
    </AlertDialog>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.intro-bg {
  flex: 1;
  position: relative;
  overflow: hidden;
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
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.5) 40%,
    rgba(0, 0, 0, 1) 100%
  );
}

.intro-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px var(--space-page-x);
  gap: 16px;
}

.illustration {
  color: rgba(255, 255, 255, 0.8);
  margin: 24px 0;
}

.title {
  margin: 0;
  font-size: var(--font-size-h1);
  font-weight: 600;
  color: #fff;
  text-align: center;
}

.subtitle {
  margin: 0;
  font-size: var(--font-size-body);
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  max-width: 320px;
}

.note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-small);
}

.note svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.9);
}

.footer {
  padding: 16px var(--space-page-x) 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 3;
  position: relative;
}

.dialog-btn-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.dialog-btn-row .btn.primary,
.dialog-btn-row .btn.secondary {
  width: auto;
  flex: 1;
}

.alert-extra {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.alert-content {
  margin-bottom: 16px;
}

.alert-description {
  margin: 0 0 12px 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.alert-link {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
}

.alert-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.alert-buttons :deep(.btn) {
  flex: 1;
}
</style>
