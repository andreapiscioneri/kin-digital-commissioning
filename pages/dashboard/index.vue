<script setup lang="ts">
const { projects } = useProjectsStore()
const { unreadCount } = useNotificationsStore()
const { goForward } = useNavStack()

const activeProjects = computed(() => projects.value.filter((p) => !p.deleted))
const totalDevices = computed(() => activeProjects.value.reduce((sum, p) => sum + p.devices, 0))
const totalLevels = computed(() => activeProjects.value.reduce((sum, p) => sum + p.levels, 0))
const faultProjects = computed(() => activeProjects.value.filter((p) => p.connectionStatus === 'fault'))

const recentProjects = computed(() =>
  [...activeProjects.value]
    .sort((a, b) => b.lastSync.split('/').reverse().join('').localeCompare(a.lastSync.split('/').reverse().join('')))
    .slice(0, 3)
)

function openProject(id: string) {
  goForward(`/progetti/${id}`)
}

function openNotifications() {
  goForward('/account/notifiche')
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <GreetingHeader :notification-count="unreadCount" @menu="goForward('/account/profilo')" @notifications="openNotifications" />

    <div class="body">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ activeProjects.length }}</span>
          <span class="stat-label">Progetti</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalDevices }}</span>
          <span class="stat-label">Dispositivi</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalLevels }}</span>
          <span class="stat-label">Livelli</span>
        </div>
        <div class="stat-card" :class="{ warn: faultProjects.length > 0 }">
          <span class="stat-value">{{ faultProjects.length }}</span>
          <span class="stat-label">Con fault</span>
        </div>
      </div>

      <p class="section-caption">PROGETTI RECENTI</p>
      <div class="recent-list">
        <ProjectCard
          v-for="project in recentProjects"
          :key="project.id"
          :project="project"
          @open="openProject(project.id)"
          @menu="() => {}"
        />
        <p v-if="recentProjects.length === 0" class="no-results">Nessun progetto ancora sincronizzato.</p>
      </div>
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
  gap: 8px;
  padding: 20px var(--space-page-x) 90px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
}

.stat-card.warn .stat-value {
  color: var(--color-error);
}

.stat-value {
  font-size: var(--font-size-display);
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.section-caption {
  margin: 8px 0 0;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-results {
  text-align: center;
  padding: 24px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}
</style>
