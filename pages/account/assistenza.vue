<script setup lang="ts">
const { goBack } = useNavStack()

const faq = [
  { title: 'Come avvio una scansione dispositivi?', caption: 'Entra in un progetto, apri Dispositivi e tocca "Aggiungi dispositivi".' },
  { title: 'Il Bluetooth non trova nessun dispositivo', caption: 'Verifica che i dispositivi siano alimentati e nel raggio di rilevamento.' },
  { title: 'Come invito un collaboratore?', caption: 'Da un progetto, apri il menu e vai su Team di collaboratori.' }
]
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Assistenza" leading="back" trailing="none" @back="goBack('/progetti')" />

    <div class="body">
      <section class="section">
        <p class="section-title">Domande frequenti</p>
        <LinkRow v-for="item in faq" :key="item.title" :title="item.title" :caption="item.caption" />
      </section>

      <section class="section">
        <p class="section-title">Contatti</p>
        <InfoRow label="Supporto tecnico" value="+39 035 946 111" />
        <InfoRow label="Email" value="supporto@kinsync.gewiss.com" />
      </section>
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
  padding: 20px var(--space-page-x) 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 4px 16px 12px;
}

.section-title {
  margin: 12px 0 4px;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}
</style>
