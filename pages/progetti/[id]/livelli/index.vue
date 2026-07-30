<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { levels } = useLevelsStore(projectId)
const { collaborators } = useCollaboratorsStore(projectId)
const { goBack, goClose, goForward } = useNavStack()
const hasCompletedInvite = computed(() => route.query.from === 'invite')

function collaboratorInitial(email: string) {
  const initial = email.trim().charAt(0)
  return initial ? initial.toUpperCase() : '?'
}

function openLevel(id: string) {
  goForward(`/progetti/${projectId}/livelli/${id}`)
}

function onContinue() {
  if (levels.value.length === 0) return

  if (!hasCompletedInvite.value) {
    const recapAfterInvite = `/progetti/${projectId}/livelli?from=invite`
    goForward(
      `/progetti/${projectId}/utenti?next=${encodeURIComponent(recapAfterInvite)}&back=${encodeURIComponent(`/progetti/${projectId}/livelli`)}`
    )
    return
  }

  goClose(`/progetti/${projectId}`)
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Creazione livelli" leading="back" trailing="close" @back="goBack(`/progetti/${projectId}`)" @close="goClose(`/progetti/${projectId}`)" />

    <div class="body">
      <EmptyState v-if="levels.length === 0" variant="card" title="Nessun livello creato" subtitle="Aggiungi almeno un livello per proseguire con la configurazione del progetto.">
        <Button variant="secondary" @click="goForward(`/progetti/${projectId}/livelli/nuovo`)">+ Aggiungi livelli</Button>
      </EmptyState>

      <template v-else>
        <ListItem
          v-for="level in levels"
          :key="level.id"
          :title="level.name"
          :subtitle-strong="String(level.subLevels)"
          subtitle="Sottolivelli"
          clickable
          @click="openLevel(level.id)"
        />
      </template>

      <template v-if="hasCompletedInvite">
        <p class="section-caption">Collaboratori</p>
        <div v-if="collaborators.length > 0" class="collaborators-list">
          <div v-for="collab in collaborators" :key="collab.id" class="collaborator-row">
            <span class="collab-avatar">{{ collaboratorInitial(collab.email) }}</span>
            <span class="collab-text">
              <span class="collab-email">{{ collab.email }}</span>
              <span class="collab-role">{{ collab.role }}</span>
            </span>
          </div>
        </div>
        <p v-else class="no-collaborators">Nessun collaboratore invitato per questo Progetto.</p>
      </template>
    </div>

    <div class="footer">
      <Button variant="primary" :disabled="levels.length === 0" @click="onContinue">{{ hasCompletedInvite ? 'Vai al progetto' : 'Invita collaboratori' }}</Button>
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px var(--space-page-x);
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}

.section-caption {
  margin: 8px 0 0;
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

.no-collaborators {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}
</style>
