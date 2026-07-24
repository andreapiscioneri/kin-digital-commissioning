<script setup lang="ts">
const { direction, transitionName } = useNavDirection()

function resetDirection() {
  direction.value = 'forward'
}
</script>

<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <div class="phone-frame">
      <NuxtPage :transition="{ name: transitionName, mode: 'out-in', onAfterEnter: resetDirection }" />
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
    background: #e5e5e5;
  }

  .phone-frame {
    max-width: var(--screen-max-width);
    min-height: 812px;
    height: 812px;
    border-radius: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
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
</style>
