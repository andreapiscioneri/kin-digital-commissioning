<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    options: { value: string; label: string }[]
    disabled?: boolean
  }>(),
  { label: '', placeholder: 'Seleziona', disabled: false }
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()
const inputId = useId()

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="field" :class="{ 'is-disabled': disabled }">
    <label v-if="label" :for="inputId" class="field-label">{{ label }}</label>
    <div class="field-box">
      <select :id="inputId" class="field-select" :value="modelValue" :disabled="disabled" @change="onChange">
        <option value="" disabled hidden>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <svg class="chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </div>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.field-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.field-box {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-surface);
}

.field-select {
  width: 100%;
  height: 48px;
  border: none;
  background: transparent;
  padding: 0 36px 0 14px;
  font-size: var(--font-size-label);
  font-family: var(--font-family);
  color: var(--color-primary);
  appearance: none;
  outline: none;
  cursor: pointer;
}

.field-select:invalid {
  color: var(--color-text-secondary);
}

.chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  pointer-events: none;
}

.field.is-disabled .field-box {
  opacity: 0.5;
}

.field.is-disabled .field-select {
  cursor: not-allowed;
}
</style>
