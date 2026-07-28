<script setup lang="ts">
import type { Project, ProjectCategory, ProjectConnectionStatus } from '~/composables/useProjectsStore'

const { projects, isOnline, toggleFavorite, removeProject } = useProjectsStore()
const { notifications, unreadCount, markAllRead } = useNotificationsStore()
const { installerRoleEnabled } = useCommissioningFlow()
const route = useRoute()
const router = useRouter()
const { goForward } = useNavStack()
const showNotifications = ref(false)

function openNotifications() {
  showNotifications.value = true
  markAllRead()
}

// Stato demo per rivedere Offline / Empty state senza dover svuotare i dati reali:
// ?demo=offline oppure ?demo=empty sull'URL.
const demoState = computed(() => (route.query.demo as string) || '')

const activeTab = ref<'preferiti' | 'tutti' | 'eliminati'>('tutti')
const search = ref('')
const activeCategory = ref<ProjectCategory | null>(null)
const menuOpenFor = ref<string | null>(null)
const sideMenuOpen = ref(false)
const showFilters = ref(false)
const showSort = ref(false)
const sortBy = ref<'name' | 'lastSync'>('name')

const categories: ProjectCategory[] = ['Office', 'Industry', 'Sport indoor', 'Retail']

const connectionFilters: { value: ProjectConnectionStatus; label: string }[] = [
  { value: 'online', label: 'Online' },
  { value: 'fault', label: 'Con fault' },
  { value: 'none', label: 'Non connesso' }
]
const filterConnection = ref<Record<ProjectConnectionStatus, boolean>>({ online: true, fault: true, none: true })
const activeFilterCount = computed(() => Object.values(filterConnection.value).filter((v) => !v).length)

const visibleProjects = computed(() => {
  let list = projects.value.filter((p) => !p.deleted)
  if (activeTab.value === 'preferiti') list = list.filter((p) => p.favorite)
  if (activeTab.value === 'eliminati') list = projects.value.filter((p) => p.deleted)
  if (activeCategory.value) list = list.filter((p) => p.category === activeCategory.value)
  list = list.filter((p) => filterConnection.value[p.connectionStatus])
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q))
  }
  const sorted = [...list]
  if (sortBy.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    sorted.sort((a: Project, b: Project) => b.lastSync.split('/').reverse().join('').localeCompare(a.lastSync.split('/').reverse().join('')))
  }
  return sorted
})

function resetFilters() {
  connectionFilters.forEach((f) => { filterConnection.value[f.value] = true })
}

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

