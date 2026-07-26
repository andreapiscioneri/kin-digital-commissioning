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
    <div class="hero">
      <img src="/images/wizard-complete-bg.jpg" alt="" class="hero-image" />
      <div class="hero-overlay" />
      <span class="hero-check" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
    </div>
    <div class="body">
      <h1 class="title">Configurazione “{{ project?.name }}” completata</h1>
      <p class="subtitle">Il progetto è stato configurato correttamente, ora è pronto per essere utilizzato.</p>
    </div>
    <div class="footer">
      <Button variant="primary" @click="goClose(`/progetti/${projectId}`)">Vai alla dashboard</Button>
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

.hero {
  position: relative;
  height: 42%;
  flex-shrink: 0;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(17, 17, 17, 0.15) 0%, var(--color-bg) 100%);
}

.hero-check {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translate(-50%, 50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-fab);
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
