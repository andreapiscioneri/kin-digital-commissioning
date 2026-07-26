<script setup lang="ts">
const route = useRoute()
const { projects } = useProjectsStore()
const { goClose, goForward } = useNavStack()

const contextProjectId = (route.query.projectId as string) || ''

type Screen = 'scanning' | 'found'
const screen = ref<Screen>('scanning')
const matchedProject = ref<{ id: string; name: string } | null>(null)
let scanTimer: ReturnType<typeof setTimeout> | null = null

function closeScan() {
  goClose(contextProjectId ? `/progetti/${contextProjectId}` : '/progetti')
}

function simulateDetection() {
  if (screen.value !== 'scanning') return
  const target = contextProjectId
    ? projects.value.find((p) => p.id === contextProjectId)
    : projects.value[0]
  matchedProject.value = target ? { id: target.id, name: target.name } : null
  screen.value = 'found'
}

function goToResult() {
  if (contextProjectId) {
    goForward(`/progetti/${contextProjectId}/dispositivi/scan`)
  } else if (matchedProject.value) {
    goForward(`/progetti/${matchedProject.value.id}`)
  } else {
    goForward('/progetti')
  }
}

function rescan() {
  matchedProject.value = null
  screen.value = 'scanning'
  scanTimer = setTimeout(simulateDetection, 2200)
}

onMounted(() => {
  scanTimer = setTimeout(simulateDetection, 2200)
})

onBeforeUnmount(() => {
  if (scanTimer) clearTimeout(scanTimer)
})
</script>

<template>
  <div class="screen">
    <div class="viewfinder-bg">
      <StatusBar inverted />
      <AppHeader title="" leading="none" trailing="close" inverted @close="closeScan" />

      <div class="viewfinder-body">
        <template v-if="screen === 'scanning'">
          <div class="scan-frame" @click="simulateDetection">
            <span class="corner tl" />
            <span class="corner tr" />
            <span class="corner bl" />
            <span class="corner br" />
            <span class="scan-line" />
          </div>
          <h1 class="title">Inquadra il QR Code</h1>
          <p class="subtitle">Posiziona il QR Code del dispositivo o del pannello all'interno del riquadro per aggiungerlo rapidamente.</p>
        </template>

        <template v-else>
          <span class="success-icon">
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.3" /><path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
          <h1 class="title">QR Code rilevato</h1>
          <p class="subtitle">
            <template v-if="matchedProject">Collegato a “{{ matchedProject.name }}”.</template>
            <template v-else>Nessun progetto associato a questo codice.</template>
          </p>
        </template>
      </div>

      <div class="footer">
        <template v-if="screen === 'scanning'">
          <button type="button" class="manual-link" @click="simulateDetection">Simula rilevamento QR</button>
        </template>
        <template v-else>
          <Button variant="primary" @click="goToResult">Continua</Button>
          <button type="button" class="manual-link" @click="rescan">Scansiona di nuovo</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0b0d0f;
}

.viewfinder-bg {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 35%, #262d33 0%, #0b0d0f 70%);
  color: #fff;
}

.viewfinder-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 20px var(--space-page-x);
}

.scan-frame {
  position: relative;
  width: 220px;
  height: 220px;
  margin-bottom: 12px;
  cursor: pointer;
}

.corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border: 3px solid #fff;
}

.corner.tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.corner.tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.corner.bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.corner.br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

.scan-line {
  position: absolute;
  left: 6px;
  right: 6px;
  height: 2px;
  background: var(--color-accent, #e84e0f);
  box-shadow: 0 0 8px 1px var(--color-accent, #e84e0f);
  animation: scan-move 2.2s ease-in-out infinite;
}

@keyframes scan-move {
  0% {
    top: 6px;
  }
  50% {
    top: calc(100% - 8px);
  }
  100% {
    top: 6px;
  }
}

.success-icon {
  color: #4ade80;
  margin-bottom: 4px;
}

.title {
  margin: 0;
  font-size: var(--font-size-h1);
  font-weight: 600;
  color: #fff;
}

.subtitle {
  margin: 0;
  max-width: 300px;
  font-size: var(--font-size-body);
  color: rgba(255, 255, 255, 0.7);
}

.footer {
  padding: 16px var(--space-page-x) 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.manual-link {
  border: none;
  background: transparent;
  color: #fff;
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  text-decoration: underline;
  cursor: pointer;
}
</style>
