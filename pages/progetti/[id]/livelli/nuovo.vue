<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { createLevels } = useLevelsStore(projectId)
const { goClose } = useNavStack()

type Screen = 'config' | 'modalita' | 'intro' | 'stepper' | 'guidata-intro' | 'guidata-stepper'
const screen = ref<Screen>('config')
const modalita = ref<'manuale' | 'guidata' | null>(null)
const count = ref(0)

function goDashboard() {
  goClose(`/progetti/${projectId}`)
}

function selectModalita(value: 'manuale' | 'guidata') {
  modalita.value = value
}

function onModalitaContinue() {
  screen.value = modalita.value === 'guidata' ? 'guidata-intro' : 'intro'
}

function onStepperContinue() {
  createLevels(count.value)
  goClose(`/progetti/${projectId}/livelli`)
}

function onGuidataStepperContinue() {
  createLevels(count.value)
  goClose(`/progetti/${projectId}/wizard-guidato/1`)
}
</script>

<template>
  <div class="screen">
    <StatusBar />

    <template v-if="screen === 'config'">
      <AppHeader title="Crea nuovo progetto" leading="back" trailing="close" @back="goDashboard" @close="goDashboard" />
      <div class="body centered">
        <span class="placeholder-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><circle cx="8" cy="10" r="1.6" stroke="currentColor" stroke-width="1.3" /><path d="M2 17l5.5-5.5L12 16l4-4 6 6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
        </span>
        <h1 class="title">Configurazione progetto</h1>
        <p class="subtitle">Nel prossimo passaggio ti mostreremo due modalità di configurazione tra cui scegliere.</p>
      </div>
      <div class="footer">
        <Button variant="primary" @click="screen = 'modalita'">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'modalita'">
      <AppHeader title="Scegli modalità" leading="back" trailing="close" @back="screen = 'config'" @close="goDashboard" />
      <div class="body">
        <p class="lead">Scegli in che modalità creare il tuo progetto:</p>
        <SelectableRow label="Modalità manuale" select-type="radio" :selected="modalita === 'manuale'" @click="selectModalita('manuale')">
          <template #icon><IconBadge><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12 3a3 3 0 014 4l-9 9-4.5 1.5L4 13z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg></IconBadge></template>
        </SelectableRow>
        <SelectableRow label="Modalità guidata" select-type="radio" :selected="modalita === 'guidata'" @click="selectModalita('guidata')">
          <template #icon><IconBadge><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 5h12M4 10h12M4 15h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="4" cy="5" r="1" fill="currentColor" /><circle cx="4" cy="10" r="1" fill="currentColor" /><circle cx="4" cy="15" r="1" fill="currentColor" /></svg></IconBadge></template>
        </SelectableRow>
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="!modalita" @click="onModalitaContinue">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'guidata-intro'">
      <AppHeader title="Modalità guidata" leading="back" trailing="close" @back="screen = 'modalita'" @close="goDashboard" />
      <div class="body">
        <h1 class="title left">Crea la struttura del progetto</h1>
        <p class="subtitle left">Ti guideremo passo dopo passo nella configurazione del tuo progetto.</p>

        <ol class="guided-steps">
          <li>
            <span class="guided-step-badge">1</span>
            <span class="guided-step-text">
              <strong>Creazione livello</strong>
              <span>Crea un livello e personalizzalo aggiungendo una planimetria o una foto.</span>
            </span>
          </li>
          <li>
            <span class="guided-step-badge">2</span>
            <span class="guided-step-text">
              <strong>Creazione sottolivello</strong>
              <span>Organizza il livello in sezioni più specifiche, se necessario.</span>
            </span>
          </li>
          <li>
            <span class="guided-step-badge">3</span>
            <span class="guided-step-text">
              <strong>Aggiunta dispositivi</strong>
              <span>Assegna i dispositivi al livello e ai sottolivelli creati.</span>
            </span>
          </li>
        </ol>
      </div>
      <div class="footer">
        <Button variant="primary" @click="screen = 'guidata-stepper'">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'guidata-stepper'">
      <AppHeader title="Crea livelli" leading="back" trailing="close" @back="screen = 'guidata-intro'" @close="goDashboard" />
      <div class="body">
        <p class="field-title">Seleziona il numero di livelli</p>
        <StepperControl v-model="count" variant="card" />
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="count === 0" @click="onGuidataStepperContinue">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'intro'">
      <AppHeader title="Modalità manuale" leading="back" trailing="close" @back="screen = 'modalita'" @close="goDashboard" />
      <div class="body centered">
        <span class="placeholder-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><circle cx="8" cy="10" r="1.6" stroke="currentColor" stroke-width="1.3" /><path d="M2 17l5.5-5.5L12 16l4-4 6 6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
        </span>
        <h1 class="title">Creazione dei livelli</h1>
        <p class="subtitle">I livelli rappresentano la prima suddivisione del progetto, come Piano Terra, Primo Piano o Esterno.</p>
      </div>
      <div class="footer">
        <Button variant="primary" @click="screen = 'stepper'">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'stepper'">
      <AppHeader title="Creazione livelli" leading="back" trailing="close" @back="screen = 'intro'" @close="goDashboard" />
      <div class="body">
        <p class="field-title">Seleziona il numero di livelli</p>
        <StepperControl v-model="count" variant="card" />

        <template v-if="count > 0">
          <p class="section-caption">LIVELLI PROGETTO</p>
          <div class="levels-preview">
            <div v-for="i in count" :key="i" class="level-preview-row">
              <span>
                <span class="level-preview-name">Livello {{ i }}</span>
                <span class="level-preview-sub">0 Sottolivelli</span>
              </span>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </div>
          </div>
        </template>
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="count === 0" @click="onStepperContinue">Continua</Button>
      </div>
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
  padding: 24px var(--space-page-x);
}

.body.centered {
  align-items: center;
  text-align: center;
  justify-content: center;
}

.title.left,
.subtitle.left {
  text-align: left;
}

.guided-steps {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.guided-steps li {
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
  position: relative;
}

.guided-steps li:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 32px;
  bottom: 0;
  width: 1px;
  background: var(--color-border);
}

.guided-step-badge {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-primary);
}

.guided-step-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.guided-step-text strong {
  font-size: var(--font-size-body);
  color: var(--color-primary);
}

.guided-step-text span:last-child {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.placeholder-icon {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-card);
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: var(--color-primary);
}

.field-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.section-caption {
  margin: 8px 0 0;
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

.level-preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text-secondary);
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

.footer {
  padding: 16px var(--space-page-x) 24px;
}
</style>
