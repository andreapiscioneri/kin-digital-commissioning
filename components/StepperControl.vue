<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    variant?: 'card' | 'inline'
  }>(),
  { min: 0, max: 99, variant: 'card' }
)

const emit = defineEmits<{ 'update:modelValue': [number] }>()

function dec() {
  if (props.modelValue > props.min) emit('update:modelValue', props.modelValue - 1)
}

function inc() {
  if (props.modelValue < props.max) emit('update:modelValue', props.modelValue + 1)
}
</script>

<template>
  <div class="stepper" :class="variant">
    <button type="button" class="stepper-btn minus" :disabled="modelValue <= min" aria-label="Diminuisci" @click="dec">
      <svg width="14" height="2" viewBox="0 0 14 2" fill="none"><path d="M1 1h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
    </button>
    <span class="stepper-value">{{ modelValue }}</span>
    <button type="button" class="stepper-btn plus" :disabled="modelValue >= max" aria-label="Aumenta" @click="inc">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
    </button>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.stepper.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 20px;
}

.stepper.inline {
  justify-content: flex-end;
  gap: 12px;
}

.stepper-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-primary);
  min-width: 20px;
  text-align: center;
}

.stepper.inline .stepper-value {
  font-size: var(--font-size-body);
  font-weight: 500;
}

.stepper-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.stepper.inline .stepper-btn {
  width: 28px;
  height: 28px;
}

.stepper-btn.minus {
  background: #eef0f2;
  color: var(--color-primary);
}

.stepper-btn.plus {
  background: var(--color-primary);
  color: #ffffff;
}

.stepper-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
