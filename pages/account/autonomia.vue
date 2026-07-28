<script setup lang="ts">
const { goBack } = useNavStack()
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Autonomia" leading="back" trailing="none" @back="goBack('/progetti')" />

    <div class="body">
      <EmptyState variant="centered" title="Nessun dato di autonomia" subtitle="Le informazioni sull'autonomia dei tuoi dispositivi compariranno qui.">
        <template #icon>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M7 8h6l-1.5 4H15l-6 8 1.5-6H7l1.5-6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
        </template>
      </EmptyState>
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
  padding: 20px var(--space-page-x) 88px;
  display: flex;
  flex-direction: column;
}
</style>
