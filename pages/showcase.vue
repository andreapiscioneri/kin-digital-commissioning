<script setup lang="ts">
const text = ref('')
const select = ref('')
const segment = ref('gruppo')
const slider = ref(20)
const radioSel = ref(false)
const checkSel = ref(true)
const sheetOpen = ref(false)
const modalOpen = ref(false)
</script>

<template>
  <div class="showcase">
    <StatusBar />
    <AppHeader title="Component Showcase" leading="back" trailing="close" />
    <div class="body">
      <SectionHeader title="Buttons" />
      <Button variant="primary">Continua</Button>
      <Button variant="primary" disabled>Continua</Button>
      <Button variant="secondary">+ Crea gruppo</Button>
      <Button variant="ghost">Salta</Button>

      <SectionHeader title="Fields" />
      <TextField v-model="text" label="Nome gruppo" required placeholder="Inserisci nome gruppo" />
      <SelectField v-model="select" label="Profilo predefinito" :options="[{ value: 'a', label: 'SE-66AA' }]" />
      <SegmentedControl v-model="segment" :options="[{ value: 'gruppo', label: 'Gruppo' }, { value: 'standalone', label: 'Stand-alone' }]" />
      <SliderField v-model="slider" label="Luminosità minima" />

      <SectionHeader title="Rows" />
      <SelectableRow label="Lampade (0/10)" select-type="radio" :selected="radioSel" @click="radioSel = !radioSel">
        <template #icon><IconBadge>💡</IconBadge></template>
      </SelectableRow>
      <SelectableRow label="Sensori (0/5)" select-type="checkbox" :selected="checkSel" @click="checkSel = !checkSel" />
      <ListItem title="Gruppo 1" subtitle-strong="10" subtitle="dispositivi" editable />
      <LinkRow title="Occupancy" caption="Accende automaticamente alla presenza" />

      <SectionHeader title="Empty states" />
      <EmptyState variant="card" title="Non hai creato ancora nessun gruppo" subtitle="Gestisci parametri e comportamenti specifici per gruppi di dispositivi." />

      <SectionHeader title="Overlays" />
      <Button variant="secondary" @click="sheetOpen = true">Apri BottomSheet</Button>
      <Button variant="secondary" @click="modalOpen = true">Apri Modal</Button>

      <WizardProgress :current="4" :total="8" />
      <FilterChip active>Lampade</FilterChip>
      <FilterChip>Sensori</FilterChip>
    </div>

    <BottomSheet v-model="sheetOpen" title="Filtri">
      <CheckboxRow v-model="checkSel" label="Includi dispositivi già configurati" />
      <Button variant="primary" @click="sheetOpen = false">Applica</Button>
    </BottomSheet>

    <ModalDialog v-model="modalOpen">
      <p>Vuoi consentire a "Kin Sync" di utilizzare il bluetooth del tuo iPhone?</p>
      <Button variant="primary" @click="modalOpen = false">Consenti</Button>
      <Button variant="ghost" @click="modalOpen = false">Non consentire</Button>
    </ModalDialog>
  </div>
</template>

<style scoped>
.showcase {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
