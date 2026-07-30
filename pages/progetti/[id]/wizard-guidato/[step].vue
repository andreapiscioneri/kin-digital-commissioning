<script setup lang="ts">
import type { ProvisionedDevice } from '~/composables/useDeviceCatalog'

const route = useRoute()
const projectId = route.params.id as string
const levelIndex = Number(route.params.step)
const { levels, updateLevel } = useLevelsStore(projectId)
const { provisionedDevices, updateDevice } = useDeviceCatalog(projectId)
const { goBack, goBackTo, goClose, goForward } = useNavStack()

const level = computed(() => levels.value[levelIndex - 1])
const totalLevels = computed(() => levels.value.length)
const levelsRemaining = computed(() => totalLevels.value - levelIndex)
const isLastLevel = computed(() => levelIndex >= totalLevels.value)
const hasSeenScanStep = computed(() => route.query.from === 'scan')

type SubStep = 'livello' | 'sottolivello-intro' | 'sottolivello' | 'summary' | 'sottolivello-edit'
const subStep = ref<SubStep>(route.query.subStep === 'summary' ? 'summary' : 'livello')
const subStepDirection = ref<'forward' | 'back'>('forward')
const subStepTransition = computed(() => `page-${subStepDirection.value}`)
const editingFromSummary = ref(false)
const editingSubLevelIndex = ref<number | null>(null)
const editingSubLevelName = ref('')
const cachedSubLevelNames = ref<Record<number, string>>({})

const levelName = ref(level.value?.name || `Livello ${levelIndex}`)
const subLevelNames = ref<string[]>(level.value?.subLevelNames ? [...level.value.subLevelNames] : [])
const subLevelName = ref(`Sottolivello ${subLevelNames.value.length + 1}`)
const hasPlan = ref(level.value?.hasPlan || false)
const showUploadSheet = ref(false)
const showCameraPermission = ref(false)
const takingPhoto = ref(false)

const nextDestination = computed(() =>
  levelIndex < totalLevels.value ? `/progetti/${projectId}/wizard-guidato/${levelIndex + 1}` : `/progetti/${projectId}/utenti`
)

const summaryDestination = computed(() => `/progetti/${projectId}/wizard-guidato/${levelIndex}?subStep=summary&from=scan`)
const levelStepDestination = computed(() => `/progetti/${projectId}/wizard-guidato/${levelIndex}?subStep=livello`)
const subLevelIntroDestination = computed(() => `/progetti/${projectId}/wizard-guidato/${levelIndex}?subStep=sottolivello-intro`)
const subLevelDestination = computed(() => `/progetti/${projectId}/wizard-guidato/${levelIndex}?subStep=sottolivello`)
const subLevelEditDestination = computed(() => `/progetti/${projectId}/wizard-guidato/${levelIndex}?subStep=sottolivello-edit`)

const recapDeviceZone = computed(() => (subLevelNames.value.length > 0 ? subLevelNames.value[subLevelNames.value.length - 1] : levelName.value))
const scanFromSummaryDestination = computed(() =>
  `/progetti/${projectId}/dispositivi/scan?zona=${encodeURIComponent(recapDeviceZone.value)}&levelId=${level.value.id}&next=${encodeURIComponent(summaryDestination.value)}&back=${encodeURIComponent(subLevelDestination.value)}`
)

const levelDevices = computed(() =>
  provisionedDevices.value.filter((d: ProvisionedDevice) => d.levelId === level.value?.id && d.zone === levelName.value)
)

function deviceCountFor(name: string) {
  return provisionedDevices.value.filter((d: ProvisionedDevice) => d.levelId === level.value?.id && d.zone === name).length
}

function devicesFor(name: string) {
  return provisionedDevices.value.filter((d: ProvisionedDevice) => d.levelId === level.value?.id && d.zone === name)
}

function goDashboard() {
  goClose(`/progetti/${projectId}`)
}

function goToPreviousLevelSetup() {
  goBackTo(`/progetti/${projectId}/livelli/nuovo?screen=guidata-stepper`)
}

function goToSubStep(next: SubStep, direction: 'forward' | 'back' = 'forward') {
  subStepDirection.value = direction
  subStep.value = next
}

function saveLevelStep() {
  updateLevel(level.value.id, { name: levelName.value })
  if (editingFromSummary.value) {
    editingFromSummary.value = false
    goToSubStep('summary', 'forward')
  } else {
    goToSubStep('sottolivello-intro', 'forward')
  }
}

