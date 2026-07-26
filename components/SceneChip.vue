<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    icon: 'yoga' | 'sun' | 'moon'
    color: 'purple' | 'green' | 'blue'
  }>(),
  {}
)
defineEmits<{ click: [] }>()
</script>

<template>
  <button type="button" class="scene-chip" :class="color" @click="$emit('click')">
    <span class="scene-chip-icon">
      <svg v-if="icon === 'yoga'" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" stroke="#fff" stroke-width="1.5" /><path d="M12 8v5m0 0l-5 7m5-7l5 7m-5-4l-4-3m4 3l4-3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <svg v-else-if="icon === 'sun'" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="#fff" stroke-width="1.5" /><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3L5.6 5.6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" /></svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
    <span class="scene-chip-label">{{ label }}</span>
  </button>
</template>

<style scoped>
.scene-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px 0 6px;
  border: none;
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}

.scene-chip-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.scene-chip.purple {
  background: var(--color-purple-soft);
  color: var(--color-purple);
}

.scene-chip.purple .scene-chip-icon {
  background: var(--color-purple-2);
}

.scene-chip.green {
  background: var(--color-lime-soft);
  color: var(--color-lime);
}

.scene-chip.green .scene-chip-icon {
  background: var(--color-lime);
}

.scene-chip.blue {
  background: var(--color-blue-soft);
  color: var(--color-blue);
}

.scene-chip.blue .scene-chip-icon {
  background: var(--color-blue-2);
}
</style>
