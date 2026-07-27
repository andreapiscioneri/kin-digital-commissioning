<script setup lang="ts">
import type { DeviceType } from '~/composables/useDeviceCatalog'

withDefaults(
  defineProps<{
    code: string
    type: DeviceType
    rssi?: number
    selected?: boolean
    showSettings?: boolean
  }>(),
  { rssi: undefined, selected: false, showSettings: true }
)

defineEmits<{ toggle: []; settings: [] }>()

const lightOn = ref(false)
</script>

<template>
  <div class="device-row" @click="$emit('toggle')">
    <span class="mark checkbox" :class="{ checked: selected }" aria-hidden="true">
      <svg v-if="selected" width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="var(--color-surface)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>

    <IconBadge :size="32">
      <svg v-if="type === 'Lampada'" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="5" stroke="currentColor" stroke-width="1.3" /><path d="M8 15h4M8.5 17h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
      <svg v-else-if="type === 'Sensore'" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" /><circle cx="10" cy="10" r="2.4" fill="currentColor" /></svg>
      <svg v-else width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
    </IconBadge>

    <span class="device-text">
      <span class="device-code">{{ code }}</span>
      <span v-if="rssi !== undefined" class="device-rssi">
        <svg width="12" height="10" viewBox="0 0 14 10" fill="none"><rect x="0" y="6" width="2.5" height="4" rx="0.5" fill="currentColor" /><rect x="4" y="4" width="2.5" height="6" rx="0.5" fill="currentColor" /><rect x="8" y="2" width="2.5" height="8" rx="0.5" fill="currentColor" /><rect x="11.5" y="0" width="2.5" height="10" rx="0.5" fill="currentColor" opacity="0.3" /></svg>
        {{ rssi }} dBm
      </span>
    </span>

    <button v-if="showSettings" type="button" class="settings-btn" :class="{ active: lightOn }" aria-label="Impostazioni" @click.stop="lightOn = !lightOn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" /><circle cx="12" cy="3" r="1" fill="currentColor" /><circle cx="21" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="21" r="1" fill="currentColor" /><circle cx="3" cy="12" r="1" fill="currentColor" /><circle cx="18" cy="6" r="0.8" fill="currentColor" /><circle cx="18" cy="18" r="0.8" fill="currentColor" /><circle cx="6" cy="18" r="0.8" fill="currentColor" /><circle cx="6" cy="6" r="0.8" fill="currentColor" /></svg>
    </button>
  </div>
</template>

<style scoped>
.device-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.mark.checkbox {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-checkbox);
  border: 1.5px solid #db3700 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  flex-shrink: 0;
}

.mark.checkbox.checked {
  background: #db3700 !important;
  border-color: #db3700 !important;
}

.device-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-code {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.device-rssi {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.settings-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s ease;
}

.settings-btn.active {
  color: #FDB813;
}
</style>