function editLevelFromSummary() {
  editingFromSummary.value = true
  goToSubStep('livello', 'back')
}

function choosePlanSource() {
  hasPlan.value = true
  showUploadSheet.value = false
}

function takePhoto() {
  showUploadSheet.value = false
  showCameraPermission.value = true
}

function grantCamera() {
  takingPhoto.value = true
  setTimeout(() => {
    hasPlan.value = true
    takingPhoto.value = false
    showCameraPermission.value = false
  }, 1200)
}

function denyCamera() {
  showCameraPermission.value = false
}

function goToDeviceScan(back: string) {
  goForward(
    `/progetti/${projectId}/dispositivi/scan?zona=${encodeURIComponent(recapDeviceZone.value)}&levelId=${level.value.id}&next=${encodeURIComponent(summaryDestination.value)}&back=${encodeURIComponent(back)}`
  )
}

function skipSubLevel() {
  updateLevel(level.value.id, { name: levelName.value, hasPlan: hasPlan.value, subLevels: 0, subLevelNames: [] })
  goToSubStep('summary', 'forward')
}

function saveSubLevelStep() {
  if (!subLevelNames.value.includes(subLevelName.value)) {
    subLevelNames.value = [...subLevelNames.value, subLevelName.value]
  }
  updateLevel(level.value.id, { name: levelName.value, hasPlan: hasPlan.value, subLevels: subLevelNames.value.length, subLevelNames: subLevelNames.value })
  goToSubStep('summary', 'forward')
}

function startScanFromSummary() {
  goToDeviceScan(subLevelDestination.value)
}

function addAnotherSubLevel() {
  subLevelName.value = `Sottolivello ${subLevelNames.value.length + 1}`
  goToSubStep('sottolivello', 'forward')
}

function cacheSubLevelName(index: number) {
  cachedSubLevelNames.value[index] = subLevelNames.value[index] || ''
}

function commitSubLevelRename(index: number) {
  const oldName = cachedSubLevelNames.value[index] ?? ''
  const trimmed = (subLevelNames.value[index] || '').trim()

  if (!trimmed) {
    subLevelNames.value[index] = oldName || `Sottolivello ${index + 1}`
    delete cachedSubLevelNames.value[index]
    return
  }

  subLevelNames.value[index] = trimmed

  if (oldName && oldName !== trimmed) {
    devicesFor(oldName).forEach((d: ProvisionedDevice) => updateDevice(d.id, { zone: trimmed }))
  }

  if (oldName !== trimmed) {
    updateLevel(level.value.id, { subLevels: subLevelNames.value.length, subLevelNames: subLevelNames.value })
  }

  delete cachedSubLevelNames.value[index]
}

function removeSubLevelFromSummary(index: number) {
  const removedName = subLevelNames.value[index]
  if (!removedName) return

  // Reassign devices to parent level when a sublevel is removed from recap.
  devicesFor(removedName).forEach((d: ProvisionedDevice) => updateDevice(d.id, { zone: levelName.value }))

  subLevelNames.value = subLevelNames.value.filter((_: string, i: number) => i !== index)
  updateLevel(level.value.id, { subLevels: subLevelNames.value.length, subLevelNames: subLevelNames.value })

  if (subLevelName.value === removedName) {
    subLevelName.value = `Sottolivello ${subLevelNames.value.length + 1}`
  }
}

function addDeviceToLevel() {
  goForward(`/progetti/${projectId}/dispositivi/scan?zona=${encodeURIComponent(levelName.value)}&levelId=${level.value.id}&next=${encodeURIComponent(summaryDestination.value)}&back=${encodeURIComponent(summaryDestination.value)}`)
}

function openSubLevelEdit(index: number) {
  editingSubLevelIndex.value = index
  editingSubLevelName.value = subLevelNames.value[index]
  goToSubStep('sottolivello-edit', 'forward')
}

function addDeviceToSubLevel() {
  const name = editingSubLevelName.value
  goForward(`/progetti/${projectId}/dispositivi/scan?zona=${encodeURIComponent(name)}&levelId=${level.value.id}&next=${encodeURIComponent(summaryDestination.value)}&back=${encodeURIComponent(subLevelEditDestination.value)}`)
}

