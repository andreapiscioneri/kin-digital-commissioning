<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { projects } = useProjectsStore()
const { levels } = useLevelsStore(projectId)
const { provisionedDevices } = useDeviceCatalog(projectId)
const { groups } = useGroupsStore(projectId)

const project = computed(() => projects.value.find((p) => p.id === projectId))
const activeTab = ref((route.query.tab as string) || 'livelli')
const menuOpen = ref(false)

const tabs = [
  { value: 'livelli', label: 'Livelli' },
  { value: 'dispositivi', label: 'Dispositivi' },
  { value: 'gruppi', label: 'Gruppi' }
]
</script>

<template>
  <div class="screen">
    <StatusBar />

    <header class="dashboard-header">
      <div class="header-row">
        <div class="welcome">
          <p class="company">{{ project?.name }}</p>
          <p class="greeting">Bentornato, Marco</p>
        </div>
        <div class="actions">
          <IconButton aria-label="Notifiche">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 00-5 5v3l-1.5 3h13L15 10V7a5 5 0 00-5-5zM8 16a2 2 0 004 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </IconButton>
          <IconButton aria-label="Menu" @click="menuOpen = true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          </IconButton>
        </div>
      </div>
    </header>

    <div class="body">
      <section class="scenes">
        <SectionHeader title="Scene" @action="navigateTo(`/progetti/${projectId}/scene/nuova`)">
          <template #action>
            <span class="new-scene-btn">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
              Nuovo
            </span>
          </template>
        </SectionHeader>
      </section>

      <TabBar v-model="activeTab" :tabs="tabs" />

      <section class="tab-content">
        <template v-if="activeTab === 'livelli'">
          <template v-if="levels.length === 0">
            <EmptyState variant="card" title="Nessun livello creato" subtitle="Aggiungi almeno un livello per organizzare il tuo progetto.">
              <Button variant="secondary" @click="navigateTo(`/progetti/${projectId}/livelli/nuovo`)">+ Aggiungi livelli</Button>
            </EmptyState>
          </template>
          <template v-else>
            <ListItem
              v-for="level in levels"
              :key="level.id"
              :title="level.name"
              :subtitle-strong="String(level.subLevels)"
              subtitle="Sottolivelli"
              clickable
              @click="navigateTo(`/progetti/${projectId}/livelli/${level.id}`)"
            />
          </template>
        </template>

        <template v-else-if="activeTab === 'dispositivi'">
          <template v-if="provisionedDevices.length === 0">
            <EmptyState variant="card" title="Nessun dispositivo aggiunto" subtitle="Avvia una scansione Bluetooth per individuare i dispositivi da aggiungere.">
              <Button variant="secondary" @click="navigateTo(`/progetti/${projectId}/dispositivi/scan`)">+ Aggiungi dispositivi</Button>
            </EmptyState>
          </template>
          <template v-else>
            <DeviceRow
              v-for="d in provisionedDevices"
              :key="d.id"
              :code="d.name"
              :type="d.type"
              :show-settings="true"
              @toggle="navigateTo(`/progetti/${projectId}/dispositivi/${d.id}/configura`)"
              @settings="navigateTo(`/progetti/${projectId}/dispositivi/${d.id}/configura`)"
            />
          </template>
        </template>

        <template v-else-if="activeTab === 'gruppi'">
          <template v-if="groups.length === 0">
            <EmptyState variant="card" title="Non hai creato ancora nessun gruppo" subtitle="Gestisci parametri e comportamenti specifici per gruppi di dispositivi.">
              <Button variant="secondary" @click="navigateTo(`/progetti/${projectId}/gruppi/nuovo`)">Crea gruppo</Button>
            </EmptyState>
          </template>
          <template v-else>
            <ListItem
              v-for="group in groups"
              :key="group.id"
              :title="group.name"
              :subtitle-strong="String(group.deviceIds.length)"
              subtitle="dispositivi"
              clickable
              @click="navigateTo(`/progetti/${projectId}/gruppi/${group.id}`)"
            />
            <Button variant="secondary" @click="navigateTo(`/progetti/${projectId}/gruppi/nuovo`)">+ Crea gruppo</Button>
          </template>
        </template>
      </section>
    </div>

    <SideMenu v-model="menuOpen" />
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
}

.dashboard-header {
  background: var(--color-surface);
  padding-top: 8px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 16px;
}

.company {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--color-primary);
}

.greeting {
  margin: 4px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scenes {
  padding: 0 var(--space-page-x);
}

.new-scene-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-small);
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px var(--space-page-x) 32px;
}
</style>
