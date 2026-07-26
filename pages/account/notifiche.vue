<script setup lang="ts">
const { goBack } = useNavStack()

interface Notification {
  id: string
  title: string
  description: string
  time: string
}

const notifications: Notification[] = [
  { id: 'n1', title: 'Sincronizzazione completata', description: 'Il progetto "Rossi SpA" è stato sincronizzato correttamente.', time: '2 ore fa' },
  { id: 'n2', title: 'Nuovo collaboratore', description: 'Hai invitato un nuovo Installer al progetto "Paladozza".', time: 'Ieri' }
]
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Gestione avvisi" leading="back" trailing="none" @back="goBack('/progetti')" />

    <div class="body">
      <template v-if="notifications.length === 0">
        <EmptyState variant="centered" title="Nessun avviso" subtitle="Le notifiche relative ai tuoi progetti compariranno qui.">
          <template #icon>
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 00-5 5v3l-1.5 3h13L15 10V7a5 5 0 00-5-5zM8 16a2 2 0 004 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </template>
        </EmptyState>
      </template>
      <template v-else>
        <div v-for="item in notifications" :key="item.id" class="notification-row">
          <IconBadge :size="36">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 00-5 5v3l-1.5 3h13L15 10V7a5 5 0 00-5-5zM8 16a2 2 0 004 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </IconBadge>
          <div class="notification-text">
            <p class="notification-title">{{ item.title }}</p>
            <p class="notification-description">{{ item.description }}</p>
            <p class="notification-time">{{ item.time }}</p>
          </div>
        </div>
      </template>
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
  padding: 20px var(--space-page-x) 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-primary);
}

.notification-description {
  margin: 2px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.notification-time {
  margin: 6px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  opacity: 0.7;
}
</style>