function openDeviceConfig(deviceId: string) {
  goForward(`/progetti/${projectId}/dispositivi/${deviceId}/configura?next=${encodeURIComponent(summaryDestination.value)}`)
}

function saveSubLevelEdit() {
  if (editingSubLevelIndex.value === null) return
  const oldName = subLevelNames.value[editingSubLevelIndex.value]
  const newName = editingSubLevelName.value.trim()
  if (newName && newName !== oldName) {
    devicesFor(oldName).forEach((d: ProvisionedDevice) => updateDevice(d.id, { zone: newName }))
    subLevelNames.value = subLevelNames.value.map((n: string, i: number) => (i === editingSubLevelIndex.value ? newName : n))
    updateLevel(level.value.id, { subLevelNames: subLevelNames.value })
  }
  editingSubLevelIndex.value = null
  goToSubStep('summary', 'back')
}

function backFromSummary() {
  if (hasSeenScanStep.value) {
    goBackTo(scanFromSummaryDestination.value)
    return
  }
  goToSubStep('sottolivello', 'back')
}

function completeLevel() {
  goForward(nextDestination.value)
}

function goToCollaborators() {
  goForward(`/progetti/${projectId}/utenti?scan=${encodeURIComponent(scanFromSummaryDestination.value)}`)
}
</script>

