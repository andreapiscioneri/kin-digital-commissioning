<script setup lang="ts">
withDefaults(defineProps<{ active?: boolean }>(), { active: false })
defineEmits<{ click: [] }>()
</script>

<template>
  <button type="button" class="chip" :class="{ active }" @click="$emit('click')">
    <slot />
  </button>
</template>

<style scoped>
.chip {
  height: 36px;
  padding: 0 16px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  white-space: nowrap;
  cursor: pointer;
}

.chip.active {
  background: linear-gradient(135deg, #ff6a2f 0%, #db3700 60%, #b02b00 100%);
  border-color: transparent;
  color: #ffffff;
  font-weight: 500;
}
</style>
