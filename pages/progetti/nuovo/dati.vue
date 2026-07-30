<script setup lang="ts">
import { Geolocation } from '@capacitor/geolocation'
import { projectImageOptions } from '~/composables/useProjectsStore'
import type { ProjectCategory } from '~/composables/useProjectsStore'

const { newProjectDraft, installerRoleEnabled } = useCommissioningFlow()
const { goBack, goClose, goForward } = useNavStack()
const { isNative } = usePlatform()

const showInterrupt = ref(false)
const showAddressSheet = ref(false)
const showCategorySheet = ref(false)
const showImageSheet = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const showLocationPermission = ref(false)
const locating = ref(false)
const locationError = ref('')
const addressSearch = ref('')
const nameTouched = ref(false)
const nameError = computed(() => (nameTouched.value && !newProjectDraft.value.name.trim() ? 'Campo obbligatorio' : ''))

const categoryOptions: { value: ProjectCategory; label: string; description: string }[] = [
  { value: 'Office', label: 'Office', description: 'Spazi, ufficio, coworking' },
  { value: 'Industry', label: 'Industry', description: 'Fabbriche, Progetti, industrie' },
  { value: 'Sport indoor', label: 'Sport indoor', description: 'Palestre, piscine, sport' },
  { value: 'Relamping', label: 'Relamping', description: 'Aggiornamenti di sistemi' },
  { value: 'Altro', label: 'Altro', description: 'Altro tipo di progetto' }
]

function getCategoryIcon(category: ProjectCategory) {
  const icons: Record<ProjectCategory, string> = {
    'Office': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M9 8v2M15 8v2M9 14v2M15 14v2M12 8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'Industry': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="10" width="5" height="10" rx="0.5" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="5" width="5" height="15" rx="0.5" stroke="currentColor" stroke-width="1.5"/><rect x="16" y="8" width="5" height="12" rx="0.5" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 20h15" stroke="currentColor" stroke-width="1.5"/></svg>',
    'Sport indoor': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M6 13c0-2 2-3 6-3s6 1 6 3v7H6v-7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 20v2M15 20v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'Relamping': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 3h6v2H9V3z" stroke="currentColor" stroke-width="1.5"/><path d="M10 5c-1.5 1-2.5 3-2.5 5.5 0 3.5 2 6.5 5 7.5 3-1 5-4 5-7.5 0-2.5-1-4.5-2.5-5.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 19h6M8 21h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'Altro': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M8 9h8M8 13h6M8 17h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    Retail: ''
  }
  return icons[category]
}

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
const previewProjectImage = computed(() => newProjectDraft.value.image || '')

const canContinue = computed(() =>
  !!newProjectDraft.value.name.trim() && !!newProjectDraft.value.category && !!newProjectDraft.value.address.trim()
)

function useCurrentLocation() {
  locationError.value = ''

  if (!isNative.value) {
    // Nessun runtime nativo (browser/anteprima web): simula il prompt di
    // sistema iOS così l'aspetto resta coerente anche fuori dall'app nativa.
    showLocationPermission.value = true
    return
  }

  requestNativeLocation()
}

function grantLocation() {
  locating.value = true
  setTimeout(() => {
    newProjectDraft.value.useCurrentLocation = true
    newProjectDraft.value.address = 'Via Andrea Rossini 12, Bologna'
    if (!newProjectDraft.value.timezone) newProjectDraft.value.timezone = 'Roma: UTC+1'
    locating.value = false
    showLocationPermission.value = false
  }, 1500)
}

function denyLocation() {
  showLocationPermission.value = false
}

