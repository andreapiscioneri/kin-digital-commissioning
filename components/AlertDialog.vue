<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    closable?: boolean
  }>(),
  { description: '', closable: true }
)
defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <ModalDialog :model-value="modelValue" :closable="closable" @update:model-value="$emit('update:modelValue', $event)">
    <div v-if="$slots.icon" class="alert-icon"><slot name="icon" /></div>
    <p class="alert-title"><slot name="title">{{ title }}</slot></p>
    <p v-if="description" class="alert-description">{{ description }}</p>
    <div class="alert-actions"><slot /></div>
  </ModalDialog>
</template>

<style scoped>
.alert-icon {
  color: var(--color-primary);
  margin-bottom: 4px;
}

.alert-title {
  margin: 0;
  font-size: var(--font-size-label);
  font-weight: 600;
  color: var(--color-primary);
}

.alert-description {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.alert-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
</style>
