export interface Level {
  id: string
  name: string
  subLevels: number
  subLevelNames: string[]
  hasPlan: boolean
}

export function useLevelsStore(projectId: string) {
  const allLevels = useState<Record<string, Level[]>>('dc-levels', () => ({}))

  const levels = computed<Level[]>({
    get: () => allLevels.value[projectId] || [],
    set: (val: Level[]) => {
      allLevels.value = { ...allLevels.value, [projectId]: val }
    }
  })

  function createLevels(count: number, subLevels = 0) {
    const existing = levels.value
    const next = [...existing]
    for (let i = existing.length; i < count; i++) {
      next.push({ id: `level-${projectId}-${i + 1}-${Date.now()}`, name: `Livello ${i + 1}`, subLevels, subLevelNames: [], hasPlan: false })
    }
    levels.value = next.slice(0, Math.max(count, existing.length)).map((l: Level) => ({ ...l, subLevels }))
  }

  function updateLevel(id: string, patch: Partial<Level>) {
    levels.value = levels.value.map((l: Level) => (l.id === id ? { ...l, ...patch } : l))
  }

  function getLevel(id: string) {
    return levels.value.find((l: Level) => l.id === id)
  }

  return { levels, createLevels, updateLevel, getLevel }
}
