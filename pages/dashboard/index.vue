<script setup lang="ts">
const { projects, toggleFavorite, removeProject } = useProjectsStore()
const { unreadCount } = useNotificationsStore()
const { goForward } = useNavStack()
const sideMenuOpen = ref(false)
const menuOpenFor = ref<string | null>(null)

const menuProject = computed(() => projects.value.find((p) => p.id === menuOpenFor.value) || null)

const activeProjects = computed(() => projects.value.filter((p) => !p.deleted))
const totalDevices = computed(() => activeProjects.value.reduce((sum, p) => sum + p.devices, 0))
const totalLevels = computed(() => activeProjects.value.reduce((sum, p) => sum + p.levels, 0))

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

function openProjects() {
  goForward('/progetti')
}

function openCollaborators(id: string) {
  goForward(`/progetti/${id}/utenti`)
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <GreetingHeader :notification-count="unreadCount" @menu="sideMenuOpen = true" @notifications="openNotifications" />

    <div class="body">
      <section class="overview-card">
        <div class="section-head">
          <div class="section-copy">
            <p class="section-caption">Progetti recenti</p>
            <p class="section-subtitle">Ultimi sincronizzati</p>
          </div>
          <button type="button" class="section-link" @click="openProjects">Vedi tutti</button>
        </div>
        <section class="metrics-board" aria-label="Metriche operative">
          <article class="metric-card">
            <span class="metric-name">Progetti</span>
            <strong class="metric-number">{{ activeProjects.length }}</strong>
          </article>
          <article class="metric-card">
            <span class="metric-name">Dispositivi</span>
            <strong class="metric-number">{{ totalDevices }}</strong>
          </article>
          <article class="metric-card">
            <span class="metric-name">Livelli</span>
            <strong class="metric-number">{{ totalLevels }}</strong>
          </article>
        </section>
      </section>
      <div class="recent-list compact-cards">
        <ProjectCard
          v-for="project in recentProjects"
          :key="project.id"
          :project="project"
          @open="openProject(project.id)"
          @menu="menuOpenFor = project.id"
        />
        <p v-if="recentProjects.length === 0" class="no-results">Nessun progetto ancora sincronizzato.</p>
      </div>
    </div>

    <SideMenu v-model="sideMenuOpen" />

    <BottomSheet :model-value="!!menuOpenFor" @update:model-value="menuOpenFor = null">
      <template v-if="menuProject">
        <button type="button" class="sheet-action" @click="toggleFavorite(menuProject.id); menuOpenFor = null">
          <svg v-if="menuProject.favorite" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5.5L18 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M3 3l14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5.5L18 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
          {{ menuProject.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti' }}
        </button>
        <button type="button" class="sheet-action" @click="menuOpenFor = null; openCollaborators(menuProject.id)">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="6.5" r="3.5" stroke="currentColor" stroke-width="1.4" /><path d="M1.5 17c1.2-3.5 4-5.5 6.5-5.5s5.3 2 6.5 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M15 4v6M12 7h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
          Aggiungi utenti
        </button>
        <button type="button" class="sheet-action danger" @click="removeProject(menuProject.id); menuOpenFor = null">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3.5A1.5 1.5 0 019.5 2h1A1.5 1.5 0 0112 3.5V5M15 5v11a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 16V5h10z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M8.5 8.5v6M11.5 8.5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          Cancella progetto
        </button>
      </template>
    </BottomSheet>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  position: relative;
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px var(--space-page-x) 90px;
}

.overview-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metrics-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 7px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 9px;
  background: var(--color-surface);
}

.metric-name {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-secondary);
}

.metric-number {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.section-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.section-caption {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.section-subtitle {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.section-link {
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 0;
  cursor: pointer;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.compact-cards :deep(.project-card) {
  border-radius: 18px;
  box-shadow: 0 1px 8px -6px rgba(17, 17, 17, 0.2), 0 10px 18px -14px rgba(17, 17, 17, 0.18);
}

.compact-cards :deep(.project-thumb) {
  height: 142px;
  border-radius: 18px 18px 0 0;
}

.compact-cards :deep(.project-content) {
  gap: 5px;
  padding: 10px 12px 12px;
}

.compact-cards :deep(.project-name) {
  font-size: 1rem;
}

.compact-cards :deep(.project-address) {
  font-size: 12px;
}

.compact-cards :deep(.project-sync) {
  font-size: 10px;
}

.no-results {
  text-align: center;
  padding: 24px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

.sheet-action {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 14px 0;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  color: var(--color-primary);
  cursor: pointer;
}

.sheet-action svg {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.sheet-action.danger {
  color: var(--color-error);
}

.sheet-action.danger svg {
  color: currentColor;
}

</style>
