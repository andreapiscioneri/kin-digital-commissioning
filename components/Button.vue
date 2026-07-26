<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'system' | 'ios'
    size?: 'default' | 'lg'
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
    ariaLabel?: string
  }>(),
  {
    variant: 'primary',
    size: 'default',
    type: 'button',
    disabled: false,
    loading: false,
    ariaLabel: undefined
  }
)

defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[variant, size, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    @click="(e) => $emit('click', e)"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <span v-else class="btn-label"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: var(--radius-button);
  font-family: var(--font-family);
  font-size: var(--font-size-button);
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background var(--duration-base) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.btn.lg {
  height: 64px;
  font-size: var(--font-size-button-lg);
  font-weight: 600;
}

.btn.primary {
  background: var(--color-accent);
  color: #ffffff;
  box-shadow: var(--shadow-fab);
}

.btn.primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn.primary:disabled {
  background: var(--color-accent-disabled);
  color: #ffffff;
  cursor: not-allowed;
}

.btn.secondary {
  background: var(--color-surface);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
}

.btn.secondary:hover:not(:disabled) {
  background: var(--color-accent-soft);
}

.btn.secondary:disabled {
  color: var(--color-text-secondary);
  border-color: var(--color-border);
  cursor: not-allowed;
}

.btn.system {
  height: 48px;
  background: var(--color-chip-active);
  color: var(--color-primary);
  border-radius: var(--radius-card);
  font-weight: 400;
}

.btn.system:hover:not(:disabled) {
  background: var(--color-chip-hover);
}

.btn.ios {
  height: auto;
  min-height: 44px;
  padding: 10px 8px;
  background: transparent;
  color: var(--color-system-link);
  border-radius: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
}

.btn.ios .btn-label {
  white-space: normal;
}

.btn.ios:active:not(:disabled) {
  background: var(--color-chip-active);
  transform: none;
}

.btn.ios:disabled {
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.btn.ghost {
  height: auto;
  width: auto;
  background: transparent;
  color: var(--color-primary);
  font-weight: 500;
  padding: 4px;
}

.btn.ghost:hover:not(:disabled) {
  opacity: 0.7;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  animation: spin 0.7s linear infinite;
}

.btn.secondary .btn-spinner {
  border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-top-color: var(--color-primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
