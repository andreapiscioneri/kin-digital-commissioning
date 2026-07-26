<script setup lang="ts">
const { goBack } = useNavStack()
</script>

<template>
  <div class="screen">
    <StatusBar />
    <AppHeader title="Dati profilo" leading="back" trailing="none" @back="goBack('/progetti')" />

    <div class="body">
      <div class="avatar-row">
        <img class="avatar" src="/images/avatar-marco.jpg" alt="Marco Rossi" />
        <div class="avatar-text">
          <p class="name">Marco Rossi</p>
          <p class="role">Installer</p>
        </div>
      </div>

      <section class="section">
        <p class="section-title">Account</p>
        <InfoRow label="Nome" value="Marco Rossi" />
        <InfoRow label="Email" value="marco.rossi@gewiss.com" />
        <InfoRow label="Telefono" value="+39 035 946 111" />
        <InfoRow label="Ruolo" value="Installer" />
      </section>

      <section class="section">
        <p class="section-title">Azienda</p>
        <InfoRow label="Ragione sociale" value="Gewiss Installazioni Srl" />
        <InfoRow label="Sede" value="Cenate Sotto (BG)" />
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

.avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.name {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--color-primary);
}

.role {
  margin: 2px 0 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 12px 16px;
}

.section-title {
  margin: 0 0 4px;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}
</style>
