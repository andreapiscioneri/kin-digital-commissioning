export type ProjectCategory = 'Office' | 'Industry' | 'Sport indoor' | 'Retail' | 'Relamping' | 'Altro'
export type ProjectSyncStatus = 'synced' | 'not-synced' | 'error'
export type ProjectConnectionStatus = 'online' | 'fault' | 'none'

export interface Project {
  id: string
  name: string
  category: ProjectCategory
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

function makeProjects(): Project[] {
  return [
    {
      id: 'verdi-srl',
      name: 'Verdi Srl',
      category: 'Office',
      address: 'Via Domenico Bosatelli 1, 24069',
      city: 'Cenate Sotto (BG)',
      lastSync: '12/06/2026',
      levels: 2,
      devices: 22,
      syncStatus: 'not-synced',
      connectionStatus: 'none',
      favorite: true,
      deleted: false
    },
    {
      id: 'kiko-milano-srl',
      name: 'Kiko Milano Srl',
      category: 'Retail',
      address: 'Via Domenico Bosatelli 1 24069',
      city: 'Cenate Sotto (BG)',
      lastSync: '10/06/2026',
      levels: 2,
      devices: 50,
      syncStatus: 'not-synced',
      connectionStatus: 'none',
      favorite: true,
      deleted: false
    },
    {
      id: 'beghelli',
      name: 'Beghelli',
      category: 'Industry',
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
      id: 'paladozza',
      name: 'Paladozza',
      category: 'Sport indoor',
      address: 'Piazza Manfredi Azzarita, 2, 40122',
      city: 'Bologna BO',
      lastSync: '18/06/2026',
      levels: 4,
      devices: 18,
      syncStatus: 'synced',
      connectionStatus: 'online',
      favorite: false,
      deleted: false
    },
    {
      id: 'miin-cosmetics-bg',
      name: 'Miin Cosmetics BG',
      category: 'Retail',
      address: 'Via Domenico Bosatelli 1, 24069',
      city: 'Cenate Sotto (BG)',
      lastSync: '18/06/2026',
      levels: 4,
      devices: 16,
      syncStatus: 'synced',
      connectionStatus: 'fault',
      faultCount: 3,
      favorite: false,
      deleted: false
    }
  ]
}

export function useProjectsStore() {
  const projects = useState<Project[]>('dc-projects', () => makeProjects())
  const isOnline = useState<boolean>('dc-is-online', () => true)

  function toggleFavorite(id: string) {
    const project = projects.value.find((p) => p.id === id)
    if (project) project.favorite = !project.favorite
  }

  function removeProject(id: string) {
    const project = projects.value.find((p) => p.id === id)
    if (project) project.deleted = true
  }

  function createProject(input: { name: string; category: ProjectCategory; address: string; city: string }) {
    const id = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const project: Project = {
      id,
      name: input.name,
      category: input.category,
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

  return { projects, isOnline, toggleFavorite, removeProject, createProject }
}
