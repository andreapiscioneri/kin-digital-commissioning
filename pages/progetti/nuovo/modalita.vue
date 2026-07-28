<script setup lang="ts">
import type { ProjectCategory } from '~/composables/useProjectsStore'
import type { CreationMode } from '~/composables/useCommissioningFlow'

const { newProjectDraft, creationMode } = useCommissioningFlow()
const { createProject } = useProjectsStore()
const { goBack, goClose, goForward } = useNavStack()
const route = useRoute()

type Screen = 'config' | 'modalita'
const screen = ref<Screen>(route.query.screen === 'modalita' ? 'modalita' : 'config')
const screenDirection = ref<'forward' | 'back'>('forward')
const screenTransition = computed(() => `page-${screenDirection.value}`)
const showInterrupt = ref(false)
const canContinue = computed(() => !!creationMode.value && creationMode.value !== 'ai')

function goDashboardBack() {
  goBack('/progetti/nuovo/dati')
}

function goToModalita() {
  screenDirection.value = 'forward'
  screen.value = 'modalita'
}

function goToConfig() {
  screenDirection.value = 'back'
  screen.value = 'config'
}

function selectMode(mode: CreationMode) {
  creationMode.value = mode
}

function onContinue() {
  if (!canContinue.value) return
  const project = createProject({
    name: newProjectDraft.value.name,
    category: newProjectDraft.value.category as ProjectCategory,
    address: newProjectDraft.value.address,
    city: '',
    image: newProjectDraft.value.image || undefined
  })
  goForward(`/progetti/${project.id}/livelli/nuovo`)
}
</script>

<template>
  <div class="screen">
    <Transition :name="screenTransition" mode="out-in">
    <div :key="screen" class="screen-body">
    <template v-if="screen === 'config'">
      <div class="intro-bg">
        <img src="/images/configurazione-progetto-bg.jpg" alt="" class="intro-bg-image" />
        <div class="intro-bg-overlay" />
        <div class="intro-content">
          <StatusBar inverted />
          <AppHeader title="Configurazione progetto" leading="back" trailing="close" inverted @back="goDashboardBack" @close="showInterrupt = true" />
          <div class="body centered">
            <span class="placeholder-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><circle cx="8" cy="10" r="1.6" stroke="currentColor" stroke-width="1.3" /><path d="M2 17l5.5-5.5L12 16l4-4 6 6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
            </span>
            <h1 class="title">Configurazione progetto</h1>
            <p class="subtitle">Nel prossimo passaggio ti mostreremo tre modalità di configurazione tra cui scegliere.</p>
          </div>
          <div class="footer">
            <Button variant="primary" @click="goToModalita">Continua</Button>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <StatusBar />
      <AppHeader title="Scegli modalità" leading="back" trailing="close" @back="goToConfig" @close="showInterrupt = true" />

      <div class="body">
        <p class="lead">Scegli in che modalità configurare il tuo progetto:</p>
        <SelectableRow label="Modalità manuale" select-type="corner" :selected="creationMode === 'manuale'" @click="selectMode('manuale')">
          <template #icon><IconBadge><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12 3a3 3 0 014 4l-9 9-4.5 1.5L4 13z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg></IconBadge></template>
        </SelectableRow>
        <SelectableRow label="Modalità guidata" select-type="corner" :selected="creationMode === 'guidata'" @click="selectMode('guidata')">
          <template #icon><IconBadge><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 5h12M4 10h12M4 15h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" /><circle cx="4" cy="5" r="1" fill="currentColor" /><circle cx="4" cy="10" r="1" fill="currentColor" /><circle cx="4" cy="15" r="1" fill="currentColor" /></svg></IconBadge></template>
        </SelectableRow>
        <SelectableRow label="Modalità AI" select-type="corner" :selected="creationMode === 'ai'" @click="selectMode('ai')">
          <template #icon><IconBadge><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14l-1.6-4.4L4 8l4.4-1.6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg></IconBadge></template>
        </SelectableRow>
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="!canContinue" @click="onContinue">Continua</Button>
      </div>
    </template>
    </div>
    </Transition>

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
  position: relative;
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

.body.centered {
  align-items: center;
  text-align: center;
  justify-content: center;
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

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px var(--space-page-x);
}

.lead {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-primary);
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

.alert-extra {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}
</style>
