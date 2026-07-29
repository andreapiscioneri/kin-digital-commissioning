<script setup lang="ts">
withDefaults(defineProps<{ modelValue: boolean; disabled?: boolean; ariaLabel?: string }>(), { disabled: false, ariaLabel: undefined })
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <button
    type="button"
    class="toggle"
    :class="{ on: modelValue }"
    :disabled="disabled"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    @click.stop="emit('update:modelValue', !modelValue)"
  >
    <span class="toggle-knob" />
  </button>
</template>

<style scoped>
.toggle {
  flex-shrink: 0;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  border: none;
  background: var(--color-chip-hover);
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: background var(--duration-base) var(--ease-standard);
}

.toggle.on {
  background: var(--color-accent);
  justify-content: flex-end;
}

.toggle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toggle-knob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform var(--duration-base) var(--ease-standard);
}
</style>
