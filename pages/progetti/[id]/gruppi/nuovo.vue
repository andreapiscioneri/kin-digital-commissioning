<script setup lang="ts">
import type { DeviceType, ProvisionedDevice } from '~/composables/useDeviceCatalog'

const route = useRoute()
const projectId = route.params.id as string
const { provisionedDevices } = useDeviceCatalog(projectId)
const { createGroup } = useGroupsStore(projectId)
const { goBack, goClose } = useNavStack()

const name = ref('')
const nameTouched = ref(false)
const nameError = computed(() => (nameTouched.value && !name.value.trim() ? 'Campo obbligatorio' : ''))
const expandedType = ref<DeviceType | null>(null)
const selectedDeviceIds = ref<Set<string>>(new Set())

const deviceTypes: DeviceType[] = ['Lampada', 'Sensore', 'Pulsantiera']

function devicesOfType(type: DeviceType) {
  return provisionedDevices.value.filter((d: ProvisionedDevice) => d.type === type)
}

function selectedCount(type: DeviceType) {
  return devicesOfType(type).filter((d: ProvisionedDevice) => selectedDeviceIds.value.has(d.id)).length
}

function toggleExpand(type: DeviceType) {
  expandedType.value = expandedType.value === type ? null : type
}

function toggleDevice(id: string) {
  const next = new Set(selectedDeviceIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedDeviceIds.value = next
}

const canContinue = computed(() => !!name.value.trim() && selectedDeviceIds.value.size > 0)

function onContinue() {
  if (!canContinue.value) return
  const group = createGroup(name.value, Array.from(selectedDeviceIds.value))
  goClose(`/progetti/${projectId}/gruppi/${group.id}`)
}
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Nuovo gruppo" leading="back" trailing="close" @back="goBack(`/progetti/${projectId}`)" @close="goClose(`/progetti/${projectId}`)" />

    <div class="body">
      <TextField v-model="name" label="Nome gruppo" required placeholder="Inserisci nome gruppo" :error="nameError" @blur="nameTouched = true" />
      <p class="hint">Selezionare i dispositivi in base alle zone oppure per tipologia.</p>

      <div class="type-list">
        <div v-for="type in deviceTypes" :key="type" class="type-block">
          <SelectableRow
            :label="`${type === 'Lampada' ? 'Lampade' : type === 'Sensore' ? 'Sensori' : 'Pulsantiere'} (${selectedCount(type)}/${devicesOfType(type).length})`"
            select-type="radio"
            :selected="expandedType === type"
            expandable
            :expanded="expandedType === type"
            :disabled="devicesOfType(type).length === 0"
            @click="toggleExpand(type)"
            @toggle-expand="toggleExpand(type)"
          >
            <template #icon>
              <IconBadge :size="32">
                <svg v-if="type === 'Lampada'" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="5" stroke="currentColor" stroke-width="1.3" /><path d="M8 15h4M8.5 17h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
                <svg v-else-if="type === 'Sensore'" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" /><circle cx="10" cy="10" r="2.4" fill="currentColor" /></svg>
                <svg v-else width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
              </IconBadge>
            </template>
          </SelectableRow>

          <div v-if="expandedType === type" class="device-checklist">
            <DeviceRow
              v-for="d in devicesOfType(type)"
              :key="d.id"
              :code="d.name"
              :type="d.type"
              :selected="selectedDeviceIds.has(d.id)"
              :show-settings="false"
              @toggle="toggleDevice(d.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <Button variant="primary" :disabled="!canContinue" @click="onContinue">Continua</Button>
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
  gap: 16px;
  padding: 20px var(--space-page-x);
}

.hint {
  margin: -8px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-checklist {
  padding: 0 4px;
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}
</style>
