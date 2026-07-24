# KINsync — Digital Commissioning (prototipo)

Prototipo interattivo ad alta fedeltà (Nuxt 3 + TypeScript) del flusso di **Digital
Commissioning** (EPIC E2) dell'app KINsync — creazione progetto, livelli/zone, invito
collaboratori, scoperta e provisioning dispositivi BLE, configurazione dispositivi, gruppi e
scene — basato su:

- `ROB_ALE-KIN APP Spec in EPICS 02 07 2026.pdf` (comportamento)
- schermate esportate "DC – Installer Loggato manuale" e "DC – Installer Loggato guidato"
- Design System GEWISS (Figma)

## Avvio

```bash
yarn install
yarn dev
```

Apri `http://localhost:3000`.

## Logica simulata (nessun backend)

Tutto lo stato è client-side (composables), nessuna chiamata di rete reale, nessuna
autenticazione: l'app parte già "loggata" come installer.

## Struttura

- `components/` — libreria di componenti riutilizzabili (Button, TextInput, StepIndicator, ecc.)
- `composables/` — stato condiviso (progetti, flusso di commissioning, catalogo dispositivi mock)
- `pages/` — una route per schermata, organizzate per flusso del Digital Commissioning
