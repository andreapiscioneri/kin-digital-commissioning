<script setup lang="ts">
import { useHomeStore } from '~/composables/useHomeStore'

const { property, widgets, scenes, zones, deviceCategories, toggleRoomDevice, toggleAllInCategory, roomDevicesOnCount } = useHomeStore()
const { goForward } = useNavStack()

const menuOpen = ref(false)
const mainTab = ref<'zone' | 'dispositivi'>('zone')
const activeZoneId = ref(zones.value[0].id)
const expandedWidgetId = ref<string | null>(null)
const expandedRoomId = ref<string | null>(null)

const mainTabs = [
  { value: 'zone', label: 'Zone' },
  { value: 'dispositivi', label: 'Dispositivi' }
]

const zoneTabs = computed(() => zones.value.map((z) => ({ value: z.id, label: z.name })))
const activeZone = computed(() => zones.value.find((z) => z.id === activeZoneId.value) ?? zones.value[0])

function toggleWidget(id: string) {
  expandedWidgetId.value = expandedWidgetId.value === id ? null : id
}

function toggleRoom(id: string) {
  expandedRoomId.value = expandedRoomId.value === id ? null : id
}

function openCategory(id: string) {
  goForward(`/casa/dispositivi/${id}`)
}
</script>

<template>
  <div class="screen">
    <StatusBar />

    <header class="home-header">
      <img :src="property.photo" alt="" class="home-photo" />
      <div class="home-text">
        <p class="home-greeting">Buongiorno {{ property.ownerName }}</p>
        <p class="home-title">{{ property.name }}</p>
      </div>
      <IconButton ariaLabel="Menu" @click="menuOpen = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
      </IconButton>
    </header>

    <div class="body">
      <section class="section">
        <SectionHeader title="Widget" :divider="false" />
        <div class="widget-row">
          <WidgetCard
            v-for="w in widgets"
            :key="w.id"
            :widget="w"
            :expanded="expandedWidgetId === w.id"
            @click="toggleWidget(w.id)"
          />
        </div>
      </section>

      <section class="section">
        <SectionHeader title="Scenari" :divider="false" />
        <div class="scene-row">
          <SceneChip v-for="s in scenes" :key="s.id" :label="s.label" :icon="s.icon" :color="s.color" />
        </div>
      </section>

      <TabBar v-model="mainTab" :tabs="mainTabs" />

      <template v-if="mainTab === 'zone'">
        <div class="zone-tabs">
          <TabBar v-model="activeZoneId" :tabs="zoneTabs" />
        </div>
        <div class="room-list">
          <RoomRow
            v-for="room in activeZone.rooms"
            :key="room.id"
            :room="room"
            :expanded="expandedRoomId === room.id"
            :devices-on="roomDevicesOnCount(room)"
            @toggle-expand="toggleRoom(room.id)"
            @toggle-device="(deviceId) => toggleRoomDevice(room.id, deviceId)"
          />
        </div>
      </template>

      <template v-else>
        <div class="category-grid">
          <DeviceCategoryCard
            v-for="c in deviceCategories"
            :key="c.id"
            :category="c"
            @open="openCategory(c.id)"
            @toggle-all="(on) => toggleAllInCategory(c.id, on)"
          />
        </div>
      </template>
    </div>

    <CasaSideMenu v-model="menuOpen" />
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.home-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px var(--space-page-x) 16px;
  background: var(--color-surface);
}

.home-photo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.home-text {
  flex: 1;
  min-width: 0;
}

.home-greeting {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.home-title {
  margin: 2px 0 0;
  font-size: var(--font-size-display);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: var(--line-height-tight);
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 24px;
}

.section {
  padding: 8px var(--space-page-x) 4px;
}

.widget-row,
.scene-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.zone-tabs :deep(.tab-bar) {
  padding-top: 12px;
  border-bottom: none;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px var(--space-page-x) 8px;
  background: var(--color-surface-alt);
}

.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px var(--space-page-x);
}
</style>
