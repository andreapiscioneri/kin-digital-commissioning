<script setup lang="ts">
import type { Project } from '~/composables/useProjectsStore'

const props = defineProps<{ project: Project }>()
defineEmits<{ open: []; menu: [] }>()

const { collaborators } = useCollaboratorsStore(props.project.id)

function collaboratorInitial(email: string) {
  const initial = email.trim().charAt(0)
  return initial ? initial.toUpperCase() : '?'
}
</script>

<template>
  <div class="project-card" @click="$emit('open')">
    <div class="project-thumb-wrap">
      <img :src="project.image" alt="" class="project-thumb" />
      <span v-if="project.connectionStatus === 'fault'" class="status-badge fault" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 2L1 18h18L10 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /><path d="M10 8v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /><circle cx="10" cy="15" r="0.8" fill="currentColor" /></svg>
      </span>
      <span v-else class="status-badge" :class="{ online: project.connectionStatus === 'online' }" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M5.5 15a3.5 3.5 0 01-.5-6.96A4.5 4.5 0 0113.9 6.6 3.5 3.5 0 0114 13H5.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
      </span>
    </div>

    <div class="project-content">
      <div class="project-card-head">
        <span class="project-name">{{ project.name }}</span>
        <button type="button" class="menu-btn" aria-label="Altre azioni" @click.stop="$emit('menu')">
          <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor"><circle cx="2" cy="2" r="2" /><circle cx="2" cy="8" r="2" /><circle cx="2" cy="14" r="2" /></svg>
        </button>
      </div>

      <div class="project-city">{{ project.city }}</div>

      <div class="project-meta-row">
        <span class="meta-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9l3-3h12l3 3v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
          <strong>{{ project.levels }}</strong> piani
        </span>
        <span class="meta-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3" /><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.3" /></svg>
          <strong>{{ project.devices }}</strong> dispositivi
        </span>
      </div>

      <div class="project-status" :class="{ 'not-synced': project.lastSync === 'Non sincronizzato' }">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4" :fill="project.lastSync === 'Non sincronizzato' ? '#999' : 'var(--color-success)'" /></svg>
        <span>{{ project.lastSync === 'Non sincronizzato' ? 'Non sincronizzato' : 'Sincronizzato il ' + project.lastSync }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  border: none;
  border-radius: 18px;
  box-shadow: 0 2px 10px -4px rgba(17, 17, 17, 0.1), 0 10px 24px -12px rgba(17, 17, 17, 0.14);
  background: var(--color-surface);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.project-card:active {
  transform: scale(0.98);
}

.project-thumb-wrap {
  position: relative;
  flex-shrink: 0;
  width: 100%;
}

.project-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 18px 18px 0 0;
  display: block;
  filter: grayscale(0.6) contrast(1.12) saturate(1.25);
}

.status-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  color: rgba(17, 17, 17, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge.online {
  color: var(--color-success);
}

.status-badge.fault {
  color: var(--color-error);
}

.project-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px 14px;
}

.project-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.project-name {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-primary);
  line-height: 1.2;
}

.card-avatar-stack {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.card-avatar-mini {
  position: relative;
  z-index: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(17, 17, 17, 0.35);
  cursor: default;
}

.card-avatar-mini:not(:first-child) {
  margin-left: -6px;
}

.card-avatar-mini.is-active {
  z-index: 1;
  background: var(--color-accent);
  color: #fff;
}

.menu-btn {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 3px;
  flex-shrink: 0;
}

.project-city {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.3;
  margin-bottom: 2px;
}

.project-meta-row {
  display: flex;
  gap: 8px;
  margin-bottom: 3px;
}

.meta-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  font-size: 12px;
  color: var(--color-accent);
}

.meta-pill svg {
  color: var(--color-accent);
  flex-shrink: 0;
}

.meta-pill strong {
  color: var(--color-accent);
  font-weight: 700;
}

.project-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-success);
  margin-bottom: 2px;
}

.project-status.not-synced {
  color: #999;
}


</style>
