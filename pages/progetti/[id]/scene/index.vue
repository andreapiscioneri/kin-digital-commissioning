<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { scenes } = useScenesStore(projectId)
const { goBack, goForward } = useNavStack()
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Scene" leading="back" trailing="none" @back="goBack(`/progetti/${projectId}`)" />

    <div class="body">
      <p class="section-caption">Elenco scene</p>
      <ListItem
        v-for="scene in scenes"
        :key="scene.id"
        :title="scene.name"
        :subtitle-strong="String(scene.deviceIds.length)"
        subtitle="dispositivi"
        editable
        @edit="goForward(`/progetti/${projectId}/scene/${scene.id}`)"
      >
        <template #icon>
          <IconBadge :size="32"><SceneIcon :icon="scene.icon" /></IconBadge>
        </template>
      </ListItem>

      <Button variant="secondary" @click="goForward(`/progetti/${projectId}/scene/nuova`)">+ Nuova scena</Button>
    </div>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px var(--space-page-x);
}

.section-caption {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}
</style>
