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

export function useScenesStore(projectId: string) {
  const allScenes = useState<Record<string, Scene[]>>('dc-scenes', () => ({}))

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

  return { scenes, createScene, getScene, updateScene }
}
