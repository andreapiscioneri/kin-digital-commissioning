<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    closable?: boolean
    system?: boolean
    rowActions?: boolean
  }>(),
  { description: '', closable: true, system: false, rowActions: false }
)
defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <ModalDialog
    :model-value="modelValue"
    :closable="closable"
    :system="system"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-if="system">
      <div class="ios-alert-body">
        <p class="ios-alert-title"><slot name="title">{{ title }}</slot></p>
        <p v-if="description" class="ios-alert-description">{{ description }}</p>
      </div>
      <div class="ios-alert-actions" :class="{ row: rowActions }">
        <slot />
      </div>
    </template>
    <template v-else>
      <div v-if="$slots.icon" class="alert-icon"><slot name="icon" /></div>
      <p class="alert-title"><slot name="title">{{ title }}</slot></p>
      <p v-if="description" class="alert-description">{{ description }}</p>
      <div class="alert-actions"><slot /></div>
    </template>
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

.ios-alert-body {
  width: 100%;
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.ios-alert-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-primary);
}

.ios-alert-description {
  margin: 0;
  font-size: 13px;
  line-height: 1.35;
  color: var(--color-text-secondary);
}

.ios-alert-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
}

.ios-alert-actions.row {
  flex-direction: row;
}

.ios-alert-actions :deep(.btn) {
  flex: 1;
}

.ios-alert-actions:not(.row) :deep(.btn) + :deep(.btn) {
  border-top: 1px solid var(--color-border);
}

.ios-alert-actions.row :deep(.btn) + :deep(.btn) {
  border-left: 1px solid var(--color-border);
}
</style>
