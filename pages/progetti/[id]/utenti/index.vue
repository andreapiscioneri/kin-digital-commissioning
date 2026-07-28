<script setup lang="ts">
import type { CollaboratorRole } from '~/composables/useCollaboratorsStore'

const route = useRoute()
const projectId = route.params.id as string
const { invite, collaborators } = useCollaboratorsStore(projectId)
const { goBack, goClose } = useNavStack()

type Screen = 'intro' | 'form' | 'success'
const screen = ref<Screen>('intro')
const screenDirection = ref<'forward' | 'back'>('forward')
const screenTransition = computed(() => `page-${screenDirection.value}`)

const email = ref('')
const emailTouched = ref(false)
const role = ref<CollaboratorRole | ''>('')
const showConfirm = ref(false)
const lastInvited = ref({ email: '', role: '' as CollaboratorRole | '' })

const roleOptions: { value: CollaboratorRole; label: string }[] = [
  { value: 'Commissioner', label: 'Commissioner' },
  { value: 'Installer', label: 'Installer' },
  { value: 'End user', label: 'End user' }
]

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const emailError = computed(() => {
  if (!emailTouched.value) return ''
  if (!email.value.trim()) return 'Campo obbligatorio'
  if (!isEmailValid.value) return 'Inserisci un indirizzo email valido'
  return ''
})

const canInvite = computed(() => isEmailValid.value && !!role.value)
function finishCollaborators() {
  goClose(`/progetti/${projectId}`)
}

function skipCollaborators() {
  finishCollaborators()
}

function askConfirm() {
  if (!canInvite.value) return
  showConfirm.value = true
}

function goToScreen(next: Screen, direction: 'forward' | 'back' = 'forward') {
  screenDirection.value = direction
  screen.value = next
}

function confirmInvite() {
  invite(email.value, role.value as CollaboratorRole)
  lastInvited.value = { email: email.value, role: role.value }
  showConfirm.value = false
  goToScreen('success', 'forward')
}

function inviteAnother() {
  email.value = ''
  emailTouched.value = false
  role.value = ''
  showConfirm.value = false
  goToScreen('form', 'back')
}

function collaboratorInitial(emailAddress: string) {
  const initial = emailAddress.trim().charAt(0)
  return initial ? initial.toUpperCase() : '?'
}
</script>

<template>
  <div class="screen">
    <Transition :name="screenTransition" mode="out-in">
    <div :key="screen" class="screen-body">
    <StatusBar v-if="screen !== 'intro'" />

    <template v-if="screen === 'intro'">
      <div class="intro-bg">
        <img src="/images/samuel-angor-oRSrWHrIfAc-unsplash.jpg" alt="" class="intro-bg-image" />
        <div class="intro-bg-overlay" />
        <div class="intro-content">
          <StatusBar inverted />
          <AppHeader title="" leading="back" trailing="close" inverted @back="goBack(`/progetti/${projectId}`)" @close="finishCollaborators" />
          <div class="body centered">
            <span class="placeholder-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" stroke-width="1.3" /><path d="M2 16c0-1.5 2-3 5-3s5 1.5 5 3v2H2v-2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><circle cx="16" cy="6" r="2.5" stroke="currentColor" stroke-width="1.3" /><path d="M11 16c0-1.5 1.5-3 4-3s4 1.5 4 3v2h-8v-2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
            </span>
            <h1 class="title">Invita i collaboratori</h1>
            <p class="subtitle">Puoi invitare altri collaboratori che potranno gestire questo progetto</p>
          </div>
          <div class="footer">
            <Button variant="primary" @click="goToScreen('form', 'forward')">Continua</Button>
            <Button variant="ghost" class="skip" @click="skipCollaborators">Salta</Button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="screen === 'form'">
      <AppHeader title="Invito collaboratori" leading="back" trailing="close" @back="goToScreen('intro', 'back')" @close="finishCollaborators" />
      <div class="body">
        <p class="lead">Inserisci l'indirizzo email e il ruolo dell'utente che vuoi invitare.</p>
        <TextField v-model="email" label="Email" type="email" placeholder="Inserisci qui l'email" required :error="emailError" @blur="emailTouched = true" />
        <SelectField v-model="role" label="Ruolo" placeholder="Seleziona il ruolo" :options="roleOptions" />

        <template v-if="collaborators.length > 0">
          <p class="section-caption">Collaboratori invitati</p>
          <div class="collaborators-list">
            <div v-for="collab in collaborators" :key="collab.id" class="collaborator-row">
              <span class="collab-avatar">{{ collaboratorInitial(collab.email) }}</span>
              <span class="collab-text">
                <span class="collab-email">{{ collab.email }}</span>
                <span class="collab-role">{{ collab.role }}</span>
              </span>
            </div>
          </div>
        </template>
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
      <AppHeader title="" leading="back" trailing="none" @back="finishCollaborators" />
      <div class="body centered">
        <span class="success-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="6" y="12" width="36" height="26" rx="3" stroke="currentColor" stroke-width="1.4" /><path d="M6 14l18 14 18-14" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><circle cx="36" cy="34" r="10" fill="var(--color-primary)" /><path d="M31 34l3.5 3.5L41 30" stroke="var(--color-surface)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <h1 class="title">Email inviata</h1>
        <p class="subtitle">L'email a {{ lastInvited.email }} è stata inviata con successo.</p>
      </div>
      <div class="footer">
        <Button variant="primary" @click="finishCollaborators">Continua</Button>
        <Button variant="ghost" class="skip" @click="inviteAnother">Invita un'altra persona</Button>
      </div>
    </template>
    </div>
    </Transition>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.screen-body {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-forward-enter-from {
  transform: translateX(28px);
  opacity: 0;
}

.page-forward-leave-to {
  transform: translateX(-28px);
  opacity: 0;
}

.page-back-enter-from {
  transform: translateX(-28px);
  opacity: 0;
}

.page-back-leave-to {
  transform: translateX(28px);
  opacity: 0;
}

.intro-bg {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.intro-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.6) contrast(1.12) saturate(1.25);
}

.intro-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 1;
}

.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 2;
  position: relative;
}

.intro-content .body {
  padding: 24px var(--space-page-x);
}

.intro-content .placeholder-icon {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
}

.intro-content .title {
  color: #fff;
}

.intro-content .subtitle {
  color: rgba(255, 255, 255, 0.85);
}

.intro-content .footer {
  z-index: 3;
  position: relative;
}

.intro-content .skip {
  color: #fff !important;
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

.placeholder-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
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

.section-caption {
  margin: 6px 0 0;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.collaborators-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  overflow: hidden;
}

.collaborator-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
}

.collaborator-row:last-child {
  border-bottom: none;
}

.collab-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  border: 1px solid rgba(17, 17, 17, 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}

.collab-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.collab-email {
  font-size: var(--font-size-body);
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collab-role {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
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
