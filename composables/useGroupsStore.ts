export interface Group {
  id: string
  name: string
  deviceIds: string[]
  profile: string
  mode: 'gruppo' | 'standalone'
  sensorMaster: string
  minBrightness: number
  overrideTime: string
}

export function useGroupsStore(projectId: string) {
  const allGroups = useState<Record<string, Group[]>>('dc-groups', () => ({}))

  const groups = computed<Group[]>({
    get: () => allGroups.value[projectId] || [],
    set: (val: Group[]) => {
      allGroups.value = { ...allGroups.value, [projectId]: val }
    }
  })

  function createGroup(name: string, deviceIds: string[]) {
    const group: Group = {
      id: `group-${Date.now()}`,
      name,
      deviceIds,
      profile: 'SE-66AA',
      mode: 'gruppo',
      sensorMaster: 'SE-66AA',
      minBrightness: 20,
      overrideTime: '10 min'
    }
    groups.value = [...groups.value, group]
    return group
  }

  function getGroup(id: string) {
    return groups.value.find((g: Group) => g.id === id)
  }

  function updateGroup(id: string, patch: Partial<Group>) {
    groups.value = groups.value.map((g: Group) => (g.id === id ? { ...g, ...patch } : g))
  }

  return { groups, createGroup, getGroup, updateGroup }
}
