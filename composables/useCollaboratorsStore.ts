export type CollaboratorRole = 'Commissioner' | 'Installer' | 'End user'

export interface Collaborator {
  id: string
  email: string
  role: CollaboratorRole
}

export function useCollaboratorsStore(projectId: string) {
  const allCollaborators = useState<Record<string, Collaborator[]>>('dc-collaborators', () => ({}))

  const collaborators = computed({
    get: () => allCollaborators.value[projectId] || [],
    set: (val: Collaborator[]) => {
      allCollaborators.value = { ...allCollaborators.value, [projectId]: val }
    }
  })

  function invite(email: string, role: CollaboratorRole) {
    collaborators.value = [...collaborators.value, { id: `collab-${Date.now()}`, email, role }]
  }

  return { collaborators, invite }
}
