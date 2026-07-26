<script setup lang="ts">
import type { Room } from '~/composables/useHomeStore'

const props = defineProps<{ room: Room; expanded?: boolean; devicesOn: number }>()
defineEmits<{ toggleExpand: []; toggleDevice: [string] }>()

const anyOn = computed(() => props.devicesOn > 0)
</script>

<template>
  <div class="room-row-wrap">
    <button type="button" class="room-row" @click="$emit('toggleExpand')">
      <img :src="room.image" alt="" class="room-thumb" />

      <span class="room-text">
        <span class="room-meta">
          <span v-if="room.temp" class="room-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 14.5V5a2 2 0 10-4 0v9.5a4 4 0 104 0z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
            {{ room.temp }}
          </span>
          <span v-if="room.humidity" class="room-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
            {{ room.humidity }}
          </span>
          <span v-if="room.music" class="room-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 18V5l11-2v13M9 18a3 3 0 11-3-3 3 3 0 013 3zM20 16a3 3 0 11-3-3 3 3 0 013 3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
          </span>
        </span>
        <span class="room-name">{{ room.name }}</span>
        <span class="room-status" :class="{ on: anyOn }">
          {{ devicesOn }} dispositivi {{ anyOn ? 'accesi' : 'spenti' }}
        </span>
      </span>

      <span class="room-bulb" :class="{ on: anyOn }" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.4 1 1.1 1 1.9v.2h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0012 3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
      </span>
      <svg class="room-chevron" :class="{ expanded }" width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 2.5l6 5 6-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>

    <div v-if="expanded" class="room-devices">
      <div v-for="d in room.devices" :key="d.id" class="room-device">
        <span class="room-device-icon">
          <svg v-if="d.icon === 'ceiling'" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16L12 3 4 6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M12 6v4M8 21l4-11 4 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <svg v-else-if="d.icon === 'lamp'" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 4h8l3 7H5l3-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /><path d="M12 11v7M9 21h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          <svg v-else-if="d.icon === 'tv'" width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M9 21h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        </span>
        <span class="room-device-name">{{ d.name }}</span>
        <ToggleSwitch :model-value="d.on" :aria-label="d.name" @update:model-value="$emit('toggleDevice', d.id)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-row-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.room-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.room-thumb {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.room-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.room-meta-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

.room-name {
  font-size: var(--font-size-body);
  font-weight: 700;
  color: var(--color-primary);
}

.room-status {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.room-status.on {
  color: var(--color-accent);
  font-weight: 600;
}

.room-bulb {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
}

.room-bulb.on {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.room-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.room-chevron.expanded {
  transform: rotate(180deg);
}

.room-devices {
  padding: 0 14px 12px 78px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-device {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room-device-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-device-name {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-small);
  color: var(--color-primary);
}
</style>
