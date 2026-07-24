<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { projects } = useProjectsStore()
const project = computed(() => projects.value.find((p) => p.id === projectId))
</script>

<template>
  <div class="screen">
    <StatusBar />
    <div class="body">
      <svg class="illustration" width="180" height="150" viewBox="0 0 180 150" fill="none" aria-hidden="true">
        <path d="M20 130V30h140v100z" stroke="currentColor" stroke-width="1.2" />
        <path d="M20 30l70-20 70 20" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
        <circle cx="55" cy="70" r="5" fill="currentColor" />
        <circle cx="125" cy="70" r="5" fill="currentColor" />
        <circle cx="90" cy="100" r="5" fill="currentColor" />
        <path d="M60 40l10 8-10 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <h1 class="title">Configurazione “{{ project?.name }}” completata</h1>
      <p class="subtitle">Il progetto è stato configurato correttamente, ora è pronto per essere utilizzato.</p>
    </div>
    <div class="footer">
      <Button variant="primary" @click="navigateTo(`/progetti/${projectId}`)">Vai alla dashboard</Button>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px var(--space-page-x);
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
  max-width: 280px;
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}
</style>
