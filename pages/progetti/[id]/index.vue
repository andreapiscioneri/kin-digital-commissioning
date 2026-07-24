<script setup lang="ts">
// Dashboard di progetto — placeholder, completato nella fase STEP 7 (Creazione Gruppo).
const route = useRoute()
const { projects } = useProjectsStore()
const project = computed(() => projects.value.find((p) => p.id === route.params.id))
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader :title="project?.name || 'Progetto'" leading="back" trailing="none" @back="navigateTo('/progetti')" />
    <div class="body">
      <p>Dashboard di progetto — in costruzione (Livelli / Dispositivi / Gruppi).</p>
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
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px var(--space-page-x);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}
</style>
