<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    type?: 'text' | 'email' | 'tel' | 'number'
    required?: boolean
    error?: string
    disabled?: boolean
    readonly?: boolean
    variant?: 'underline' | 'boxed'
  }>(),
  { label: '', placeholder: '', type: 'text', required: false, error: '', disabled: false, readonly: false, variant: 'underline' }
)

const emit = defineEmits<{
  'update:modelValue': [string]
  blur: [FocusEvent]
  focus: [FocusEvent]
}>()

const focused = ref(false)
const inputId = useId()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="field" :class="[variant, { 'is-error': !!error, 'is-disabled': disabled, 'is-focused': focused }]">
    <label v-if="label" :for="inputId" class="field-label">{{ label }}<span v-if="required" class="required">*</span></label>
    <input
      :id="inputId"
      class="field-input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="onInput"
      @focus="(e) => { focused = true; $emit('focus', e) }"
      @blur="(e) => { focused = false; $emit('blur', e) }"
    />
    <p v-if="error" class="field-error">{{ error }}</p>
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

.required {
  color: var(--color-error);
  margin-left: 2px;
}

.field-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  padding: 4px 0 8px;
  font-size: var(--font-size-label);
  font-family: var(--font-family);
  color: var(--color-primary);
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-standard);
}

.field-input::placeholder {
  color: var(--color-text-secondary);
}

.field.is-focused .field-input {
  border-bottom-color: var(--color-border-focus);
  border-bottom-width: 2px;
  padding-bottom: 7px;
}

.field.is-error .field-input {
  border-bottom-color: var(--color-error);
}

.field.is-disabled .field-input {
  opacity: 0.5;
  cursor: not-allowed;
}

.field.boxed .field-input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 13px 14px;
}

.field.boxed.is-focused .field-input {
  border-color: var(--color-border-focus);
  border-width: 1px;
  padding: 13px 14px;
}

.field.boxed.is-error .field-input {
  border-color: var(--color-error);
}

.field-error {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-error);
}
</style>
