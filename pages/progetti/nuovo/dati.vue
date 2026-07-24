<script setup lang="ts">
import type { ProjectCategory } from '~/composables/useProjectsStore'

const { newProjectDraft, installerRoleEnabled } = useCommissioningFlow()
const { createProject } = useProjectsStore()
const { goBack, goClose, goForward } = useNavDirection()

const showInterrupt = ref(false)
const showLocationPermission = ref(false)
const showAddressSheet = ref(false)
const addressSearch = ref('')

const categoryOptions: { value: ProjectCategory; label: string }[] = [
  { value: 'Office', label: 'Office' },
  { value: 'Industry', label: 'Industry' },
  { value: 'Sport indoor', label: 'Sport indoor' },
  { value: 'Retail', label: 'Retail' }
]

const timezoneOptions = [
  { value: 'Roma: UTC+1', label: 'Roma: UTC+1' },
  { value: 'Londra: UTC+0', label: 'Londra: UTC+0' },
  { value: 'Berlino: UTC+1', label: 'Berlino: UTC+1' }
]

const addressSuggestions = [
  'Via Andrea Rossini 12, Bologna BO',
  'Via Andrea Rossini 12, Milano MI',
  'Via Andrea Rossini 12, Viterbo VT'
]

const headerTitle = computed(() => (newProjectDraft.value.useCurrentLocation ? 'Dati progetto' : 'Creazione progetto'))

const canContinue = computed(() =>
  !!newProjectDraft.value.name.trim() && !!newProjectDraft.value.category && !!newProjectDraft.value.address.trim()
)

function useCurrentLocation() {
  showLocationPermission.value = true
}

function grantLocation() {
  showLocationPermission.value = false
  newProjectDraft.value.useCurrentLocation = true
  newProjectDraft.value.address = 'Via Andrea Rossini 12, Bologna'
  if (!newProjectDraft.value.timezone) newProjectDraft.value.timezone = 'Roma: UTC+1'
}

function denyLocation() {
  showLocationPermission.value = false
}

function openAddressSheet() {
  addressSearch.value = newProjectDraft.value.address
  showAddressSheet.value = true
}

function pickAddress(addr: string) {
  newProjectDraft.value.address = addr
  newProjectDraft.value.useCurrentLocation = false
  showAddressSheet.value = false
}

function onContinue() {
  if (!canContinue.value) return
  if (installerRoleEnabled.value) {
    const project = createProject({
      name: newProjectDraft.value.name,
      category: newProjectDraft.value.category as ProjectCategory,
      address: newProjectDraft.value.address,
      city: ''
    })
    goClose(`/progetti/${project.id}`)
  } else {
    goForward('/progetti/nuovo/azienda')
  }
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader :title="headerTitle" leading="back" trailing="close" @back="goBack('/progetti/nuovo')" @close="showInterrupt = true" />

    <div class="body">
      <TextField v-model="newProjectDraft.name" label="Nome progetto" required placeholder="Nome progetto" />
      <SelectField v-model="newProjectDraft.category" label="Tipologia progetto" :options="categoryOptions" />

      <SectionHeader title="Indirizzo" :divider="false" class="centered-title" />

      <div v-if="newProjectDraft.useCurrentLocation" class="map-preview">
        <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="none" aria-hidden="true">
          <rect width="300" height="140" fill="#eef0ea" />
          <path d="M0 40h300M0 90h300M60 0v140M180 0v140M230 0v90" stroke="#d8dccf" stroke-width="2" />
          <rect x="70" y="10" width="40" height="22" fill="#d7e3c8" />
        </svg>
        <span class="map-pin">
          <svg width="24" height="30" viewBox="0 0 24 30" fill="none"><path d="M12 29S2 18.4 2 11a10 10 0 0120 0c0 7.4-10 18-10 18z" fill="var(--color-primary)" /><circle cx="12" cy="11" r="3.5" fill="#fff" /></svg>
        </span>
      </div>

      <Button variant="secondary" @click="useCurrentLocation">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.4" /><circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.4" /></svg>
        Usa posizione corrente
      </Button>

      <p class="or-divider">Oppure inserisci manualmente</p>

      <div class="address-field" @click="openAddressSheet">
        <SelectField
          :model-value="newProjectDraft.address"
          label="Indirizzo"
          :options="newProjectDraft.address ? [{ value: newProjectDraft.address, label: newProjectDraft.address }] : []"
          placeholder="Seleziona"
        />
      </div>

      <TextField v-model="newProjectDraft.note" label="Note" placeholder="ad es. Capanno S03" />
      <SelectField v-model="newProjectDraft.timezone" label="Fuso orario" :options="timezoneOptions" placeholder="-" />
    </div>

    <div class="footer">
      <Button variant="primary" :disabled="!canContinue" @click="onContinue">Continua</Button>
    </div>

    <AlertDialog v-model="showLocationPermission" title="">
      <template #title>
        Vuoi consentire a <strong>Kin Sync</strong> di utilizzare la tua posizione?
      </template>
      <p class="alert-extra">La tua posizione rende più facile trovare l'indirizzo del tuo impianto.</p>
      <div class="system-btn-stack">
        <Button variant="system" @click="grantLocation">Consenti una volta</Button>
        <Button variant="system" @click="grantLocation">Consenti quando utilizzi l'app</Button>
        <Button variant="system" @click="denyLocation">Non consentire</Button>
      </div>
    </AlertDialog>

    <AlertDialog v-model="showInterrupt" title="Interrompi creazione progetto" description="Sei sicuro di voler interrompere la creazione del tuo progetto?">
      <template #icon>
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
      </template>
      <p class="alert-extra">Interrompendo tutti i dettagli andranno persi.</p>
      <div class="dialog-btn-row">
        <Button variant="ghost" @click="showInterrupt = false">Annulla</Button>
        <Button variant="primary" @click="goClose('/progetti')">Interrompi</Button>
      </div>
    </AlertDialog>

    <BottomSheet v-model="showAddressSheet" title="Indirizzo">
      <TextField v-model="addressSearch" placeholder="Cerca indirizzo" />
      <div class="address-suggestions">
        <button v-for="addr in addressSuggestions" :key="addr" type="button" class="address-suggestion" @click="pickAddress(addr)">
          {{ addr }}
        </button>
      </div>
      <button type="button" class="link-inline">Indirizzo non trovato?</button>
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
  gap: 20px;
  padding: 20px var(--space-page-x);
}

.centered-title :deep(.section-title) {
  width: 100%;
  text-align: center;
}

.map-preview {
  position: relative;
  border-radius: var(--radius-card);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.map-preview svg {
  display: block;
}

.map-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -70%);
}

.or-divider {
  margin: 0;
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.address-field {
  cursor: pointer;
}

.address-field :deep(select) {
  pointer-events: none;
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

.dialog-btn-row .btn {
  width: auto;
  flex: 1;
}

.system-btn-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.alert-extra {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.link-inline {
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  font-size: var(--font-size-body);
  padding: 8px 0;
}

.address-suggestions {
  display: flex;
  flex-direction: column;
}

.address-suggestion {
  text-align: left;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  padding: 12px 0;
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  color: var(--color-primary);
  cursor: pointer;
}
</style>
