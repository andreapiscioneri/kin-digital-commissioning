<script setup lang="ts">
const { direction, transitionName } = useNavStack()
const { cookieChoice, notificationsChoice, acceptCookies, rejectCookies, grantNotifications, denyNotifications } = useSystemPrompts()

function resetDirection() {
  direction.value = 'forward'
}

const showNotificationsPrompt = computed(() => cookieChoice.value !== 'pending' && notificationsChoice.value === 'pending')
</script>

<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <div class="phone-frame">
      <NuxtPage :transition="{ name: transitionName, mode: 'out-in', onAfterEnter: resetDirection }" />

      <CookieBanner :model-value="cookieChoice === 'pending'" @accept="acceptCookies" @reject="rejectCookies" />

      <AlertDialog
        :model-value="showNotificationsPrompt"
        title="Attiva le notifiche push"
        description="Ricevi aggiornamenti su sincronizzazioni, inviti dei collaboratori e stato dei tuoi progetti."
        :closable="false"
      >
        <template #icon>
          <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 00-5 5v3l-1.5 3h13L15 10V7a5 5 0 00-5-5zM8 16a2 2 0 004 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </template>
        <div class="dialog-btn-row">
          <Button variant="ghost" @click="denyNotifications">Non ora</Button>
          <Button variant="primary" @click="grantNotifications">Attiva</Button>
        </div>
      </AlertDialog>
    </div>
  </div>
</template>

<style>
.app-shell {
  min-height: 100%;
  display: flex;
  justify-content: center;
  background: var(--color-bg);
}

.phone-frame {
  position: relative;
  width: 100%;
  height: 100dvh;
  background: var(--color-bg);
  overflow: hidden;
}

@media (min-width: 480px) {
  .app-shell {
    align-items: center;
    padding: 32px 0;
    background: var(--color-outer-frame);
  }

  .phone-frame {
    max-width: var(--screen-max-width);
    min-height: 812px;
    height: 812px;
    border-radius: 40px;
    box-shadow: var(--shadow-frame);
    overflow: hidden;
  }
}

.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-forward-enter-from {
  transform: translateX(100%);
}

.page-forward-leave-to {
  transform: translateX(-25%);
  opacity: 0.7;
}

.page-back-enter-from {
  transform: translateX(-25%);
  opacity: 0.7;
}

.page-back-leave-to {
  transform: translateX(100%);
}

.page-close-enter-active,
.page-close-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-close-enter-from,
.page-close-leave-to {
  opacity: 0;
  transform: scale(0.97);
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
