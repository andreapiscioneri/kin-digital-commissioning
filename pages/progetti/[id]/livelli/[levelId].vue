<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const levelId = route.params.levelId as string
const { getLevel, updateLevel } = useLevelsStore(projectId)
const { goBack, goBackTo } = useNavStack()

const level = getLevel(levelId)
const name = ref(level?.name || '')
const nameTouched = ref(false)
const subLevelNames = ref<string[]>(level?.subLevelNames ? [...level.subLevelNames] : [])
const subLevels = ref(level?.subLevels || subLevelNames.value.length)
const hasPlan = ref(level?.hasPlan || false)
const showUploadSheet = ref(false)
const showCameraPermission = ref(false)
const showGalleryPermission = ref(false)
const showGalleryPicker = ref(false)
const takingPhoto = ref(false)
const deleteTarget = ref<number | null>(null)
const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const nameError = computed(() => (nameTouched.value && !name.value.trim() ? 'Campo obbligatorio' : ''))

const galleryThumbnails = ['#e8d9c3', '#c3d4e8', '#d9c3e8', '#c3e8d4', '#e8c3c3', '#d4d4d4']

watch(subLevels, (count: number) => {
  if (count > subLevelNames.value.length) {
    const additions = []
    for (let i = subLevelNames.value.length; i < count; i++) additions.push(`Sottolivello ${i + 1}`)
    subLevelNames.value = [...subLevelNames.value, ...additions]
  } else if (count < subLevelNames.value.length) {
    subLevelNames.value = subLevelNames.value.slice(0, count)
  }
})

function askDeleteSubLevel(index: number) {
  deleteTarget.value = index
}

function confirmDeleteSubLevel() {
  if (deleteTarget.value === null) return
  subLevelNames.value = subLevelNames.value.filter((_: string, i: number) => i !== deleteTarget.value)
  subLevels.value = subLevelNames.value.length
  deleteTarget.value = null
}

function reorderSubLevels(fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return
  const items = [...subLevelNames.value]
  const [moved] = items.splice(fromIndex, 1)
  items.splice(toIndex, 0, moved)
  subLevelNames.value = items
}

function onSubLevelDragStart(index: number, event: DragEvent) {
  draggingIndex.value = index
  dragOverIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function onSubLevelDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  if (draggingIndex.value === null) return
  dragOverIndex.value = index
}

function onSubLevelDrop(index: number, event: DragEvent) {
  event.preventDefault()
  if (draggingIndex.value === null) return
  reorderSubLevels(draggingIndex.value, index)
  draggingIndex.value = null
  dragOverIndex.value = null
}

function onSubLevelDragEnd() {
  draggingIndex.value = null
  dragOverIndex.value = null
}

function choosePlanSource() {
  showUploadSheet.value = false
  showGalleryPermission.value = true
}

function grantGallery() {
  showGalleryPermission.value = false
  showGalleryPicker.value = true
}

function denyGallery() {
  showGalleryPermission.value = false
}

function pickGalleryPhoto() {
  hasPlan.value = true
  showGalleryPicker.value = false
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
  updateLevel(levelId, { name: name.value, subLevels: subLevels.value, subLevelNames: subLevelNames.value, hasPlan: hasPlan.value })
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

        <template v-if="subLevelNames.length > 0">
          <p class="section-caption">SOTTOLIVELLI</p>
          <div class="sublevel-list">
            <div
              v-for="(_, i) in subLevelNames"
              :key="i"
              class="sublevel-row"
              :class="{ 'is-drag-over': dragOverIndex === i && draggingIndex !== i, 'is-dragging': draggingIndex === i }"
              @dragover="onSubLevelDragOver(i, $event)"
              @dragenter.prevent
              @drop="onSubLevelDrop(i, $event)"
            >
              <button
                type="button"
                class="drag-handle"
                aria-label="Trascina per riordinare"
                draggable="true"
                @dragstart="onSubLevelDragStart(i, $event)"
                @dragend="onSubLevelDragEnd"
              >
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="2" cy="2" r="1.3" fill="currentColor" /><circle cx="8" cy="2" r="1.3" fill="currentColor" /><circle cx="2" cy="8" r="1.3" fill="currentColor" /><circle cx="8" cy="8" r="1.3" fill="currentColor" /><circle cx="2" cy="14" r="1.3" fill="currentColor" /><circle cx="8" cy="14" r="1.3" fill="currentColor" /></svg>
              </button>
              <TextField v-model="subLevelNames[i]" label="Nome sottolivello" />
              <button type="button" class="trash-btn" aria-label="Elimina sottolivello" @click="askDeleteSubLevel(i)">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3.5A1.5 1.5 0 019.5 2h1A1.5 1.5 0 0112 3.5V5M15 5v11a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 16V5h10z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M8.5 8.5v6M11.5 8.5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="footer">
      <Button variant="primary" :disabled="!name.trim()" @click="save">Salva</Button>
    </div>

    <BottomSheet v-model="showUploadSheet" title="Caricamento planimetria">
      <button type="button" class="sheet-action" @click="takePhoto">Scatta una foto</button>
      <button type="button" class="sheet-action" @click="choosePlanSource">Scegli dalla Libreria</button>
    </BottomSheet>

    <AlertDialog
      :model-value="deleteTarget !== null"
      :title="`Elimina “${deleteTarget !== null ? subLevelNames[deleteTarget] : ''}”`"
      :description="`Vuoi davvero eliminare “${deleteTarget !== null ? subLevelNames[deleteTarget] : ''}”?`"
      @update:model-value="deleteTarget = null"
    >
      <template #icon>
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
      </template>
      <div class="dialog-btn-row">
        <Button variant="ghost" @click="deleteTarget = null">Annulla</Button>
        <Button variant="primary" @click="confirmDeleteSubLevel">Elimina</Button>
      </div>
    </AlertDialog>

    <AlertDialog v-model="showGalleryPermission" system title="" :disabled="false">
      <template #title>
        <div class="location-permission-content">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="location-icon"><rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" stroke-width="1.5" /><circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" stroke-width="1.5" /><path d="M3 16.5l5.5-5.5 4 4 4-4 4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
          <span>"<strong>Kin Sync</strong>" vorrebbe accedere alle tue foto</span>
          <p class="location-description">Ti consente di personalizzare l'app con foto della tua libreria fotografica</p>
        </div>
      </template>
      <Button variant="ios" @click="grantGallery">Consenti l'accesso a tutte le foto</Button>
      <Button variant="ios" @click="denyGallery"><strong>Non consentire</strong></Button>
    </AlertDialog>

    <BottomSheet v-model="showGalleryPicker" title="Rullino foto">
      <div class="gallery-grid">
        <button
          v-for="(color, i) in galleryThumbnails"
          :key="i"
          type="button"
          class="gallery-thumb"
          :style="{ background: color }"
          aria-label="Seleziona foto"
          @click="pickGalleryPhoto"
        />
      </div>
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

.section-caption {
  margin: 4px 0 0;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.sublevel-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sublevel-row {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  transition: background-color 0.18s ease;
}

.sublevel-row.is-drag-over {
  background: var(--color-surface-alt);
}

.sublevel-row.is-dragging {
  opacity: 0.7;
}

.sublevel-row :deep(.field) {
  flex: 1;
}

.drag-handle {
  width: 24px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--color-text-secondary);
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.trash-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.gallery-thumb {
  aspect-ratio: 1;
  border: none;
  border-radius: var(--radius-input);
  cursor: pointer;
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
