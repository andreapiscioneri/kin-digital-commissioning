<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number
    label?: string
    min?: number
    max?: number
    step?: number
    unit?: string
  }>(),
  { label: '', min: 0, max: 100, step: 1, unit: '%' }
)

const emit = defineEmits<{ 'update:modelValue': [number] }>()

const percent = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)

function onInput(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="slider-field">
    <p v-if="label" class="slider-label">{{ label }}</p>
    <input
      class="slider-input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :style="{ '--fill': percent + '%' }"
      @input="onInput"
    />
    <p class="slider-value">{{ modelValue }}{{ unit }}</p>
  </div>
</template>

<style scoped>
.slider-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.slider-label {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.slider-value {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.slider-input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 20px;
  background: transparent;
  cursor: pointer;
}

.slider-input::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, var(--color-primary) var(--fill), var(--color-border) var(--fill));
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
}

.slider-input::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
}

.slider-input::-moz-range-progress {
  height: 4px;
  border-radius: 2px;
  background: var(--color-primary);
}

.slider-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
}
</style>
