export type CollaboratorRole = 'Commissioner' | 'Installer' | 'End user'

export interface Collaborator {
  id: string
  email: string
  role: CollaboratorRole
  active: boolean
}

export function useCollaboratorsStore(projectId: string) {
  const allCollaborators = useState<Record<string, Collaborator[]>>('dc-collaborators', () => ({}))

  const collaborators = computed({
    get: () => allCollaborators.value[projectId] || [],
    set: (val: Collaborator[]) => {
      allCollaborators.value = { ...allCollaborators.value, [projectId]: val }
    }
  })

  function invite(email: string, role: CollaboratorRole, active = false) {
    collaborators.value = [...collaborators.value, { id: `collab-${Date.now()}`, email, role, active }]
  }

  function removeCollaborator(id: string) {
    collaborators.value = collaborators.value.filter((collaborator: Collaborator) => collaborator.id !== id)
  }

  return { collaborators, invite, removeCollaborator }
}
