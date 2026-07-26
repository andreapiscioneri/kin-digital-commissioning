<script setup lang="ts">
import type { ProjectCategory } from '~/composables/useProjectsStore'

const { projects, isOnline, toggleFavorite, removeProject } = useProjectsStore()
const route = useRoute()
const router = useRouter()
const { goForward } = useNavStack()

// Stato demo per rivedere Offline / Empty state senza dover svuotare i dati reali:
// ?demo=offline oppure ?demo=empty sull'URL.
const demoState = computed(() => (route.query.demo as string) || '')

const activeTab = ref<'preferiti' | 'tutti' | 'eliminati'>('preferiti')
const search = ref('')
const activeCategory = ref<ProjectCategory | null>(null)
const menuOpenFor = ref<string | null>(null)
const sideMenuOpen = ref(false)

const categories: ProjectCategory[] = ['Office', 'Industry', 'Sport indoor', 'Retail']

const visibleProjects = computed(() => {
  let list = projects.value.filter((p) => !p.deleted)
  if (activeTab.value === 'preferiti') list = list.filter((p) => p.favorite)
  if (activeTab.value === 'eliminati') list = projects.value.filter((p) => p.deleted)
  if (activeCategory.value) list = list.filter((p) => p.category === activeCategory.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q))
  }
  return list
})

const hasAnyProject = computed(() => projects.value.some((p) => !p.deleted))
const menuProject = computed(() => projects.value.find((p) => p.id === menuOpenFor.value) || null)

function retryConnection() {
  isOnline.value = true
  router.replace({ query: {} })
}

function openProject(id: string) {
  goForward(`/progetti/${id}`)
}

function goToNewProject() {
  goForward('/progetti/nuovo')
}
</script>

<template>
  <div class="screen">
    <StatusBar />

    <template v-if="!isOnline || demoState === 'offline'">
      <div class="offline-body">
        <EmptyState variant="centered" title="Sei offline" subtitle="Controlla che tu abbia accesso ad Internet">
          <template #icon>
            <span class="wifi-off-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M6 15a24 20 0 0128 0M12 21a15 12.5 0 0116 0M18 27a6 5 0 014 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              <span class="wifi-off-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="#fff" stroke-width="1.6" stroke-linecap="round" /></svg>
              </span>
            </span>
          </template>
          <Button variant="primary" @click="retryConnection">Riprova</Button>
          <Button variant="ghost" @click="retryConnection">Offline mode</Button>
        </EmptyState>
      </div>
    </template>

    <template v-else-if="!hasAnyProject || demoState === 'empty'">
      <GreetingHeader @menu="sideMenuOpen = true" @notifications="goForward('/account/notifiche')" />
      <div class="empty-body">
        <img src="/images/empty-projects.jpg" alt="" class="empty-image" />
        <EmptyState
          variant="centered"
          title=""
          subtitle="Non è presente alcun progetto collegato al tuo account. Crea un nuovo progetto per iniziare."
        />
      </div>
      <div class="bottom-cta">
        <Button variant="primary" @click="goToNewProject">Crea nuovo progetto</Button>
      </div>
    </template>

    <template v-else>
      <GreetingHeader :notification-count="2" @menu="sideMenuOpen = true" @notifications="goForward('/account/notifiche')" />

      <div class="tabs">
        <button type="button" class="tab" :class="{ active: activeTab === 'preferiti' }" @click="activeTab = 'preferiti'">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5.5L18 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
          Preferiti
        </button>
        <button type="button" class="tab" :class="{ active: activeTab === 'tutti' }" @click="activeTab = 'tutti'">Tutti gli impianti</button>
        <button type="button" class="tab" :class="{ active: activeTab === 'eliminati' }" @click="activeTab = 'eliminati'">Impianti eliminati</button>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <input v-model="search" type="search" placeholder="Cerca progetto" />
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.4" /><path d="M18 18l-4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        </div>
        <button type="button" class="toolbar-icon" aria-label="Filtra">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 4h14l-5.5 7v5L8.5 18v-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" class="toolbar-icon" aria-label="Ordina">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 5h12M6 10h8M8 15h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        </button>
      </div>

      <div class="chips">
        <FilterChip
          v-for="cat in categories"
          :key="cat"
          :active="activeCategory === cat"
          @click="activeCategory = activeCategory === cat ? null : cat"
        >
          {{ cat }}
        </FilterChip>
      </div>

      <div class="body">
        <div v-if="visibleProjects.length === 0" class="no-results">Nessun progetto trovato.</div>
        <ProjectCard
          v-for="project in visibleProjects"
          :key="project.id"
          :project="project"
          @open="openProject(project.id)"
          @menu="menuOpenFor = project.id"
        />
      </div>

      <button type="button" class="fab" aria-label="Nuovo progetto" @click="goToNewProject">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="#fff" stroke-width="1.8" stroke-linecap="round" /></svg>
      </button>
    </template>

    <SideMenu v-model="sideMenuOpen" />

    <BottomSheet :model-value="!!menuOpenFor" @update:model-value="menuOpenFor = null">
      <template v-if="menuProject">
        <button type="button" class="sheet-action" @click="toggleFavorite(menuProject.id); menuOpenFor = null">
          {{ menuProject.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti' }}
        </button>
        <button type="button" class="sheet-action" @click="menuOpenFor = null">Aggiungi utenti</button>
        <button type="button" class="sheet-action danger" @click="removeProject(menuProject.id); menuOpenFor = null">Cancella progetto</button>
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

.empty-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 var(--space-page-x);
}

.empty-image {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius-card);
  margin-bottom: 12px;
}

.offline-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-page-x);
}

.bottom-cta {
  padding: 16px var(--space-page-x) 24px;
}

.tabs {
  display: flex;
  gap: 20px;
  padding: 16px var(--space-page-x) 12px;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  padding: 0 0 10px;
  cursor: pointer;
}

.tab.active {
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: inset 0 -2px 0 var(--color-accent);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px var(--space-page-x) 0;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 0 36px 0 12px;
  font-size: var(--font-size-body);
  font-family: var(--font-family);
  color: var(--color-primary);
  background: var(--color-surface);
}

.search-box svg {
  position: absolute;
  right: 12px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.toolbar-icon {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.chips {
  display: flex;
  gap: 8px;
  padding: 12px var(--space-page-x);
  overflow-x: auto;
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 var(--space-page-x) 90px;
}

.no-results {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

.fab {
  position: absolute;
  right: 20px;
  bottom: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-fab);
}

.wifi-off-icon {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.wifi-off-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-error);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet-action {
  width: 100%;
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

.sheet-action:last-child {
  border-bottom: none;
}

.sheet-action.danger {
  color: var(--color-error);
}
</style>
