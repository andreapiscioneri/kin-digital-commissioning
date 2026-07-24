<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'spinner' | 'bar' }>(), { variant: 'spinner' })
</script>

<template>
  <span v-if="variant === 'spinner'" class="loader-spinner" aria-hidden="true" />
  <span v-else class="loader-bar" aria-hidden="true"><span class="loader-bar-fill" /></span>
</template>

<style scoped>
.loader-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2.5px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.loader-bar {
  display: block;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  overflow: hidden;
}

.loader-bar-fill {
  display: block;
  width: 40%;
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  animation: bar-slide 1.2s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bar-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}
</style>