<template>
  <div class="screen">
    <template v-if="level">
    <Transition :name="subStepTransition" mode="out-in">
    <div :key="subStep" class="step-screen">
    <StatusBar v-if="subStep !== 'sottolivello-intro'" />

    <template v-if="subStep === 'livello'">
      <AppHeader :title="levelName" leading="back" trailing="close" @back="editingFromSummary ? goToSubStep('summary', 'back') : goToPreviousLevelSetup()" @close="goDashboard" />
      <WizardProgress :current="1" :total="3" />
      <div class="body">
        <p class="lead">Il livello rappresenta la suddivisione principale dell'edificio (ad esempio un piano). Assegna un nome per identificarlo.</p>
        <TextField v-model="levelName" label="Nome livello" required />

        <p class="field-title">Planimetria o foto</p>
        <button v-if="!hasPlan" type="button" class="upload-trigger" @click="showUploadSheet = true">
          Carica file
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 13V3M6 7l4-4 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /><path d="M4 13v3a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        </button>
        <div v-else class="plan-preview" @click="showUploadSheet = true">
          <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><rect width="300" height="120" fill="#f2f2f2" /><path d="M20 20h60v40h-60zM100 20h140v70h-140z" fill="none" stroke="#c6c6c6" stroke-width="2" /></svg>
          <span class="plan-edit-badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.3 1.8l2.9 2.9L4.9 14 1.5 14.5 2 11.1z" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" /></svg>
          </span>
        </div>
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="!levelName.trim()" @click="saveLevelStep">Continua</Button>
      </div>
    </template>

    <template v-else-if="subStep === 'sottolivello-intro'">
      <div class="intro-bg">
        <img src="/images/sottolivello-new.png" alt="" class="intro-bg-image" />
        <div class="intro-bg-overlay" />
        <div class="intro-content">
          <StatusBar inverted />
          <AppHeader title="Creazione sottolivello" leading="back" trailing="close" inverted @back="goToSubStep('livello', 'back')" @close="goDashboard" />
          <div class="body centered">
            <h1 class="title">Creazione dei sottolivelli</h1>
            <p class="subtitle">I sottolivelli rappresentano gli spazi all'interno di un livello, ad esempio uffici, corridoi o reparti.</p>
          </div>
          <div class="footer">
            <Button variant="primary" @click="goToSubStep('sottolivello', 'forward')">Continua</Button>
            <Button variant="ghost" class="skip" @click="skipSubLevel">Salta</Button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="subStep === 'sottolivello'">
      <AppHeader :title="subLevelName" leading="back" trailing="close" @back="goToSubStep('sottolivello-intro', 'back')" @close="goDashboard" />
      <WizardProgress :current="2" :total="3" />
      <div class="body">
        <p class="parent-level-name">{{ levelName }}</p>
        <p class="lead">Ogni sottolivello contiene i dispositivi, come lampade, sensori e pulsantiere.</p>
        <TextField v-model="subLevelName" label="Nome sottolivello" required />
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="!subLevelName.trim()" @click="saveSubLevelStep">Continua</Button>
      </div>
    </template>

    <template v-else-if="subStep === 'summary'">
      <AppHeader :title="levelName" leading="back" trailing="close" @back="backFromSummary" @close="goDashboard" />
      <div class="body">
        <p class="lead">Recap livello e sottolivelli prima della scansione dispositivi.</p>
        <div class="summary-edit-row">
          <button type="button" class="edit-link" @click="editLevelFromSummary">Modifica livello</button>
        </div>
        <template v-if="subLevelNames.length > 0">
          <p class="section-caption">SOTTOLIVELLI</p>
          <div class="sublevel-edit-list">
            <div
              v-for="(name, i) in subLevelNames"
              :key="i"
              class="sublevel-edit-row"
            >
              <TextField
                v-model="subLevelNames[i]"
                label="Nome sottolivello"
                @focus="cacheSubLevelName(i)"
                @blur="commitSubLevelRename(i)"
              />
              <span class="sublevel-device-count">{{ deviceCountFor(name) }} dispositivi</span>
              <button
                type="button"
                class="sublevel-delete-btn"
                aria-label="Elimina sottolivello"
                @click="removeSubLevelFromSummary(i)"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3.5A1.5 1.5 0 019.5 2h1A1.5 1.5 0 0112 3.5V5M15 5v11a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 16V5h10z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M8.5 8.5v6M11.5 8.5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
              </button>
            </div>
          </div>
          <Button variant="secondary" @click="addAnotherSubLevel">+ Aggiungi sottolivello</Button>
        </template>

        <template v-else>
          <p class="section-caption">DISPOSITIVI</p>
          <div v-if="levelDevices.length > 0" class="levels-preview">
            <button
              v-for="d in levelDevices"
              :key="d.id"
              type="button"
              class="level-preview-row"
              @click="openDeviceConfig(d.id)"
            >
              <span>
                <span class="level-preview-name">{{ d.name }}</span>
                <span class="level-preview-sub">{{ d.type }}</span>
              </span>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>
          <Button variant="secondary" @click="addDeviceToLevel">+ Aggiungi dispositivo</Button>
        </template>

        <p v-if="levelsRemaining > 0" class="levels-remaining">Livelli ancora da configurare: {{ levelsRemaining }}</p>
      </div>
      <div class="footer">
        <Button v-if="!hasSeenScanStep" variant="primary" @click="startScanFromSummary">Continua con scansione</Button>
        <Button v-else-if="isLastLevel" variant="primary" @click="goToCollaborators">Invita collaboratori</Button>
        <Button v-else variant="primary" @click="completeLevel">Continua al livello {{ levelIndex + 1 }}</Button>
      </div>
    </template>

    <template v-else-if="subStep === 'sottolivello-edit'">
      <AppHeader :title="editingSubLevelName" leading="back" trailing="close" @back="goToSubStep('summary', 'back')" @close="goDashboard" />
      <div class="body">
        <p class="parent-level-name-hint">Questo sottolivello si trova in: <strong>{{ levelName }}</strong></p>
        <TextField v-model="editingSubLevelName" label="Nome sottolivello" required />

        <template v-if="editingSubLevelIndex !== null && devicesFor(subLevelNames[editingSubLevelIndex]).length > 0">
          <p class="section-caption">DISPOSITIVI</p>
          <div class="levels-preview">
            <button
              v-for="d in devicesFor(subLevelNames[editingSubLevelIndex])"
              :key="d.id"
              type="button"
              class="level-preview-row"
              @click="openDeviceConfig(d.id)"
            >
              <span>
                <span class="level-preview-name">{{ d.name }}</span>
                <span class="level-preview-sub">{{ d.type }}</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" /><circle cx="12" cy="3" r="1" fill="currentColor" /><circle cx="21" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="21" r="1" fill="currentColor" /><circle cx="3" cy="12" r="1" fill="currentColor" /></svg>
            </button>
          </div>
        </template>
        <Button variant="secondary" @click="addDeviceToSubLevel">+ Aggiungi dispositivo</Button>
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="!editingSubLevelName.trim()" @click="saveSubLevelEdit">Salva</Button>
      </div>
    </template>

    <BottomSheet v-model="showUploadSheet" title="Caricamento planimetria">
      <button type="button" class="sheet-action" @click="takePhoto">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8a2 2 0 012-2h1.2l.6-1.2A1.5 1.5 0 019.15 4h5.7a1.5 1.5 0 011.35.8l.6 1.2H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><circle cx="12" cy="13" r="3.2" stroke="currentColor" stroke-width="1.5" /></svg>
        <span class="sheet-action-label">Scatta una foto</span>
      </button>
      <button type="button" class="sheet-action" @click="choosePlanSource">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" stroke-width="1.5" /><circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" stroke-width="1.5" /><path d="M3 16.5l5.5-5.5 4 4 4-4 4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
        <span class="sheet-action-label">Scegli dalla Libreria</span>
      </button>
    </BottomSheet>

    <AlertDialog v-model="showCameraPermission" system title="" :disabled="takingPhoto">
      <template #title>
        <div class="location-permission-content">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="location-icon"><path d="M4 8a2 2 0 012-2h1.2l.6-1.2A1.5 1.5 0 019.15 4h5.7a1.5 1.5 0 011.35.8l.6 1.2H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><circle cx="12" cy="13" r="3.2" stroke="currentColor" stroke-width="1.5" /></svg>
          <span>"<strong>Kin Sync</strong>" vorrebbe accedere alla tua fotocamera</span>
          <p class="location-description">Ti consente di personalizzare l'app con le foto della tua fotocamera</p>
        </div>
      </template>
      <Button variant="ios" :disabled="takingPhoto" @click="grantCamera">Consenti una volta</Button>
      <Button variant="ios" :disabled="takingPhoto" @click="grantCamera">Consenti quando utilizzi l'app</Button>
      <Button variant="ios" :disabled="takingPhoto" @click="denyCamera"><strong>Non consentire</strong></Button>
    </AlertDialog>

    <div v-if="takingPhoto" class="location-loading-overlay">
      <div class="location-loader"></div>
      <p class="location-loading-text">Apertura fotocamera…</p>
    </div>
    </div>
    </Transition>
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

