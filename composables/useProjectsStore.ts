export type ProjectCategory = 'Office' | 'Industry' | 'Sport indoor' | 'Retail' | 'Relamping' | 'Altro'
export type ProjectSyncStatus = 'synced' | 'not-synced' | 'error'
export type ProjectConnectionStatus = 'online' | 'fault' | 'none'

export interface Project {
  id: string
  name: string
  category: ProjectCategory
  image: string
  address: string
  city: string
  lastSync: string
  levels: number
  devices: number
  syncStatus: ProjectSyncStatus
  connectionStatus: ProjectConnectionStatus
  faultCount?: number
  favorite: boolean
  deleted: boolean
}

const PROJECTS_STORAGE_KEY = 'dc-projects-v6'
const ROSSI_IMAGE = '/images/esterno-per-piccole-imprese-la-facciata-esterna-di-una-piccola-impresa-generica-188752899.webp'
const VERDI_IMAGE = '/images/headquarter-deloitte-milano-som.jpg'

const categoryImages: Record<ProjectCategory, string> = {
  Office: '/images/project-office.jpg',
  Industry: '/images/project-industry.jpg',
  'Sport indoor': '/images/project-sport.jpg',
  Retail: '/images/project-retail.jpg',
  Relamping: '/images/project-office-2.jpg',
  Altro: '/images/project-retail-22.jpg'
}

export const projectImageOptions = [
  '/images/project-industry.jpg',
  '/images/project-office.jpg',
  '/images/project-sport.jpg',
  '/images/project-retail.jpg',
  '/images/project-relamping.jpg',
  '/images/project-retail-22.jpg'
] as const

export function getCategoryImage(category: ProjectCategory) {
  return categoryImages[category]
}

function makeProjects(): Project[] {
  return [
    {
      id: 'beghelli',
      name: 'Beghelli',
      category: 'Industry',
      image: '/images/project-industry.jpg',
      address: 'Via Mozzeghine, 13/15, 40053',
      city: 'Valsamoggia BO',
      lastSync: '21/06/2026',
      levels: 2,
      devices: 15,
      syncStatus: 'error',
      connectionStatus: 'none',
      favorite: true,
      deleted: false
    },
    {
      id: 'rossi-spa',
      name: 'Rossi SpA',
      category: 'Office',
      image: ROSSI_IMAGE,
      address: 'Via Domenico Bosatelli 1, 24069',
      city: 'Cenate Sotto (BG)',
      lastSync: '18/06/2026',
      levels: 4,
      devices: 16,
      syncStatus: 'synced',
      connectionStatus: 'online',
      favorite: false,
      deleted: false
    },
    {
      id: 'miin-cosmetics-bg',
      name: 'Miin Cosmetics BG',
      category: 'Retail',
      image: '/images/project-retail.jpg',
      address: 'Via Domenico Bosatelli 1, 24069',
      city: 'Cenate Sotto (BG)',
      lastSync: 'Non sincronizzato',
      levels: 4,
      devices: 16,
      syncStatus: 'not-synced',
      connectionStatus: 'fault',
      faultCount: 3,
      favorite: false,
      deleted: false
    }
  ]
}

function enforceRossiImage(list: Project[]) {
  return list.map((project) =>
    project.id === 'rossi-spa'
      ? { ...project, image: ROSSI_IMAGE }
      : project
  )
}

function enforceVerdiImage(list: Project[]) {
  return list.map((project) => {
    const isVerdi = project.id.toLowerCase().includes('verdi') || project.name.toLowerCase().includes('verdi')
    return isVerdi ? { ...project, image: VERDI_IMAGE } : project
  })
}

function enforceMiinImage(list: Project[]) {
  return list.map((project) =>
    project.id === 'miin-cosmetics-bg'
      ? { ...project, image: '/images/project-retail.jpg' }
      : project
  )
}

export function useProjectsStore() {
  const projects = useState<Project[]>('dc-projects', () => makeProjects())
  const isOnline = useState<boolean>('dc-is-online', () => true)
  const hydrated = useState<boolean>('dc-projects-hydrated', () => false)

  function normalizeProject(raw: Partial<Project>): Project | null {
    if (!raw.id || !raw.name || !raw.category || !raw.image || !raw.address || !raw.city || !raw.lastSync || !raw.syncStatus || !raw.connectionStatus) {
      return null
    }
    return {
      id: raw.id,
      name: raw.name,
      category: raw.category,
      image: raw.image,
      address: raw.address,
      city: raw.city,
      lastSync: raw.lastSync,
      levels: typeof raw.levels === 'number' ? raw.levels : 0,
      devices: typeof raw.devices === 'number' ? raw.devices : 0,
      syncStatus: raw.syncStatus,
      connectionStatus: raw.connectionStatus,
      faultCount: raw.faultCount,
      favorite: !!raw.favorite,
      deleted: !!raw.deleted
    }
  }

  function hydrateProjects() {
    if (!import.meta.client || hydrated.value) return
    hydrated.value = true
    try {
      const raw = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<Project>[]
      if (!Array.isArray(parsed)) return
      const normalized = parsed
        .map(normalizeProject)
        .filter((project): project is Project => !!project)
      if (normalized.length > 0) {
        projects.value = enforceMiinImage(enforceVerdiImage(enforceRossiImage(normalized)))
      }
    } catch {
      // Ignore corrupt storage and keep seeded defaults.
    }
  }

  function persistProjects() {
    if (!import.meta.client) return
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects.value))
  }

  hydrateProjects()

  projects.value = enforceMiinImage(enforceVerdiImage(enforceRossiImage(projects.value)))

  if (import.meta.client) {
    watch(projects, persistProjects, { deep: true })
  }

  function makeProjectId(name: string) {
    const baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'progetto'
    let nextId = baseId
    let counter = 2
    while (projects.value.some((project) => project.id === nextId)) {
      nextId = `${baseId}-${counter}`
      counter += 1
    }
    return nextId
  }

  function toggleFavorite(id: string) {
    const project = projects.value.find((p) => p.id === id)
    if (project) project.favorite = !project.favorite
  }

  function removeProject(id: string) {
    const project = projects.value.find((p) => p.id === id)
    if (project) project.deleted = true
  }

  function updateProject(id: string, patch: Partial<Project>) {
    projects.value = projects.value.map((p) => (p.id === id ? { ...p, ...patch } : p))
  }

  function createProject(input: { name: string; category: ProjectCategory; address: string; city: string; image?: string }) {
    const id = makeProjectId(input.name)
    const project: Project = {
      id,
      name: input.name,
      category: input.category,
      image: input.image || categoryImages[input.category],
      address: input.address,
      city: input.city,
      lastSync: 'Non sincronizzato',
      levels: 0,
      devices: 0,
      syncStatus: 'not-synced',
      connectionStatus: 'none',
      favorite: false,
      deleted: false
    }
    projects.value = [project, ...projects.value]
    return project
  }

  return { projects, isOnline, toggleFavorite, removeProject, updateProject, createProject }
}
