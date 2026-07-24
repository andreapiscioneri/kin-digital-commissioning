<script setup lang="ts">
import type { ProjectCategory, ProjectSyncStatus } from '~/composables/useProjectsStore'

defineProps<{ category: ProjectCategory; syncStatus: ProjectSyncStatus }>()
</script>

<template>
  <span class="project-icon">
    <IconBadge :size="40">
      <svg v-if="category === 'Office'" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4" /><path d="M7 6V4.5A1.5 1.5 0 018.5 3h3A1.5 1.5 0 0113 4.5V6" stroke="currentColor" stroke-width="1.4" /><path d="M2 10.5h16" stroke="currentColor" stroke-width="1.4" /></svg>
      <svg v-else-if="category === 'Industry'" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 17V9l4 3V9l4 3V9l4 3V4l4 3v10H2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
      <svg v-else-if="category === 'Sport indoor'" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.4" /><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.4" /></svg>
      <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 7h12l-1 10H5L4 7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><path d="M7 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.4" /></svg>
    </IconBadge>
    <span v-if="syncStatus === 'not-synced'" class="badge badge-sync" aria-label="Non sincronizzato">
      <svg width="10" height="8" viewBox="0 0 14 10" fill="none"><path d="M4 9a3 3 0 01-1-5.83A4 4 0 0110.9 3.5 3 3 0 0110 9H4z" stroke="currentColor" stroke-width="1.2" /></svg>
    </span>
    <span v-else-if="syncStatus === 'error'" class="badge badge-error" aria-label="Errore di sincronizzazione">
      <svg width="10" height="9" viewBox="0 0 12 10" fill="none"><path d="M6 1L1 9h10L6 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" /><path d="M6 4.5v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" /></svg>
    </span>
  </span>
</template>

<style scoped>
.project-icon {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-sync {
  color: var(--color-text-secondary);
}

.badge-error {
  color: var(--color-warning);
}
</style>
