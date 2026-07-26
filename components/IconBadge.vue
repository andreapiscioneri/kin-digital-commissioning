<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    tone?: 'neutral' | 'accent' | 'blue' | 'beige' | 'teal' | 'purple'
  }>(),
  { size: 40, tone: 'neutral' }
)
</script>

<template>
  <span class="icon-badge" :class="tone" :style="{ width: size + 'px', height: size + 'px' }">
    <slot />
  </span>
</template>

<style scoped>
.icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-primary);
  flex-shrink: 0;
}

.icon-badge.accent {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.icon-badge.blue {
  background: var(--color-blue-soft);
  color: var(--color-blue);
}

.icon-badge.beige {
  background: var(--color-beige-soft);
  color: var(--color-beige);
}

.icon-badge.teal {
  background: var(--color-teal-soft);
  color: var(--color-teal);
}

.icon-badge.purple {
  background: var(--color-purple-soft);
  color: var(--color-purple);
}
</style>