async function requestNativeLocation() {
  locating.value = true
  try {
    const perm = await Geolocation.requestPermissions()
    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
      locationError.value = 'Permesso posizione negato.'
      return
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
    newProjectDraft.value.useCurrentLocation = true
    newProjectDraft.value.address = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
    if (!newProjectDraft.value.timezone) newProjectDraft.value.timezone = 'Roma: UTC+1'
  } catch {
    locationError.value = 'Impossibile ottenere la posizione.'
  } finally {
    locating.value = false
  }
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

function selectCategory(category: ProjectCategory) {
  newProjectDraft.value.category = category
  showCategorySheet.value = false
}

function pickProjectImage(image: string) {
  newProjectDraft.value.image = image
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
      newProjectDraft.value.image = reader.result
      showImageSheet.value = false
    }
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function onContinue() {
  if (!canContinue.value) return
  goForward(installerRoleEnabled.value ? '/progetti/nuovo/modalita' : '/progetti/nuovo/azienda')
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader :title="headerTitle" leading="back" trailing="close" @back="goBack('/progetti/nuovo')" @close="showInterrupt = true" />

    <div class="body">
      <TextField v-model="newProjectDraft.name" label="Nome progetto" required placeholder="Nome progetto" :error="nameError" @blur="nameTouched = true" />

      <div class="image-field">
        <label class="field-label">Immagine progetto</label>
        <button type="button" class="image-picker" @click="showImageSheet = true">
          <img v-if="previewProjectImage" :src="previewProjectImage" alt="Anteprima immagine progetto" class="image-preview" />
          <span v-else class="image-preview-placeholder" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.4" /><circle cx="7" cy="8" r="1.6" stroke="currentColor" stroke-width="1.4" /><path d="M3.5 14l4-4 3 3 3-3 2.5 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
          <span class="image-picker-text">{{ previewProjectImage ? 'Modifica immagine' : 'Seleziona immagine' }}</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12 3a3 3 0 014 4l-9 9-4.5 1.5L4 13z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
        </button>
      </div>
      
      <div class="category-field" @click="showCategorySheet = true">
        <label class="field-label">Tipologia progetto</label>
        <div class="category-box">
          <div v-if="newProjectDraft.category" class="category-value">
            <span>{{ newProjectDraft.category }}</span>
          </div>
          <div v-else class="category-placeholder">Seleziona</div>
          <svg class="chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </div>
      </div>

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

      <Button class="location-cta" variant="secondary" :disabled="locating" @click="useCurrentLocation">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.4" /><circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.4" /></svg>
        {{ locating ? 'Individuazione posizione…' : 'Usa posizione corrente' }}
      </Button>
      <p v-if="locationError" class="location-error">{{ locationError }}</p>

      <p class="or-divider">Oppure inserisci manualmente</p>

      <div class="address-field" @click="openAddressSheet">
        <SelectField
          :model-value="newProjectDraft.address"
          label="Indirizzo"
          :options="newProjectDraft.address ? [{ value: newProjectDraft.address, label: newProjectDraft.address }] : []"
          placeholder="Seleziona"
        />
      </div>

      <TextField v-model="newProjectDraft.floor" label="Piano" placeholder="ad es. Piano Terra" />
      <TextField v-model="newProjectDraft.note" label="Note" placeholder="ad es. Capanno S03" />
      <SelectField v-model="newProjectDraft.timezone" label="Fuso orario" :options="timezoneOptions" placeholder="-" />
    </div>

    <div class="footer">
      <Button variant="primary" :disabled="!canContinue" @click="onContinue">Continua</Button>
    </div>

    <AlertDialog
      v-if="!isNative"
      v-model="showLocationPermission"
      system
      title=""
      :disabled="locating"
    >
      <template #title>
        <div class="location-permission-content">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="location-icon"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
          <span>Vuoi consentire a <strong>Kin Sync</strong> di utilizzare la tua posizione?</span>
          <p class="location-description">La tua posizione rende più facile trovare l'indirizzo del tuo Progetto.</p>
        </div>
      </template>
      <Button variant="ios" :disabled="locating" @click="grantLocation">Consenti quando utilizzi l'app</Button>
      <Button variant="ios" :disabled="locating" @click="grantLocation">Solo questa volta</Button>
      <Button variant="ios" :disabled="locating" @click="denyLocation"><strong>Non consentire</strong></Button>
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

    <BottomSheet v-model="showCategorySheet" title="Tipologia progetto">
      <div class="category-list">
        <button
          v-for="cat in categoryOptions"
          :key="cat.value"
          type="button"
          class="category-item"
          :class="{ 'is-selected': newProjectDraft.category === cat.value }"
          @click="selectCategory(cat.value)"
        >
          <span class="category-icon" v-html="getCategoryIcon(cat.value)" />
          <div class="category-info">
            <span class="category-label">{{ cat.label }}</span>
            <span class="category-desc">{{ cat.description }}</span>
          </div>
          <svg v-if="newProjectDraft.category === cat.value" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M18 5L8 15l-4-4" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
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
          :class="{ selected: newProjectDraft.image === image }"
          @click="pickProjectImage(image)"
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

    <div v-if="locating" class="location-loading-overlay">
      <div class="location-loader"></div>
      <p class="location-loading-text">Individuazione posizione…</p>
    </div>
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
  height: 140px;
  flex-shrink: 0;
  border-radius: var(--radius-card);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.map-preview svg {
  display: block;
  width: 100%;
  height: 100%;
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

.location-cta {
  height: 56px !important;
  min-height: 56px;
  font-size: var(--font-size-button);
  border-radius: var(--radius-button);
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

.location-error {
  margin: -8px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-danger, #c0392b);
}

.alert-extra {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.link-inline {
  border: none;
  background: transparent;
  color: var(--color-system-link);
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

.category-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  cursor: pointer;
}

.image-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.image-picker {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-primary);
  cursor: pointer;
  text-align: left;
}

.image-preview {
  width: 68px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  filter: grayscale(0.6) contrast(1.12) saturate(1.25);
}

.image-picker-text {
  flex: 1;
  font-size: var(--font-size-small);
}

.image-preview-placeholder {
  width: 68px;
  height: 52px;
  border-radius: 8px;
  border: 1px dashed var(--color-border-secondary);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

.field-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.category-box {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg);
}

.category-value {
  font-size: var(--font-size-body);
  color: var(--color-text);
}

.category-placeholder {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  padding: 16px 0;
  text-align: left;
  cursor: pointer;
  font-family: var(--font-family);
  transition: background-color 0.2s;
  outline: none;
  width: 100%;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item:hover {
  background-color: var(--color-surface-alt);
}

.category-item.is-selected {
  background-color: var(--color-accent-soft);
  border-bottom-color: transparent;
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: var(--color-surface-alt);
  border-radius: 10px;
  color: var(--color-primary);
}

.category-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-label {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
  display: block;
}

.category-desc {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  display: block;
}

.location-permission-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  margin-bottom: 16px;
}

.location-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.location-description {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.location-loading-overlay {
  position: absolute;
  inset: 0;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 1000;
}

.location-loader {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3.5px solid var(--color-accent-soft);
  border-top-color: var(--color-accent);
  animation: location-spin 0.8s linear infinite;
}

@keyframes location-spin {
  to {
    transform: rotate(360deg);
  }
}

.location-loading-text {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}
</style>
