<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel: string
    variant?: 'ghost' | 'circle'
  }>(),
  { variant: 'ghost' }
)

defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button
    type="button"
    class="icon-btn"
    :class="variant"
    :aria-label="ariaLabel"
    @click="(e) => $emit('click', e)"
  >
    <slot />
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 50%;
  transition: background var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.icon-btn.circle {
  background: rgba(39, 57, 69, 0.06);
}

.icon-btn:hover {
  background: rgba(39, 57, 69, 0.1);
}

.icon-btn:active {
  transform: scale(0.9);
}

.icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(39, 57, 69, 0.35);
}
</style>
