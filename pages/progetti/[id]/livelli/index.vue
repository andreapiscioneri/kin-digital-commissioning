<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { levels } = useLevelsStore(projectId)
const { goClose, goForward } = useNavDirection()

function openLevel(id: string) {
  navigateTo(`/progetti/${projectId}/livelli/${id}`)
}

function onContinue() {
  goForward(`/progetti/${projectId}/utenti`)
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Livelli progetto" leading="back" trailing="close" @back="navigateTo(`/progetti/${projectId}`)" @close="goClose(`/progetti/${projectId}`)" />

    <div class="body">
      <EmptyState v-if="levels.length === 0" variant="card" title="Nessun livello creato" subtitle="Aggiungi almeno un livello per proseguire con la configurazione del progetto.">
        <Button variant="secondary" @click="navigateTo(`/progetti/${projectId}/livelli/nuovo`)">+ Aggiungi livelli</Button>
      </EmptyState>

      <template v-else>
        <ListItem
          v-for="level in levels"
          :key="level.id"
          :title="level.name"
          :subtitle-strong="String(level.subLevels)"
          subtitle="Sottolivelli"
          clickable
          @click="openLevel(level.id)"
        />
      </template>
    </div>

    <div class="footer">
      <Button variant="primary" :disabled="levels.length === 0" @click="onContinue">Continua</Button>
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px var(--space-page-x);
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}
</style>
