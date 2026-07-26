<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: boolean; closable?: boolean }>(), { closable: true })
const emit = defineEmits<{ 'update:modelValue': [boolean]; close: [] }>()

function close() {
  if (!props.closable) return
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <Transition name="modal-overlay">
    <div v-if="modelValue" class="modal-overlay" @mousedown.self="close">
      <Transition name="modal-card" appear>
        <div v-if="modelValue" class="modal-card" role="dialog" aria-modal="true">
          <slot />
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay-scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal-card {
  width: 100%;
  max-width: 330px;
  max-height: 80vh;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  overflow-y: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  box-shadow: var(--shadow-frame);
}

.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-card-enter-active {
  transition: transform var(--duration-base) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
}

.modal-card-leave-active {
  transition: transform var(--duration-fast) var(--ease-standard),
    opacity var(--duration-fast) var(--ease-standard);
}

.modal-card-enter-from,
.modal-card-leave-to {
  transform: scale(0.94) translateY(8px);
  opacity: 0;
}
</style>