function goToInstallerProfile() {
  goForward('/account/profilo?section=installer')
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
      <GreetingHeader :notification-count="unreadCount" @menu="sideMenuOpen = true" @notifications="openNotifications" />
      <div v-if="!installerRoleEnabled" class="installer-banner">
        <p>Solo il ruolo <strong>Installer</strong> può creare progetti.</p>
        <button type="button" class="installer-banner-link" @click="goToInstallerProfile">Abilita il ruolo per iniziare</button>
      </div>
      <div class="empty-body">
        <svg class="empty-illustration" width="260" height="260" viewBox="20 -100 260 260" fill="none" aria-hidden="true" stroke="currentColor">
          <!-- pavimento -->
          <path d="M140 140L40 90 140 40 240 90z" stroke-width="1" opacity="0.6" />
          <!-- parete sinistra -->
          <path d="M140 40L40 90 40 0 140 -50z" stroke-width="1" opacity="0.6" />
          <!-- parete destra -->
          <path d="M140 40L240 90 240 0 140 -50z" stroke-width="1" opacity="0.6" />
          <path d="M140 40v-90" stroke-width="1" opacity="0.6" />

          <!-- finestre parete sinistra -->
          <path d="M125 16L105 26 105 -14.5 125 -24.5z" stroke-width="0.9" opacity="0.7" />
          <path d="M85 36L65 46 65 5.5 85 -4.5z" stroke-width="0.9" opacity="0.7" />
          <!-- finestre parete destra -->
          <path d="M155 16L175 26 175 -14.5 155 -24.5z" stroke-width="0.9" opacity="0.7" />
          <path d="M195 36L215 46 215 5.5 195 -4.5z" stroke-width="0.9" opacity="0.7" />

          <!-- scrivania 1 -->
          <path d="M135 132.5L115 122.5 130 115 150 125z" stroke-width="0.9" />
          <path d="M135 132.5v-15M115 122.5v-15M150 125v-15" stroke-width="0.9" />
          <path d="M135 117.5L115 107.5 130 100 150 110z" stroke-width="0.9" />

          <!-- scrivania 2 -->
          <path d="M100 115L80 105 95 97.5 115 107.5z" stroke-width="0.9" />
          <path d="M100 115v-15M80 105v-15M115 107.5v-15" stroke-width="0.9" />
          <path d="M100 100L80 90 95 82.5 115 92.5z" stroke-width="0.9" />

          <!-- scrivania 3 -->
          <path d="M185 107.5L165 97.5 180 90 200 100z" stroke-width="0.9" />
          <path d="M185 107.5v-15M165 97.5v-15M200 100v-15" stroke-width="0.9" />
          <path d="M185 92.5L165 82.5 180 75 200 85z" stroke-width="0.9" />

          <!-- lampade a sospensione -->
          <path d="M130 -30v85M130 55a4 2.5 0 108 0 4 2.5 0 00-8 0" stroke-width="0.9" />
          <path d="M172 -25v75M172 50a4 2.5 0 108 0 4 2.5 0 00-8 0" stroke-width="0.9" />

          <!-- pianta -->
          <path d="M46 84c-3-5-2-9 1-11M49 84c3-5 2-10-2-12M47.5 84v-13" stroke-width="0.9" stroke-linecap="round" />
          <path d="M42 84h11v6h-11z" stroke-width="0.9" />
        </svg>
        <EmptyState
          variant="centered"
          title=""
          subtitle="Non è presente alcun progetto collegato al tuo account. Crea un nuovo progetto per iniziare."
        />
      </div>
      <div class="bottom-cta">
        <Button variant="primary" size="lg" @click="goToNewProject">Crea nuovo progetto</Button>
      </div>
    </template>

    <template v-else>
      <GreetingHeader :notification-count="unreadCount" @menu="sideMenuOpen = true" @notifications="openNotifications" />

      <div v-if="!installerRoleEnabled" class="installer-banner">
        <p>Solo il ruolo <strong>Installer</strong> può creare progetti.</p>
        <button type="button" class="installer-banner-link" @click="goToInstallerProfile">Abilita il ruolo per iniziare</button>
      </div>

      <div class="tabs">
        <button type="button" class="tab" :class="{ active: activeTab === 'preferiti' }" @click="activeTab = 'preferiti'">
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5.5L18 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
          Preferiti
        </button>
        <button type="button" class="tab" :class="{ active: activeTab === 'tutti' }" @click="activeTab = 'tutti'">Tutti gli impianti</button>
        <button type="button" class="tab" :class="{ active: activeTab === 'eliminati' }" @click="activeTab = 'eliminati'">Impianti eliminati</button>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <input v-model="search" type="search" placeholder="Cerca progetto" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" /><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        </div>
        <button type="button" class="toolbar-icon" :class="{ active: activeFilterCount > 0 }" aria-label="Filtra" @click="showFilters = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 5h16l-6 7.5V19l-4 2v-8.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" /></svg>
          <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
        </button>
        <button type="button" class="toolbar-icon" aria-label="Ordina" @click="showSort = true">
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
    </template>

    <SideMenu v-model="sideMenuOpen" />

    <BottomSheet :model-value="!!menuOpenFor" @update:model-value="menuOpenFor = null">
      <template v-if="menuProject">
        <button type="button" class="sheet-action" @click="toggleFavorite(menuProject.id); menuOpenFor = null">
          <svg v-if="menuProject.favorite" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5.5L18 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M3 3l14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5.5L18 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
          {{ menuProject.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti' }}
        </button>
        <button type="button" class="sheet-action" @click="menuOpenFor = null">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="6.5" r="3.5" stroke="currentColor" stroke-width="1.4" /><path d="M1.5 17c1.2-3.5 4-5.5 6.5-5.5s5.3 2 6.5 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M15 4v6M12 7h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
          Aggiungi utenti
        </button>
        <button type="button" class="sheet-action danger" @click="removeProject(menuProject.id); menuOpenFor = null">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3.5A1.5 1.5 0 019.5 2h1A1.5 1.5 0 0112 3.5V5M15 5v11a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 16V5h10z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M8.5 8.5v6M11.5 8.5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          Cancella progetto
        </button>
      </template>
    </BottomSheet>

    <BottomSheet v-model="showFilters" title="Filtri">
      <p class="sheet-section-title">STATO CONNESSIONE</p>
      <CheckboxRow
        v-for="f in connectionFilters"
        :key="f.value"
        v-model="filterConnection[f.value]"
        :label="f.label"
      />
      <div class="sheet-footer">
        <Button variant="ghost" @click="resetFilters">Reimposta</Button>
        <Button variant="primary" @click="showFilters = false">Applica</Button>
      </div>
    </BottomSheet>

    <BottomSheet v-model="showSort" title="Ordina per">
      <SelectableRow label="Nome (A-Z)" select-type="radio" :selected="sortBy === 'name'" @click="sortBy = 'name'; showSort = false" />
      <SelectableRow label="Ultima sincronizzazione" select-type="radio" :selected="sortBy === 'lastSync'" @click="sortBy = 'lastSync'; showSort = false" />
    </BottomSheet>

    <BottomSheet v-model="showNotifications" title="Notifiche">
      <EmptyState v-if="notifications.length === 0" variant="centered" title="Nessun avviso" subtitle="Le notifiche relative ai tuoi progetti compariranno qui.">
        <template #icon>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        </template>
      </EmptyState>
      <div v-for="item in notifications" v-else :key="item.id" class="notification-row">
        <IconBadge :size="36">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        </IconBadge>
        <div class="notification-text">
          <p class="notification-title">{{ item.title }}</p>
          <p class="notification-description">{{ item.description }}</p>
          <p class="notification-time">{{ item.time }}</p>
        </div>
      </div>
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

.installer-banner {
  margin: 0 var(--space-page-x) 4px;
  padding: 12px 16px;
  border-radius: var(--radius-card);
  background: var(--color-accent-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.installer-banner p {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-primary);
}

.installer-banner-link {
  align-self: flex-start;
  border: none;
  background: transparent;
  padding: 0;
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-accent);
  text-decoration: underline;
  cursor: pointer;
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

.empty-illustration {
  width: 100%;
  max-width: 280px;
  height: auto;
  color: var(--color-primary);
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
  padding: 16px var(--space-page-x) 88px;
}

.tabs {
  display: flex;
  gap: 6px;
  padding: 14px var(--space-page-x);
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: 1px solid transparent;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  font-weight: 500;
  padding: 9px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.tab.active {
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 600;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 var(--space-page-x);
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 18px;
  padding: 0 44px 0 18px;
  font-size: var(--font-size-body);
  font-family: var(--font-family);
  color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.search-box input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-accent);
}

.search-box svg {
  position: absolute;
  right: 14px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.toolbar-icon {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  border: none;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.toolbar-icon.active {
  color: var(--color-accent);
}

.filter-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}

.sheet-section-title {
  margin: 8px 0;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.sheet-footer {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.sheet-footer .btn {
  flex: 1;
}

.chips {
  display: flex;
  gap: 8px;
  padding: 14px var(--space-page-x);
  overflow-x: auto;
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px var(--space-page-x) 154px;
}

.no-results {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
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

.sheet-action.danger svg {
  color: var(--color-error);
}

.sheet-action:last-child {
  border-bottom: none;
}

.sheet-action.danger {
  color: var(--color-error);
}

.notification-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}

.notification-row:last-child {
  border-bottom: none;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.notification-description {
  margin: 2px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.notification-time {
  margin: 6px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  opacity: 0.7;
}
</style>
