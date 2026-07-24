<script setup lang="ts">
const props = defineProps<{ current: number; total: number }>()
const percent = computed(() => (props.current / props.total) * 100)
</script>

<template>
  <div class="wizard-progress">
    <p class="wizard-progress-label">Step {{ current }} di {{ total }}</p>
    <div class="wizard-progress-track">
      <div class="wizard-progress-fill" :style="{ width: percent + '%' }" />
    </div>
  </div>
</template>

<style scoped>
.wizard-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 var(--space-page-x);
}

.wizard-progress-label {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.wizard-progress-track {
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: var(--color-border);
  overflow: hidden;
}

.wizard-progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--duration-base) var(--ease-standard);
}
</style>
