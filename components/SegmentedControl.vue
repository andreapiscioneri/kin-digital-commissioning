<script setup lang="ts">
defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="segmented" role="tablist">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="tab"
      class="segment"
      :class="{ active: modelValue === opt.value }"
      :aria-selected="modelValue === opt.value"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: flex;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  overflow: hidden;
}

.segment {
  flex: 1;
  height: 48px;
  border: none;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}

.segment:last-child {
  border-right: none;
}

.segment.active {
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 500;
}
</style>
