<script setup lang="ts">
withDefaults(defineProps<{ inverted?: boolean }>(), { inverted: false })
</script>

<template>
  <div class="status-bar" :class="{ inverted }">
    <span class="status-time">9:41</span>
    <span class="status-icons" aria-hidden="true">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="0.5" /><rect x="4.5" y="4" width="3" height="7" rx="0.5" /><rect x="9" y="2" width="3" height="9" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></svg>
      <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M1 4a10 8 0 0113 0M4 7a5.5 4.5 0 017 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="7.5" cy="9.5" r="1" fill="currentColor" /></svg>
      <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" /><rect x="2" y="2" width="17" height="7" rx="1.2" fill="currentColor" /><rect x="21.5" y="3.5" width="1.6" height="4" rx="0.8" fill="currentColor" /></svg>
    </span>
  </div>
</template>

<style scoped>
.status-bar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-bar.inverted {
  color: #ffffff;
}
</style>
