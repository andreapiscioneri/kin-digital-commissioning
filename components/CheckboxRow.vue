<script setup lang="ts">
withDefaults(defineProps<{ label: string; modelValue: boolean }>(), {})
defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <label class="checkbox-row">
    <span v-if="$slots.icon" class="checkbox-row-icon"><slot name="icon" /></span>
    <span class="checkbox-row-label">{{ label }}</span>
    <input
      type="checkbox"
      class="checkbox-row-native"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="checkbox-row-mark" :class="{ checked: modelValue }" aria-hidden="true">
      <svg v-if="modelValue" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
  </label>
</template>

<style scoped>
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  cursor: pointer;
}

.checkbox-row-icon {
  flex-shrink: 0;
  display: flex;
}

.checkbox-row-label {
  flex: 1;
  font-size: var(--font-size-body);
  color: var(--color-primary);
}

.checkbox-row-native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-row-mark {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-checkbox);
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
}

.checkbox-row-mark.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
