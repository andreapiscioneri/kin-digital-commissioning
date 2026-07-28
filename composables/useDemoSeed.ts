import type { ProvisionedDevice } from '~/composables/useDeviceCatalog'

export function seedBeghelliIfEmpty(projectId: string) {
  if (projectId !== 'beghelli') return

  const { levels, createLevels, updateLevel } = useLevelsStore(projectId)
  const { provisionedDevices } = useDeviceCatalog(projectId)
  const { scenes, createScene } = useScenesStore(projectId)
  const { collaborators, invite } = useCollaboratorsStore(projectId)

  if (levels.value.length > 0) return

  createLevels(2)
  const level1 = levels.value[0].id
  const level2 = levels.value[1].id

  updateLevel(level1, {
    name: 'Reparto Produzione',
    hasPlan: true,
    subLevels: 3,
    subLevelNames: ['Linea A', 'Linea B', 'Magazzino']
  })
  updateLevel(level2, {
    name: 'Uffici e Logistica',
    hasPlan: true,
    subLevels: 2,
    subLevelNames: ['Ufficio Tecnico', 'Spedizioni']
  })

  const devices: ProvisionedDevice[] = [
    { id: 'bgh-li-2350', code: 'LI-2350', name: 'LI-2350', type: 'Lampada', rssi: -52, zone: 'Linea A', levelId: level1, configured: true, on: true },
    { id: 'bgh-li-2351', code: 'LI-2351', name: 'LI-2351', type: 'Lampada', rssi: -58, zone: 'Linea A', levelId: level1, configured: true, on: false },
    { id: 'bgh-se-2350', code: 'SE-2350', name: 'SE-2350', type: 'Sensore', rssi: -63, zone: 'Linea A', levelId: level1, configured: true },
    { id: 'bgh-li-2360', code: 'LI-2360', name: 'LI-2360', type: 'Lampada', rssi: -55, zone: 'Linea B', levelId: level1, configured: true, on: true },
    { id: 'bgh-li-2361', code: 'LI-2361', name: 'LI-2361', type: 'Lampada', rssi: -60, zone: 'Linea B', levelId: level1, configured: true, on: true },
    { id: 'bgh-ps-2350', code: 'PS-2350', name: 'PS-2350', type: 'Pulsantiera', rssi: -70, zone: 'Linea B', levelId: level1, configured: true },
    { id: 'bgh-li-2370', code: 'LI-2370', name: 'LI-2370', type: 'Lampada', rssi: -74, zone: 'Magazzino', levelId: level1, configured: true, on: false },
    { id: 'bgh-se-2360', code: 'SE-2360', name: 'SE-2360', type: 'Sensore', rssi: -68, zone: 'Magazzino', levelId: level1, configured: true },
    { id: 'bgh-se-2361', code: 'SE-2361', name: 'SE-2361', type: 'Sensore', rssi: -71, zone: 'Magazzino', levelId: level1, configured: true },
    { id: 'bgh-li-2380', code: 'LI-2380', name: 'LI-2380', type: 'Lampada', rssi: -50, zone: 'Ufficio Tecnico', levelId: level2, configured: true, on: true },
    { id: 'bgh-ps-2360', code: 'PS-2360', name: 'PS-2360', type: 'Pulsantiera', rssi: -66, zone: 'Ufficio Tecnico', levelId: level2, configured: true },
    { id: 'bgh-li-2390', code: 'LI-2390', name: 'LI-2390', type: 'Lampada', rssi: -57, zone: 'Spedizioni', levelId: level2, configured: true, on: false },
    { id: 'bgh-li-2391', code: 'LI-2391', name: 'LI-2391', type: 'Lampada', rssi: -61, zone: 'Spedizioni', levelId: level2, configured: true, on: true },
    { id: 'bgh-se-2370', code: 'SE-2370', name: 'SE-2370', type: 'Sensore', rssi: -69, zone: 'Spedizioni', levelId: level2, configured: true },
    { id: 'bgh-ps-2370', code: 'PS-2370', name: 'PS-2370', type: 'Pulsantiera', rssi: -73, zone: 'Spedizioni', levelId: level2, configured: true }
  ]
  provisionedDevices.value = devices

  const lampIds = devices.filter((d) => d.type === 'Lampada').map((d) => d.id)
  if (scenes.value.length === 0) {
    createScene('Turno mattina', 'sun', lampIds)
    createScene('Modalità notturna', 'moon', lampIds)
    createScene('Chiusura stabilimento', 'lock', lampIds)
  }

  if (collaborators.value.length === 0) {
    invite('andrea.rossi@gewiss.com', 'Installer', true)
    invite('beatrice.conti@gewiss.com', 'Commissioner', false)
  }
}