.step-screen {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-forward-enter-from {
  transform: translateX(28px);
  opacity: 0;
}

.page-forward-leave-to {
  transform: translateX(-28px);
  opacity: 0;
}

.page-back-enter-from {
  transform: translateX(-28px);
  opacity: 0;
}

.page-back-leave-to {
  transform: translateX(28px);
  opacity: 0;
}

.body.centered {
  align-items: flex-start;
  text-align: left;
  justify-content: flex-end;
  padding-bottom: 36px;
  gap: 12px;
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
  filter: grayscale(0.3) contrast(1.08) saturate(1.14);
}

.intro-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.36) 0%,
    rgba(0, 0, 0, 0.24) 40%,
    rgba(0, 0, 0, 0.66) 100%
  );
  z-index: 1;
}

.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 2;
  position: relative;
}

.intro-content .body {
  padding: 24px var(--space-page-x);
}

.intro-content .placeholder-icon {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
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
  color: #fff !important;
}

.illustration {
  color: var(--color-primary);
  margin-bottom: 8px;
}

.placeholder-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
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

.lead {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.parent-level-name {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--color-primary);
}

.field-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.upload-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-surface);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  cursor: pointer;
}

.plan-preview {
  position: relative;
  border-radius: var(--radius-input);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--color-border);
}

.plan-preview svg {
  display: block;
}

.plan-edit-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer {
  padding: 16px var(--space-page-x) 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-caption {
  margin: 0;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.levels-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sublevel-edit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sublevel-edit-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  column-gap: 10px;
}

.sublevel-edit-row :deep(.field) {
  margin: 0;
}

.sublevel-device-count {
  grid-column: 1;
  margin: -4px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.level-preview-item {
  position: relative;
}

.level-preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.sublevel-delete-btn {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.level-preview-row > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.level-preview-name {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.level-preview-sub {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.levels-remaining {
  margin: 8px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.summary-edit-row {
  display: flex;
  justify-content: flex-end;
  margin: -8px 0 0;
}

.edit-link {
  border: none;
  background: transparent;
  padding: 0;
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-accent);
  text-decoration: underline;
  cursor: pointer;
}

.parent-level-name-hint {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.skip {
  align-self: center;
}

.sheet-action {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
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

.sheet-action-label {
  flex: 0 1 auto;
}

.sheet-action:last-child {
  border-bottom: none;
}

.location-permission-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.location-icon {
  color: var(--color-primary);
  margin-bottom: 4px;
}

.location-description {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
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

.location-loading-text {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

@keyframes location-spin {
  to { transform: rotate(360deg); }
}
</style>
