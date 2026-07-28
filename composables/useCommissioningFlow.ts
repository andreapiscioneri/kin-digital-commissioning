import type { ProjectCategory } from '~/composables/useProjectsStore'

export interface NewProjectDraft {
  name: string
  category: ProjectCategory | ''
  image: string
  address: string
  floor: string
  note: string
  timezone: string
  useCurrentLocation: boolean
}

export interface CompanyInfoDraft {
  companyName: string
  vatNumber: string
  companyAddress: string
}

export type CreationMode = 'manuale' | 'guidata' | 'ai'

function emptyDraft(): NewProjectDraft {
  return { name: '', category: '', image: '', address: '', floor: '', note: '', timezone: '', useCurrentLocation: false }
}

function emptyCompanyDraft(): CompanyInfoDraft {
  return { companyName: '', vatNumber: '', companyAddress: '' }
}

export function useCommissioningFlow() {
  const bluetoothEnabled = useState<boolean>('dc-bluetooth-enabled', () => false)
  const installerRoleEnabled = useState<boolean>('dc-installer-role', () => false)
  const newProjectDraft = useState<NewProjectDraft>('dc-new-project-draft', emptyDraft)
  const companyInfoDraft = useState<CompanyInfoDraft>('dc-company-draft', emptyCompanyDraft)
  const creationMode = useState<CreationMode | null>('dc-creation-mode', () => null)

  function resetNewProjectDraft() {
    newProjectDraft.value = emptyDraft()
    companyInfoDraft.value = emptyCompanyDraft()
    creationMode.value = null
  }

  return {
    bluetoothEnabled,
    installerRoleEnabled,
    newProjectDraft,
    companyInfoDraft,
    creationMode,
    resetNewProjectDraft
  }
}
