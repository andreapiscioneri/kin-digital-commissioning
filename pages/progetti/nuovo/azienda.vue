<script setup lang="ts">
import type { ProjectCategory } from '~/composables/useProjectsStore'

const { newProjectDraft, companyInfoDraft, installerRoleEnabled } = useCommissioningFlow()
const { createProject } = useProjectsStore()
const { goBack, goClose } = useNavStack()

const showEnableInstaller = ref(!installerRoleEnabled.value)
const formVisible = ref(installerRoleEnabled.value)
const showInterrupt = ref(false)
const companyNameTouched = ref(false)
const vatTouched = ref(false)

const isVatValid = computed(() => /^\d{11}$/.test(companyInfoDraft.value.vatNumber.trim()))
const companyNameError = computed(() => (companyNameTouched.value && !companyInfoDraft.value.companyName.trim() ? 'Campo obbligatorio' : ''))
const vatError = computed(() => {
  if (!vatTouched.value) return ''
  if (!companyInfoDraft.value.vatNumber.trim()) return 'Campo obbligatorio'
  if (!isVatValid.value) return 'Inserisci una Partita IVA valida (11 cifre)'
  return ''
})

const canContinue = computed(
  () =>
    !!companyInfoDraft.value.companyName.trim() &&
    isVatValid.value &&
    !!companyInfoDraft.value.companyAddress.trim()
)

function confirmEnableInstaller() {
  showEnableInstaller.value = false
  formVisible.value = true
}

function cancelEnableInstaller() {
  showEnableInstaller.value = false
  goBack('/progetti/nuovo/dati')
}

function onContinue() {
  if (!canContinue.value) return
  installerRoleEnabled.value = true
  const project = createProject({
    name: newProjectDraft.value.name,
    category: newProjectDraft.value.category as ProjectCategory,
    address: newProjectDraft.value.address,
    city: ''
  })
  goClose(`/progetti/${project.id}/livelli/nuovo`)
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title='Abilita ruolo "Installer"' leading="back" trailing="close" @back="goBack('/progetti/nuovo/dati')" @close="showInterrupt = true" />

    <div v-if="formVisible" class="body">
      <p class="section-label">Informazioni aggiuntive</p>
      <TextField v-model="companyInfoDraft.companyName" label="Nome azienda" required variant="boxed" placeholder="Inserisci nome azienda" :error="companyNameError" @blur="companyNameTouched = true" />
      <TextField v-model="companyInfoDraft.vatNumber" label="Partita IVA" required variant="boxed" placeholder="Inserisci nome" :error="vatError" @blur="vatTouched = true" />
      <SelectField
        v-model="companyInfoDraft.companyAddress"
        label="Indirizzo azienda"
        placeholder="Seleziona indirizzo"
        :options="[{ value: 'Largo Mahler 72, Bergamo', label: 'Largo Mahler 72, Bergamo' }]"
      />
    </div>

    <div v-if="formVisible" class="footer">
      <Button variant="primary" :disabled="!canContinue" @click="onContinue">Continua</Button>
    </div>

    <AlertDialog v-model="showEnableInstaller" title='Abilita ruolo “Installer”' description="Per creare un nuovo progetto è necessario abilitare il ruolo Installer aggiungendo alcune informazioni al tuo profilo." :closable="false">
      <template #icon>
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
      </template>
      <div class="dialog-btn-row">
        <Button variant="ghost" @click="cancelEnableInstaller">Annulla</Button>
        <Button variant="primary" @click="confirmEnableInstaller">Continua</Button>
      </div>
    </AlertDialog>

    <AlertDialog v-model="showInterrupt" title="Interrompi creazione progetto" description="Sei sicuro di voler interrompere la creazione del tuo progetto?">
      <template #icon>
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
      </template>
      <p class="alert-extra">Interrompendo tutti i dettagli andranno persi.</p>
      <div class="dialog-btn-row">
        <Button variant="ghost" @click="showInterrupt = false">Annulla</Button>
        <Button variant="primary" @click="goClose('/progetti')">Interrompi</Button>
      </div>
    </AlertDialog>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px var(--space-page-x);
}

.section-label {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--color-primary);
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}

.dialog-btn-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.dialog-btn-row .btn {
  width: auto;
  flex: 1;
}

.alert-extra {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}
</style>
