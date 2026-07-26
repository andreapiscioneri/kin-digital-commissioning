<script setup lang="ts">
import type { Project } from '~/composables/useProjectsStore'

defineProps<{ project: Project }>()
defineEmits<{ open: []; menu: [] }>()
</script>

<template>
  <div class="project-card" @click="$emit('open')">
    <div class="project-card-head">
      <ProjectIcon :category="project.category" :sync-status="project.syncStatus" />
      <span class="project-name">{{ project.name }}</span>
      <button type="button" class="menu-btn" aria-label="Altre azioni" @click.stop="$emit('menu')">
        <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor"><circle cx="2" cy="2" r="2" /><circle cx="2" cy="8" r="2" /><circle cx="2" cy="14" r="2" /></svg>
      </button>
    </div>

    <div class="project-address">
      <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true"><path d="M6 13S1 8.4 1 5a5 5 0 0110 0c0 3.4-5 8-5 8z" stroke="currentColor" stroke-width="1.2" /><circle cx="6" cy="5" r="1.6" stroke="currentColor" stroke-width="1.2" /></svg>
      <span>{{ project.address }}<br />{{ project.city }}</span>
    </div>

    <p v-if="project.connectionStatus === 'none'" class="project-sync">Ultima sincronizzazione: {{ project.lastSync }}</p>
    <p v-else class="project-status">
      Stato:
      <span class="status-dot" :class="project.connectionStatus" />
      {{ project.connectionStatus === 'online' ? 'Online' : `${project.faultCount} Fault` }}
    </p>

    <p class="project-meta">Livelli: {{ project.levels }} &nbsp; Dispositivi: <strong>{{ project.devices }}</strong></p>
  </div>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
  cursor: pointer;
}

.project-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-name {
  flex: 1;
  font-size: var(--font-size-label);
  font-weight: 700;
  color: var(--color-primary);
}

.menu-btn {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
}

.project-address {
  display: flex;
  gap: 6px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.project-address svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.project-sync,
.project-status,
.project-meta {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.project-meta strong {
  color: var(--color-primary);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 2px;
}

.status-dot.online {
  background: var(--color-success);
}

.status-dot.fault {
  background: var(--color-error);
}
</style>
