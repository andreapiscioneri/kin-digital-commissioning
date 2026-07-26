<script setup lang="ts">
import type { ProvisionedDevice } from '~/composables/useDeviceCatalog'

const route = useRoute()
const projectId = route.params.id as string
const groupId = route.params.groupId as string
const { getGroup, updateGroup } = useGroupsStore(projectId)
const { provisionedDevices } = useDeviceCatalog(projectId)
const { goBack, goBackTo } = useNavStack()

const group = getGroup(groupId)

const profile = ref(group?.profile || 'SE-66AA')
const mode = ref(group?.mode || 'gruppo')
const sensorMaster = ref(group?.sensorMaster || 'SE-66AA')
const overrideTime = ref(group?.overrideTime || '10 min')
const minBrightness = ref(group?.minBrightness ?? 20)
const mode2 = ref(group?.mode || 'gruppo')
const sensorMaster2 = ref(group?.sensorMaster || 'SE-66AA')
const overrideTime2 = ref(group?.overrideTime || '10 min')

const deviceCount = computed(() => group?.deviceIds.length || 0)
const primaryDeviceType = computed(() => {
  if (!group) return 'Lampada'
  const first = provisionedDevices.value.find((d: ProvisionedDevice) => d.id === group.deviceIds[0])
  return first?.type || 'Lampada'
})

function save() {
  updateGroup(groupId, { profile: profile.value, mode: mode.value, sensorMaster: sensorMaster.value, minBrightness: minBrightness.value, overrideTime: overrideTime.value })
  goBackTo(`/progetti/${projectId}?tab=gruppi`)
}
</script>

<template>
  <div class="screen">
    <template v-if="group">
    <StatusBar />
    <AppHeader :title="group.name" leading="back" trailing="none" @back="goBack(`/progetti/${projectId}`)" />

    <div class="body">
      <SectionHeader title="Informazioni gruppo" />
      <div class="field-block">
        <p class="field-label">Nome gruppo</p>
        <p class="field-value">{{ group.name }}</p>
      </div>

      <p class="field-label">Dispositivi assegnati</p>
      <ListItem :title="`${primaryDeviceType === 'Lampada' ? 'Lampade' : primaryDeviceType === 'Sensore' ? 'Sensori' : 'Pulsantiere'} (${deviceCount})`" clickable>
        <template #icon>
          <IconBadge :size="32">
            <svg v-if="primaryDeviceType === 'Lampada'" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="5" stroke="currentColor" stroke-width="1.3" /><path d="M8 15h4M8.5 17h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
            <svg v-else-if="primaryDeviceType === 'Sensore'" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" /><circle cx="10" cy="10" r="2.4" fill="currentColor" /></svg>
            <svg v-else width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="6" y="2" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.3" /><path d="M8 6h4M8 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
          </IconBadge>
        </template>
      </ListItem>

      <SectionHeader title="Funzioni gruppo" />
      <SelectField v-model="profile" label="Profilo predefinito" :options="[{ value: 'SE-66AA', label: 'SE-66AA' }]" />
      <div class="field-block">
        <p class="field-title">Modalità di funzionamento</p>
        <SegmentedControl v-model="mode" :options="[{ value: 'gruppo', label: 'Gruppo' }, { value: 'standalone', label: 'Stand-alone' }]" />
      </div>
      <SelectField v-model="sensorMaster" label="Sensore master (Daylight)" :options="[{ value: 'SE-66AA', label: 'SE-66AA' }]" />

      <SectionHeader title="Automatic sensor mode" />
      <LinkRow title="Occupancy" caption="Accende automaticamente alla presenza, spegne automaticamente in assenza" />
      <LinkRow title="Vacancy" caption="Accensione manuale richiesta, ma spegne automaticamente in assenza" />
      <LinkRow title="Corridor" caption="In assenza riduce la luce a un livello minimo, poi spegne del tutto dopo un secondo timeout" :divider="false" />

      <div class="field-block">
        <p class="field-title">Controllo manuale (Override)</p>
        <Button variant="secondary">{{ overrideTime }}</Button>
      </div>

      <SectionHeader title="Controllo manuale" />
      <SliderField v-model="minBrightness" label="Luminosità minima" />
      <div class="field-block">
        <p class="field-title">Modalità di funzionamento</p>
        <SegmentedControl v-model="mode2" :options="[{ value: 'gruppo', label: 'Gruppo' }, { value: 'standalone', label: 'Stand-alone' }]" />
      </div>
      <SelectField v-model="sensorMaster2" label="Sensore master (Daylight)" :options="[{ value: 'SE-66AA', label: 'SE-66AA' }]" />
      <div class="field-block">
        <p class="field-title">Controllo manuale (Override)</p>
        <Button variant="secondary">{{ overrideTime2 }}</Button>
      </div>

      <LinkRow title="Scene" caption="Gestisci le scene associate al gruppo" />
      <SectionHeader title="Parametri avanzati" :divider="false">
        <template #action>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
        </template>
      </SectionHeader>
    </div>

    <div class="footer">
      <Button variant="primary" @click="save">Salva</Button>
    </div>
    </template>
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

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.field-value {
  margin: 0;
  font-size: var(--font-size-label);
  color: var(--color-primary);
}

.field-title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-primary);
}

.footer {
  padding: 16px var(--space-page-x) 24px;
}
</style>
