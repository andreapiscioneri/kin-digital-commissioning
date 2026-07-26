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
    <StatusBar />
    <AppHeader title="" leading="back" trailing="close" @back="goClose('/progetti')" @close="showInterrupt = true" />

    <div class="body">
      <svg class="illustration" width="220" height="180" viewBox="0 0 220 180" fill="none" aria-hidden="true">
        <path d="M110 20l80 46v0l-80 46-80-46z" stroke="currentColor" stroke-width="1.2" />
        <path d="M30 66v58l80 46v-58M190 66v58l-80 46" stroke="currentColor" stroke-width="1.2" />
        <path d="M55 50l40-23 40 23M60 62v50M100 40v96M140 62v50" stroke="currentColor" stroke-width="1" />
        <rect x="70" y="75" width="20" height="16" stroke="currentColor" stroke-width="1" />
        <rect x="110" y="75" width="20" height="16" stroke="currentColor" stroke-width="1" />
      </svg>

      <h1 class="title">Creazione progetto</h1>
      <p class="subtitle">Questo processo ti guiderà nella creazione di un nuovo progetto, configurando livelli, sottolivelli e dispositivi.</p>

      <div class="note">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
        <span>Assicurati di avere attivato il Bluetooth su questo dispositivo.</span>
      </div>
    </div>

    <div class="footer">
      <Button variant="primary" @click="onContinue">Continua</Button>
    </div>

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

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px var(--space-page-x);
  gap: 16px;
}

.illustration {
  color: var(--color-primary);
  margin: 24px 0;
}

.title {
  margin: 0;
  font-size: var(--font-size-h1);
  font-weight: 600;
  color: var(--color-primary);
}

.subtitle {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  margin-top: 12px;
}

.note svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.footer {
  padding: 16px var(--space-page-x) 24px;
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
</style>
