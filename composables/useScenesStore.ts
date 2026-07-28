export interface Scene {
  id: string
  name: string
  icon: string
  deviceIds: string[]
  brightness: number
  colorTemp: number
  automaticSensor: number
  corridorDimmer: number
  corridorTimeAfter: string
}

type ScenesByProject = Record<string, Scene[]>
const SCENES_STORAGE_KEY = 'dc-scenes-v1'

export function useScenesStore(projectId: string) {
  const allScenes = useState<ScenesByProject>('dc-scenes', () => ({}))
  const hydrated = useState<boolean>('dc-scenes-hydrated', () => false)

  function normalizeScene(raw: Partial<Scene>): Scene | null {
    if (!raw.id || !raw.name || !raw.icon || !Array.isArray(raw.deviceIds)) return null
    return {
      id: raw.id,
      name: raw.name,
      icon: raw.icon,
      deviceIds: raw.deviceIds,
      brightness: typeof raw.brightness === 'number' ? raw.brightness : 70,
      colorTemp: typeof raw.colorTemp === 'number' ? raw.colorTemp : 2700,
      automaticSensor: typeof raw.automaticSensor === 'number' ? raw.automaticSensor : 70,
      corridorDimmer: typeof raw.corridorDimmer === 'number' ? raw.corridorDimmer : 70,
      corridorTimeAfter: raw.corridorTimeAfter || '00h 00m 05s'
    }
  }

  function hydrateScenes() {
    if (!import.meta.client || hydrated.value) return
    hydrated.value = true
    try {
      const raw = localStorage.getItem(SCENES_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, Partial<Scene>[]>
      if (!parsed || typeof parsed !== 'object') return

      const normalized: ScenesByProject = {}
      for (const [id, sceneList] of Object.entries(parsed)) {
        if (!Array.isArray(sceneList)) continue
        normalized[id] = sceneList
          .map(normalizeScene)
          .filter((scene): scene is Scene => !!scene)
      }
      allScenes.value = normalized
    } catch {
      // Ignore invalid storage payload and keep runtime state.
    }
  }

  function persistScenes() {
    if (!import.meta.client) return
    localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(allScenes.value))
  }

  hydrateScenes()

  if (import.meta.client) {
    watch(allScenes, persistScenes, { deep: true })
  }

  const scenes = computed<Scene[]>({
    get: () => allScenes.value[projectId] || [],
    set: (val: Scene[]) => {
      allScenes.value = { ...allScenes.value, [projectId]: val }
    }
  })

  function createScene(name: string, icon: string, deviceIds: string[]) {
    const scene: Scene = {
      id: `scene-${Date.now()}`,
      name,
      icon,
      deviceIds,
      brightness: 70,
      colorTemp: 2700,
      automaticSensor: 70,
      corridorDimmer: 70,
      corridorTimeAfter: '00h 00m 05s'
    }
    scenes.value = [...scenes.value, scene]
    return scene
  }

  function getScene(id: string) {
    return scenes.value.find((s: Scene) => s.id === id)
  }

  function updateScene(id: string, patch: Partial<Scene>) {
    scenes.value = scenes.value.map((s: Scene) => (s.id === id ? { ...s, ...patch } : s))
  }

  function removeScene(id: string) {
    scenes.value = scenes.value.filter((s: Scene) => s.id !== id)
  }

  return { scenes, createScene, getScene, updateScene, removeScene }
}
