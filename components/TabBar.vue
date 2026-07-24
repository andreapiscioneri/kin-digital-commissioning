<script setup lang="ts">
defineProps<{ modelValue: string; tabs: { value: string; label: string }[] }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="tab"
      :class="{ active: modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  gap: 20px;
  padding: 0 var(--space-page-x) 12px;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  padding: 0 0 10px;
  cursor: pointer;
}

.tab.active {
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: inset 0 -2px 0 var(--color-primary);
}
</style>
