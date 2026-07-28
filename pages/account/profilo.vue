<script setup lang="ts">
const route = useRoute()
const { goBack } = useNavStack()
const { companyInfoDraft, installerRoleEnabled } = useCommissioningFlow()

const companyNameTouched = ref(false)
const vatTouched = ref(false)

const isInstallerSection = computed(() => route.query.section === 'installer')
const isVatValid = computed(() => /^\d{11}$/.test(companyInfoDraft.value.vatNumber.trim()))
const companyNameError = computed(() => (companyNameTouched.value && !companyInfoDraft.value.companyName.trim() ? 'Campo obbligatorio' : ''))
const vatError = computed(() => {
  if (!vatTouched.value) return ''
  if (!companyInfoDraft.value.vatNumber.trim()) return 'Campo obbligatorio'
  if (!isVatValid.value) return 'Inserisci una Partita IVA valida (11 cifre)'
  return ''
})

const canEnableInstaller = computed(
  () =>
    !!companyInfoDraft.value.companyName.trim() &&
    isVatValid.value &&
    !!companyInfoDraft.value.companyAddress.trim()
)

function enableInstallerRole() {
  if (!canEnableInstaller.value) return
  installerRoleEnabled.value = true
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Dati profilo" leading="back" trailing="none" @back="goBack('/progetti')" />

    <div class="body">
      <div class="avatar-row">
        <span class="avatar" aria-label="Marco Rossi">M</span>
        <div class="avatar-text">
          <p class="name">Marco Rossi</p>
          <p class="role">Installer</p>
        </div>
      </div>

      <section class="section">
        <p class="section-title">Account</p>
        <InfoRow label="Nome" value="Marco Rossi" />
        <InfoRow label="Email" value="marco.rossi@gewiss.com" />
        <InfoRow label="Telefono" value="+39 035 946 111" />
        <InfoRow label="Ruolo" value="Installer" />
      </section>

      <section class="section">
        <p class="section-title">Azienda</p>
        <InfoRow label="Ragione sociale" :value="companyInfoDraft.companyName || 'Gewiss Installazioni Srl'" />
        <InfoRow label="Sede" :value="companyInfoDraft.companyAddress || 'Cenate Sotto (BG)'" />
      </section>

      <section class="section installer-section" :class="{ highlight: isInstallerSection && !installerRoleEnabled }">
        <p class="section-title">Dati Installer</p>

        <template v-if="installerRoleEnabled">
          <InfoRow label="Nome azienda" :value="companyInfoDraft.companyName" />
          <InfoRow label="Partita IVA" :value="companyInfoDraft.vatNumber" />
          <InfoRow label="Indirizzo azienda" :value="companyInfoDraft.companyAddress" />
        </template>

        <template v-else>
          <p class="installer-caption">Completa questi dati per poter creare nuovi progetti.</p>
          <TextField
            v-model="companyInfoDraft.companyName"
            label="Nome azienda"
            required
            variant="boxed"
            placeholder="Inserisci nome azienda"
            :error="companyNameError"
            @blur="companyNameTouched = true"
          />
          <TextField
            v-model="companyInfoDraft.vatNumber"
            label="Partita IVA"
            required
            variant="boxed"
            placeholder="Inserisci Partita IVA"
            :error="vatError"
            @blur="vatTouched = true"
          />
          <SelectField
            v-model="companyInfoDraft.companyAddress"
            label="Indirizzo azienda"
            placeholder="Seleziona indirizzo"
            :options="[{ value: 'Largo Mahler 72, Bergamo', label: 'Largo Mahler 72, Bergamo' }]"
          />
          <Button variant="primary" :disabled="!canEnableInstaller" @click="enableInstallerRole">Abilita ruolo Installer</Button>
        </template>
      </section>
    </div>
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
  padding: 20px var(--space-page-x) calc(132px + env(safe-area-inset-bottom, 0));
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(145deg, var(--color-accent) 0%, #ff7a3d 100%);
  box-shadow: 0 6px 16px -4px rgba(219, 55, 0, 0.45);
  color: #fff;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--color-primary);
}

.role {
  margin: 2px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 12px 16px;
}

.section-title {
  margin: 0 0 4px;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.installer-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 14px;
}

.installer-section.highlight {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(219, 55, 0, 0.12);
}

.installer-section :deep(.field-label) {
  color: var(--color-primary);
}

.installer-section :deep(.field.boxed .field-input),
.installer-section :deep(.field-box) {
  border-color: var(--color-border-secondary);
}

.installer-section :deep(.field-input:-webkit-autofill),
.installer-section :deep(.field-input:-webkit-autofill:hover),
.installer-section :deep(.field-input:-webkit-autofill:focus),
.installer-section :deep(.field-input:-webkit-autofill:active) {
  -webkit-text-fill-color: var(--color-primary);
  -webkit-box-shadow: 0 0 0 1000px var(--color-surface) inset;
  box-shadow: 0 0 0 1000px var(--color-surface) inset;
}

.installer-caption {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}
</style>
