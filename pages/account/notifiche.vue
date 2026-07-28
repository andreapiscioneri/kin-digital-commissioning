<script setup lang="ts">
const { goBack } = useNavStack()
const { notifications, markAllRead, removeNotification } = useNotificationsStore()

markAllRead()
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Gestione avvisi" leading="back" trailing="none" @back="goBack('/progetti')" />

    <div class="body">
      <template v-if="notifications.length === 0">
        <EmptyState variant="centered" title="Nessun avviso" subtitle="Le notifiche relative ai tuoi progetti compariranno qui.">
          <template #icon>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          </template>
        </EmptyState>
      </template>
      <template v-else>
        <div v-for="item in notifications" :key="item.id" class="notification-row">
          <IconBadge :size="36">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          </IconBadge>
          <div class="notification-text">
            <p class="notification-title">{{ item.title }}</p>
            <p class="notification-description">{{ item.description }}</p>
            <p class="notification-time">{{ item.time }}</p>
          </div>
          <button type="button" class="notification-remove" aria-label="Elimina notifica" @click="removeNotification(item.id)">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M8 5V3.5A1.5 1.5 0 019.5 2h1A1.5 1.5 0 0112 3.5V5M15 5v11a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 16V5h10z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M8.5 8.5v6M11.5 8.5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          </button>
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
  padding: 20px var(--space-page-x) 88px;
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

.notification-remove {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
