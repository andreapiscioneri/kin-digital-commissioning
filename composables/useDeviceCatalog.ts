export type DeviceType = 'Lampada' | 'Sensore' | 'Pulsantiera'

export interface DiscoveredDevice {
  id: string
  code: string
  type: DeviceType
  rssi: number
}

export interface ProvisionedDevice extends DiscoveredDevice {
  zone: string
  name: string
  levelId?: string
  configured: boolean
}

const MOCK_DEVICES: DiscoveredDevice[] = [
  { id: 'dev-1', code: 'LI-2350', type: 'Lampada', rssi: -52 },
  { id: 'dev-2', code: 'TR-2350', type: 'Lampada', rssi: -58 },
  { id: 'dev-3', code: 'SE-2350', type: 'Sensore', rssi: -63 },
  { id: 'dev-4', code: 'PS-2350', type: 'Pulsantiera', rssi: -70 },
  { id: 'dev-5', code: 'AL-2350', type: 'Lampada', rssi: -74 },
  { id: 'dev-6', code: 'MR-2350', type: 'Lampada', rssi: -81 }
]

export function useDeviceCatalog(projectId: string) {
  const allProvisioned = useState<Record<string, ProvisionedDevice[]>>('dc-provisioned-devices', () => ({}))

  const provisionedDevices = computed<ProvisionedDevice[]>({
    get: () => allProvisioned.value[projectId] || [],
    set: (val: ProvisionedDevice[]) => {
      allProvisioned.value = { ...allProvisioned.value, [projectId]: val }
    }
  })

  function scanDevices(): DiscoveredDevice[] {
    return MOCK_DEVICES
  }

  function provisionDevices(devices: DiscoveredDevice[], zone: string, levelId?: string) {
    const newlyProvisioned: ProvisionedDevice[] = devices.map((d) => ({ ...d, zone, levelId, name: d.code, configured: false }))
    provisionedDevices.value = [...provisionedDevices.value, ...newlyProvisioned]
    return newlyProvisioned
  }

  function getDevice(id: string) {
    return provisionedDevices.value.find((d: ProvisionedDevice) => d.id === id)
  }

  function updateDevice(id: string, patch: Partial<ProvisionedDevice>) {
    provisionedDevices.value = provisionedDevices.value.map((d: ProvisionedDevice) => (d.id === id ? { ...d, ...patch } : d))
  }

  return { provisionedDevices, scanDevices, provisionDevices, getDevice, updateDevice }
}
