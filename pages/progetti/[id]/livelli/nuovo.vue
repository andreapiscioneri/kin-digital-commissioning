<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { levels, createLevels } = useLevelsStore(projectId)
const { goBackTo, goClose, goForward } = useNavStack()
const { creationMode } = useCommissioningFlow()

type Screen = 'intro' | 'stepper' | 'guidata-intro' | 'guidata-stepper' | 'ai-intro' | 'ai-stepper'
const validScreens: Screen[] = ['intro', 'stepper', 'guidata-intro', 'guidata-stepper', 'ai-intro', 'ai-stepper']
const screenFromQuery = typeof route.query.screen === 'string' && validScreens.includes(route.query.screen as Screen)
  ? route.query.screen as Screen
  : null
const screen = ref<Screen>(
  screenFromQuery ?? (creationMode.value === 'guidata' ? 'guidata-intro' : creationMode.value === 'ai' ? 'ai-intro' : 'intro')
)
const screenDirection = ref<'forward' | 'back'>('forward')
const screenTransition = computed(() => `page-${screenDirection.value}`)
const count = ref(levels.value.length)

function goDashboard() {
  goClose(`/progetti/${projectId}`)
}

function goToModeSelection() {
  goBackTo('/progetti/nuovo/modalita?screen=modalita')
}

function goForwardScreen(next: Screen) {
  screenDirection.value = 'forward'
  screen.value = next
}

function goBackScreen(next: Screen) {
  screenDirection.value = 'back'
  screen.value = next
}

function onStepperContinue() {
  createLevels(count.value)
  goForward(`/progetti/${projectId}/livelli`)
}

function onGuidataStepperContinue() {
  createLevels(count.value)
  goForward(`/progetti/${projectId}/wizard-guidato/1`)
}

function onAiStepperContinue() {
  createLevels(count.value)
  goForward(`/progetti/${projectId}/livelli`)
}
</script>

<template>
  <div class="screen">
    <Transition :name="screenTransition" mode="out-in">
    <div :key="screen" class="screen-body">
    <template v-if="screen === 'guidata-intro'">
      <StatusBar />
      <AppHeader title="Modalità guidata" leading="back" trailing="close" @back="goToModeSelection" @close="goDashboard" />
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
        <Button variant="primary" @click="goForwardScreen('guidata-stepper')">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'guidata-stepper'">
      <StatusBar />
      <AppHeader title="Crea livelli" leading="back" trailing="close" @back="goBackScreen('guidata-intro')" @close="goDashboard" />
      <div class="body">
        <p class="field-title">Seleziona il numero di livelli</p>
        <div class="number-field-wrapper">
          <TextField
            v-model.number="count"
            type="number"
            placeholder="0"
            inputmode="numeric"
            min="0"
            max="20"
          />
        </div>
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="count === 0" @click="onGuidataStepperContinue">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'ai-intro'">
      <StatusBar />
      <AppHeader title="Modalità AI" leading="back" trailing="close" @back="goToModeSelection" @close="goDashboard" />
      <div class="body">
        <h1 class="title left">Lascia fare all'AI</h1>
        <p class="subtitle left">Analizzeremo le informazioni del progetto per suggerirti una struttura di livelli, che potrai rivedere e confermare.</p>
      </div>
      <div class="footer">
        <Button variant="primary" @click="goForwardScreen('ai-stepper')">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'ai-stepper'">
      <StatusBar />
      <AppHeader title="Livelli suggeriti" leading="back" trailing="close" @back="goBackScreen('ai-intro')" @close="goDashboard" />
      <div class="body">
        <p class="field-title">Rivedi il numero di livelli suggerito</p>
        <StepperControl v-model="count" variant="card" />
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="count === 0" @click="onAiStepperContinue">Continua</Button>
      </div>
    </template>

    <template v-else-if="screen === 'intro'">
      <div class="intro-bg">
        <img src="/images/309633a9-7774-496e-be4a-b9f8625a7a54.png" alt="" class="intro-bg-image" />
        <div class="intro-bg-overlay" />
        <div class="intro-content">
          <StatusBar inverted />
          <AppHeader title="Modalità manuale" leading="back" trailing="close" inverted @back="goToModeSelection" @close="goDashboard" />
          <div class="body centered">
            <span class="placeholder-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><circle cx="8" cy="10" r="1.6" stroke="currentColor" stroke-width="1.3" /><path d="M2 17l5.5-5.5L12 16l4-4 6 6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
            </span>
            <h1 class="title">Creazione dei livelli</h1>
            <p class="subtitle">I livelli rappresentano la prima suddivisione del progetto, come Piano Terra, Primo Piano o Esterno.</p>
          </div>
          <div class="footer">
            <Button variant="primary" @click="goForwardScreen('stepper')">Continua</Button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="screen === 'stepper'">
      <StatusBar />
      <AppHeader title="Creazione livelli" leading="back" trailing="close" @back="goBackScreen('intro')" @close="goDashboard" />
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
    </Transition>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.screen-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
  filter: grayscale(0.6) contrast(1.12) saturate(1.25);
}

.intro-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 1;
}

.intro-bg > :nth-child(n+3) {
  position: relative;
  z-index: 2;
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
  border: 2.5px solid black;
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

.number-field-wrapper {
  margin-top: 16px;
}

.number-field-wrapper :deep(input) {
  width: 100%;
  padding: 16px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  font-size: 18px;
  text-align: center;
  font-weight: 500;
}

.number-field-wrapper :deep(input:focus) {
  outline: none;
  border-color: var(--color-primary);
}

.skip {
  margin-top: 16px !important;
  color: #fff !important;
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
}
</style>
