<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ accept: []; reject: [] }>()
</script>

<template>
  <Transition name="cookie-page">
    <div v-if="modelValue" class="cookie-screen" role="dialog" aria-modal="true" aria-label="Consenso cookie">
      <StatusBar />

      <div class="cookie-body">
        <span class="cookie-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3" />
            <circle cx="9" cy="9.5" r="1.2" fill="currentColor" />
            <circle cx="14" cy="8.5" r="1" fill="currentColor" />
            <circle cx="15.5" cy="13" r="1.2" fill="currentColor" />
            <circle cx="10" cy="14.5" r="1" fill="currentColor" />
            <circle cx="13" cy="16.5" r="0.9" fill="currentColor" />
          </svg>
        </span>
        <h1 class="cookie-title">La tua privacy</h1>
        <p class="cookie-text">
          Utilizziamo cookie tecnici necessari al funzionamento dell'app. Con il tuo consenso utilizziamo anche
          cookie analitici per migliorare l'esperienza d'uso e capire come viene utilizzata l'applicazione. Puoi
          cambiare la tua scelta in qualsiasi momento dalle impostazioni.
        </p>
      </div>

      <div class="cookie-footer">
        <Button variant="primary" @click="emit('accept')">Accetta tutti i cookie</Button>
        <Button variant="ghost" class="cookie-reject" @click="emit('reject')">Continua senza accettare</Button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-screen {
  position: absolute;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.cookie-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 20px var(--space-page-x);
}

.cookie-icon {
  color: var(--color-primary);
  margin-bottom: 8px;
}

.cookie-title {
  margin: 0;
  font-size: var(--font-size-h1);
  font-weight: 600;
  color: var(--color-primary);
}

.cookie-text {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.cookie-footer {
  padding: 16px var(--space-page-x) 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cookie-reject {
  align-self: center;
}

.cookie-page-enter-active,
.cookie-page-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.cookie-page-enter-from,
.cookie-page-leave-to {
  opacity: 0;
}
</style>
