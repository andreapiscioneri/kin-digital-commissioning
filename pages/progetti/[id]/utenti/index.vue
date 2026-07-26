<script setup lang="ts">
import type { CollaboratorRole } from '~/composables/useCollaboratorsStore'

const route = useRoute()
const projectId = route.params.id as string
const { invite } = useCollaboratorsStore(projectId)
const { goClose } = useNavStack()

type Screen = 'intro' | 'form' | 'success'
const screen = ref<Screen>('intro')

const email = ref('')
const role = ref<CollaboratorRole | ''>('')
const showConfirm = ref(false)
const lastInvited = ref({ email: '', role: '' as CollaboratorRole | '' })

const roleOptions: { value: CollaboratorRole; label: string }[] = [
  { value: 'Commissioner', label: 'Commissioner' },
  { value: 'Installer', label: 'Installer' },
  { value: 'End user', label: 'End user' }
]

const canInvite = computed(() => !!email.value.trim() && !!role.value)

function goToNextStep() {
  navigateTo(`/progetti/${projectId}/dispositivi/scan`)
}

function askConfirm() {
  if (!canInvite.value) return
  showConfirm.value = true
}

function confirmInvite() {
  invite(email.value, role.value as CollaboratorRole)
  lastInvited.value = { email: email.value, role: role.value }
  showConfirm.value = false
  screen.value = 'success'
}

function inviteAnother() {
  email.value = ''
  role.value = ''
  screen.value = 'form'
}
</script>

<template>
  <div class="screen">
    <StatusBar />

    <template v-if="screen === 'intro'">
      <AppHeader title="" leading="none" trailing="close" @close="goToNextStep" />
      <div class="body centered">
        <svg class="illustration" width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden="true">
          <rect x="30" y="20" width="60" height="100" rx="8" stroke="currentColor" stroke-width="1.3" />
          <circle cx="60" cy="100" r="3" fill="currentColor" />
          <path d="M95 60l25-15M120 45l-4 10 10 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="45" cy="45" r="6" stroke="currentColor" stroke-width="1.2" />
          <path d="M38 60c1-6 4-9 7-9s6 3 7 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
        <h1 class="title">Invita i collaboratori</h1>
        <p class="subtitle">Puoi invitare altri collaboratori che potranno gestire questo progetto</p>
      </div>
      <div class="footer">
        <Button variant="primary" @click="screen = 'form'">Continua</Button>
        <Button variant="ghost" class="skip" @click="goToNextStep">Salta</Button>
      </div>
    </template>

    <template v-else-if="screen === 'form'">
      <AppHeader title="Invito collaboratori" leading="back" trailing="close" @back="screen = 'intro'" @close="goToNextStep" />
      <div class="body">
        <p class="lead">Inserisci l'indirizzo email e il ruolo dell'utente che vuoi invitare.</p>
        <TextField v-model="email" label="Email" type="email" placeholder="Inserisci qui l'email" />
        <SelectField v-model="role" label="Ruolo" placeholder="Seleziona il ruolo" :options="roleOptions" />
      </div>
      <div class="footer">
        <Button variant="primary" :disabled="!canInvite" @click="askConfirm">Invita</Button>
      </div>

      <AlertDialog v-model="showConfirm" title="Confermi di voler inoltrare l'invito?" :description="`Stai invitando ${email} ad unirsi a questo progetto con il ruolo di ${role}`">
        <div class="dialog-btn-row">
          <Button variant="ghost" @click="showConfirm = false">Annulla</Button>
          <Button variant="primary" @click="confirmInvite">Invita</Button>
        </div>
      </AlertDialog>
    </template>

    <template v-else-if="screen === 'success'">
      <AppHeader title="" leading="none" trailing="none" />
      <div class="body centered">
        <span class="success-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="6" y="12" width="36" height="26" rx="3" stroke="currentColor" stroke-width="1.4" /><path d="M6 14l18 14 18-14" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><circle cx="36" cy="34" r="10" fill="var(--color-primary)" /><path d="M31 34l3.5 3.5L41 30" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <h1 class="title">Email inviata</h1>
        <p class="subtitle">L'email a {{ lastInvited.email }} è stata inviata con successo.</p>
      </div>
      <div class="footer">
        <Button variant="primary" @click="goToNextStep">Continua</Button>
        <Button variant="ghost" class="skip" @click="inviteAnother">Invita un'altra persona</Button>
      </div>
    </template>
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
  gap: 16px;
  padding: 20px var(--space-page-x);
}

.body.centered {
  align-items: center;
  text-align: center;
  justify-content: center;
}

.illustration {
  color: var(--color-primary);
  margin-bottom: 8px;
}

.success-icon {
  color: var(--color-primary);
  margin-bottom: 8px;
}

.title {
  margin: 0;
  font-size: var(--font-size-h1);
  font-weight: 600;
  color: var(--color-primary);
}

.subtitle {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.lead {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-primary);
}

.footer {
  padding: 16px var(--space-page-x) 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skip {
  align-self: center;
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
</style>
