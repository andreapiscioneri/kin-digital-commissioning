<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { projects } = useProjectsStore()
const project = computed(() => projects.value.find((p) => p.id === projectId))
const { goClose } = useNavStack()
</script>

<template>
  <div class="screen">
    <StatusBar />
    <div class="top-bar">
      <button type="button" class="back-btn" aria-label="Indietro" @click="goClose(`/progetti/${projectId}`)">
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none"><path d="M1 8h17M1 8l6-6M1 8l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>
    <div class="body">
      <span class="check-badge" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
      <h1 class="title">{{ project?.name ? `Configurazione “${project.name}” completata` : 'Configurazione completata' }}</h1>
      <p class="subtitle">Il progetto è stato configurato correttamente, ora è pronto per essere utilizzato.</p>
    </div>
    <div class="footer">
      <Button variant="primary" size="lg" @click="goClose(`/progetti/${projectId}`)">Vai alla dashboard</Button>
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

.top-bar {
  flex-shrink: 0;
  padding: 12px var(--space-page-x) 0;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.check-badge {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-fab);
  margin-bottom: 4px;
}

.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px var(--space-page-x) 20px;
  gap: 12px;
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
  max-width: 280px;
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}
</style>
