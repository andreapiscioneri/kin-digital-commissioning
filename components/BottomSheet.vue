<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: boolean; title?: string }>(), { title: '' })
const emit = defineEmits<{ 'update:modelValue': [boolean]; close: [] }>()

const dragY = ref(0)
const dragging = ref(false)
let startY = 0

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true
  startY = e.clientY
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const delta = e.clientY - startY
  dragY.value = Math.max(0, delta)
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  if (dragY.value > 90) close()
  dragY.value = 0
}
</script>

<template>
  <Transition name="sheet-overlay">
    <div v-if="modelValue" class="sheet-overlay" @mousedown.self="close">
      <Transition name="sheet-panel" appear>
        <div
          v-if="modelValue"
          class="sheet-panel"
          :style="{ transform: `translateY(${dragY}px)`, transition: dragging ? 'none' : undefined }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div
            class="sheet-handle-area"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          >
            <span class="sheet-handle" />
          </div>
          <p v-if="title" class="sheet-title">{{ title }}</p>
          <div class="sheet-body">
            <slot />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.sheet-overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay-scrim);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.sheet-panel {
  width: 100%;
  max-width: var(--screen-max-width);
  max-height: 85vh;
  background: var(--color-surface);
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-menu);
  touch-action: none;
}

.sheet-handle-area {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  cursor: grab;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
}

.sheet-title {
  margin: 0 20px 12px;
  font-size: var(--font-size-label);
  font-weight: 600;
  color: var(--color-primary);
}

.sheet-body {
  overflow-y: auto;
  padding: 0 20px 20px;
}

.sheet-overlay-enter-active,
.sheet-overlay-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.sheet-overlay-enter-from,
.sheet-overlay-leave-to {
  opacity: 0;
}

.sheet-panel-enter-active {
  transition: transform var(--duration-slow) var(--ease-standard);
}

.sheet-panel-leave-active {
  transition: transform var(--duration-base) var(--ease-standard);
}

.sheet-panel-enter-from,
.sheet-panel-leave-to {
  transform: translateY(100%);
}
</style>
