<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const levelId = route.params.levelId as string
const { getLevel, updateLevel } = useLevelsStore(projectId)
const { goBack, goBackTo } = useNavStack()

const level = getLevel(levelId)
const name = ref(level?.name || '')
const nameTouched = ref(false)
const subLevels = ref(level?.subLevels || 0)
const hasPlan = ref(level?.hasPlan || false)
const showUploadSheet = ref(false)
const showCameraPermission = ref(false)
const takingPhoto = ref(false)

const nameError = computed(() => (nameTouched.value && !name.value.trim() ? 'Campo obbligatorio' : ''))

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

function save() {
  updateLevel(levelId, { name: name.value, subLevels: subLevels.value, hasPlan: hasPlan.value })
  goBackTo(`/progetti/${projectId}/livelli`)
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader :title="`Modifica “${level?.name}”`" leading="back" trailing="none" @back="goBack(`/progetti/${projectId}/livelli`)" />

    <div class="body">
      <div class="plan-card">
        <button v-if="!hasPlan" type="button" class="upload-trigger" @click="showUploadSheet = true">Carica foto o planimetria</button>
        <div v-else class="plan-preview" @click="showUploadSheet = true">
          <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><rect width="300" height="120" fill="#f2f2f2" /><path d="M20 20h60v40h-60zM100 20h140v70h-140z" fill="none" stroke="#c6c6c6" stroke-width="2" /></svg>
          <span class="plan-edit-badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.3 1.8l2.9 2.9L4.9 14 1.5 14.5 2 11.1z" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" /></svg>
          </span>
        </div>

        <TextField v-model="name" label="Nome livello" required :error="nameError" @blur="nameTouched = true" />

        <p class="hint">Ogni livello può essere suddiviso in sottolivelli, come uffici, corridoi, reparti o magazzini.</p>

        <div class="sublevels-row">
          <span>Numero di sottolivelli</span>
          <StepperControl v-model="subLevels" variant="inline" />
        </div>
      </div>
    </div>

    <div class="footer">
      <Button variant="primary" :disabled="!name.trim()" @click="save">Salva</Button>
    </div>

    <BottomSheet v-model="showUploadSheet" title="Caricamento planimetria">
      <button type="button" class="sheet-action" @click="takePhoto">Scatta una foto</button>
      <button type="button" class="sheet-action" @click="choosePlanSource">Scegli dalla Libreria</button>
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
  padding: 20px var(--space-page-x);
}

.plan-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.upload-trigger {
  height: 90px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-surface-alt);
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
}

.plan-preview svg {
  display: block;
}

.plan-edit-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.sublevels-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-body);
  color: var(--color-primary);
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}

.sheet-action {
  width: 100%;
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
