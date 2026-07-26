<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const levelIndex = Number(route.params.step)
const { levels, updateLevel } = useLevelsStore(projectId)
const { goClose } = useNavDirection()

const level = computed(() => levels.value[levelIndex - 1])
const totalLevels = computed(() => levels.value.length)

type SubStep = 'livello' | 'sottolivello' | 'dispositivi'
const subStep = ref<SubStep>('livello')

const levelName = ref(level.value?.name || `Livello ${levelIndex}`)
const subLevelName = ref('Sottolivello 1')
const hasPlan = ref(level.value?.hasPlan || false)
const showUploadSheet = ref(false)

function goDashboard() {
  goClose(`/progetti/${projectId}`)
}

function saveLevelStep() {
  updateLevel(level.value.id, { name: levelName.value })
  subStep.value = 'sottolivello'
}

function choosePlanSource() {
  hasPlan.value = true
  showUploadSheet.value = false
}

function saveSubLevelStep() {
  updateLevel(level.value.id, { name: levelName.value, hasPlan: hasPlan.value, subLevels: 1 })
  subStep.value = 'dispositivi'
}

function goToDeviceScan() {
  const next = levelIndex < totalLevels.value ? `/progetti/${projectId}/wizard-guidato/${levelIndex + 1}` : `/progetti/${projectId}/utenti`
  navigateTo(`/progetti/${projectId}/dispositivi/scan?zona=${encodeURIComponent(subLevelName.value)}&next=${encodeURIComponent(next)}`)
}
</script>

<template>
  <div class="screen">
    <template v-if="level">
    <StatusBar />

    <template v-if="subStep === 'livello'">
      <AppHeader :title="levelName" leading="back" trailing="close" @back="goDashboard" @close="goDashboard" />
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

    <template v-else-if="subStep === 'sottolivello'">
      <AppHeader title="Creazione sottolivello" leading="back" trailing="close" @back="subStep = 'livello'" @close="goDashboard" />
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

    <template v-else>
      <AppHeader title="Aggiunta dispositivi" leading="back" trailing="close" @back="subStep = 'sottolivello'" @close="goDashboard" />
      <WizardProgress :current="3" :total="3" />
      <div class="body centered">
        <svg class="illustration" width="160" height="140" viewBox="0 0 160 140" fill="none" aria-hidden="true">
          <path d="M80 10l70 40v0l-70 40-70-40z" stroke="currentColor" stroke-width="1.2" />
          <path d="M10 50v40l70 40v-40M150 50v40l-70 40" stroke="currentColor" stroke-width="1.2" />
          <circle cx="50" cy="65" r="4" fill="currentColor" />
          <circle cx="110" cy="65" r="4" fill="currentColor" />
          <circle cx="65" cy="90" r="4" fill="currentColor" />
          <circle cx="95" cy="90" r="4" fill="currentColor" />
        </svg>
        <h1 class="title">Aggiungi i dispositivi</h1>
        <p class="subtitle">Individua e assegna i dispositivi a “{{ subLevelName }}”.</p>
      </div>
      <div class="footer">
        <Button variant="primary" @click="goToDeviceScan">Continua</Button>
      </div>
    </template>

    <BottomSheet v-model="showUploadSheet" title="Caricamento planimetria">
      <button type="button" class="sheet-action" @click="choosePlanSource">Scatta una foto</button>
      <button type="button" class="sheet-action" @click="choosePlanSource">Scegli dalla Libreria</button>
    </BottomSheet>
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

.body.centered {
  align-items: center;
  text-align: center;
  justify-content: center;
  gap: 12px;
}

.illustration {
  color: var(--color-primary);
  margin-bottom: 8px;
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
</style>
