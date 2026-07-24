import type { ProjectCategory } from '~/composables/useProjectsStore'

export interface NewProjectDraft {
  name: string
  category: ProjectCategory | ''
  address: string
  note: string
  timezone: string
  useCurrentLocation: boolean
}

export interface CompanyInfoDraft {
  companyName: string
  vatNumber: string
  companyAddress: string
}

function emptyDraft(): NewProjectDraft {
  return { name: '', category: '', address: '', note: '', timezone: '', useCurrentLocation: false }
}

function emptyCompanyDraft(): CompanyInfoDraft {
  return { companyName: '', vatNumber: '', companyAddress: '' }
}

export function useCommissioningFlow() {
  const bluetoothEnabled = useState<boolean>('dc-bluetooth-enabled', () => true)
  const installerRoleEnabled = useState<boolean>('dc-installer-role', () => false)
  const newProjectDraft = useState<NewProjectDraft>('dc-new-project-draft', emptyDraft)
  const companyInfoDraft = useState<CompanyInfoDraft>('dc-company-draft', emptyCompanyDraft)

  function resetNewProjectDraft() {
    newProjectDraft.value = emptyDraft()
    companyInfoDraft.value = emptyCompanyDraft()
  }

  return {
    bluetoothEnabled,
    installerRoleEnabled,
    newProjectDraft,
    companyInfoDraft,
    resetNewProjectDraft
  }
}
