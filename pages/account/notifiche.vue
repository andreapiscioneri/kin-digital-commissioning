<script setup lang="ts">
const { goBack } = useNavStack()
const { notifications, markAllRead } = useNotificationsStore()

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
