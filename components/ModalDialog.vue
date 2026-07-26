<script setup lang="ts">
const props = withDefaults(
  defineProps<{ modelValue: boolean; closable?: boolean; system?: boolean }>(),
  { closable: true, system: false }
)
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
        <div v-if="modelValue" class="modal-card" :class="{ 'modal-card--system': system }" role="dialog" aria-modal="true">
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

.modal-card--system {
  max-width: 270px;
  padding: 0;
  gap: 0;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(247, 247, 248, 0.82);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

.dark-mode .modal-card--system {
  background: rgba(40, 40, 42, 0.78);
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
