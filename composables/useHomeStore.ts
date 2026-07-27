export type WidgetType = 'temperature' | 'humidity' | 'energy' | 'irrigation'

export interface Widget {
  id: string
  type: WidgetType
  label: string
  value: string
  unit: string
  detailLabel: string
}

export interface RoomDevice {
  id: string
  name: string
  icon: 'light' | 'lamp' | 'ceiling' | 'tv'
  on: boolean
}

export interface Room {
  id: string
  name: string
  image: string
  temp?: string
  humidity?: string
  music?: boolean
  devices: RoomDevice[]
}

export interface Zone {
  id: string
  name: string
  rooms: Room[]
}

export interface HomeScene {
  id: string
  label: string
  icon: 'yoga' | 'sun' | 'moon'
  color: 'purple' | 'green' | 'blue'
}

export interface CategoryDevice {
  id: string
  name: string
  subtitle: string
  icon: string
  on: boolean
}

export interface DeviceCategory {
  id: string
  label: string
  icon: 'light' | 'plug' | 'motor' | 'sensor'
  devices: CategoryDevice[]
}

function makeZones(): Zone[] {
  return [
    {
      id: 'piano-terra',
      name: 'Piano terra',
      rooms: [
        {
          id: 'zona-giorno',
          name: 'Zona giorno',
          image: '/images/room-living.jpg',
          temp: '20,4°C',
          humidity: '20,4%',
          devices: [
            { id: 'zg-1', name: 'Luci controsoffitto', icon: 'ceiling', on: false },
            { id: 'zg-2', name: 'Lampada divano', icon: 'lamp', on: true },
            { id: 'zg-3', name: 'TV grande', icon: 'tv', on: true }
          ]
        },
        {
          id: 'bagno-piano-terra',
          name: 'Bagno piano terra',
          image: '/images/room-bathroom.jpg',
          temp: '20,1°C',
          devices: [
            { id: 'bpt-1', name: 'Luce specchio', icon: 'light', on: false },
            { id: 'bpt-2', name: 'Faretti soffitto', icon: 'ceiling', on: false },
            { id: 'bpt-3', name: 'Presa asciugacapelli', icon: 'lamp', on: false }
          ]
        },
        {
          id: 'cucina',
          name: 'Cucina',
          image: '/images/room-kitchen.jpg',
          temp: '20,0°C',
          devices: [
            { id: 'cu-1', name: 'Luci pensili', icon: 'light', on: true },
            { id: 'cu-2', name: 'Faretti soffitto', icon: 'ceiling', on: true },
            { id: 'cu-3', name: 'Presa piano cottura', icon: 'lamp', on: false }
          ]
        },
        {
          id: 'studio-musica',
          name: 'Studio musica',
          image: '/images/room-studio.jpg',
          temp: '20,0°C',
          humidity: '20,4%',
          music: true,
          devices: [
            { id: 'sm-1', name: 'Luce regia', icon: 'light', on: true },
            { id: 'sm-2', name: 'Faretti soffitto', icon: 'ceiling', on: true },
            { id: 'sm-3', name: 'Impianto audio', icon: 'tv', on: true }
          ]
        }
      ]
    },
    {
      id: 'secondo-piano',
      name: 'Secondo piano',
      rooms: [
        {
          id: 'camera-grande',
          name: 'Camera grande',
          image: '/images/room-bedroom.jpg',
          temp: '20,4°C',
          humidity: '20,4%',
          devices: [
            { id: 'cg-1', name: 'Luce comodino sx', icon: 'lamp', on: true },
            { id: 'cg-2', name: 'Luce comodino dx', icon: 'lamp', on: false },
            { id: 'cg-3', name: 'Faretti soffitto', icon: 'ceiling', on: true }
          ]
        },
        {
          id: 'bagno-secondo-piano',
          name: 'Bagno',
          image: '/images/room-bathroom2.jpg',
          temp: '20,1°C',
          devices: [
            { id: 'bsp-1', name: 'Luce specchio', icon: 'light', on: false },
            { id: 'bsp-2', name: 'Faretti soffitto', icon: 'ceiling', on: false }
          ]
        },
        {
          id: 'camera-ospiti',
          name: 'Camera ospiti',
          image: '/images/room-guest.jpg',
          temp: '20,0°C',
          devices: [
            { id: 'co-1', name: 'Lampada comodino', icon: 'lamp', on: false },
            { id: 'co-2', name: 'Faretti soffitto', icon: 'ceiling', on: false }
          ]
        },
        {
          id: 'mansarda',
          name: 'Mansarda',
          image: '/images/room-attic.jpg',
          temp: '19,9°C',
          humidity: '19,7%',
          devices: [
            { id: 'ma-1', name: 'Luce lucernario', icon: 'light', on: true },
            { id: 'ma-2', name: 'Lampada lettura', icon: 'lamp', on: true }
          ]
        }
      ]
    },
    {
      id: 'giardino-esterno',
      name: 'Giardino esterno',
      rooms: [
        {
          id: 'veranda',
          name: 'Veranda',
          image: '/images/room-veranda.jpg',
          temp: '20,4°C',
          humidity: '20,4%',
          devices: [
            { id: 've-1', name: 'Luci veranda', icon: 'ceiling', on: false },
            { id: 've-2', name: 'Presa irrigazione', icon: 'lamp', on: false }
          ]
        },
        {
          id: 'area-piscina',
          name: 'Area piscina',
          image: '/images/room-pool.jpg',
          music: true,
          devices: [
            { id: 'ap-1', name: 'Luci subacquee', icon: 'light', on: false },
            { id: 'ap-2', name: 'Diffusori audio', icon: 'tv', on: false }
          ]
        },
        {
          id: 'area-barbecue',
          name: 'Area barbecue',
          image: '/images/room-bbq.jpg',
          temp: '20,0°C',
          devices: [
            { id: 'ab-1', name: 'Faretti area pranzo', icon: 'ceiling', on: false },
            { id: 'ab-2', name: 'Presa griglia elettrica', icon: 'lamp', on: false }
          ]
        }
      ]
    }
  ]
}

function makeDeviceCategories(): DeviceCategory[] {
  return [
    {
      id: 'luci',
      label: 'Luci',
      icon: 'light',
      devices: [
        { id: 'l-1', name: 'Ingresso', subtitle: 'Luce 1', icon: 'light', on: true },
        { id: 'l-2', name: 'Soggiorno', subtitle: 'Centro', icon: 'light', on: true },
        { id: 'l-3', name: 'Soggiorno', subtitle: 'Piantana', icon: 'lamp', on: false },
        { id: 'l-4', name: 'Cucina', subtitle: 'Luce 4', icon: 'ceiling', on: true },
        { id: 'l-5', name: 'Camera bambini', subtitle: 'Luce 5', icon: 'lamp', on: false },
        { id: 'l-6', name: 'Bagno piano terra', subtitle: 'Luce 6', icon: 'light', on: false },
        { id: 'l-7', name: 'Veranda', subtitle: 'Luce 7', icon: 'lamp', on: true }
      ]
    },
    {
      id: 'attuatori',
      label: 'Attuatori',
      icon: 'plug',
      devices: [
        { id: 'a-1', name: 'Cucina', subtitle: 'Lavastoviglie', icon: 'plug', on: true },
        { id: 'a-2', name: 'Lavanderia', subtitle: 'Lavatrice', icon: 'plug', on: true },
        { id: 'a-3', name: 'Giardino esterno', subtitle: 'Irrigatore aiuola', icon: 'motor', on: true },
        { id: 'a-4', name: 'Giardino esterno', subtitle: 'Irrigatore prato', icon: 'motor', on: true },
        { id: 'a-5', name: 'Nessun ambiente', subtitle: 'Climatizzatore', icon: 'plug', on: true }
      ]
    },
    {
      id: 'motori',
      label: 'Motori',
      icon: 'motor',
      devices: [
        { id: 'mo-1', name: 'Soggiorno', subtitle: 'Tapparella sx', icon: 'motor', on: false },
        { id: 'mo-2', name: 'Soggiorno', subtitle: 'Tapparella dx', icon: 'motor', on: false },
        { id: 'mo-3', name: 'Camera grande', subtitle: 'Tenda motorizzata', icon: 'motor', on: false },
        { id: 'mo-4', name: 'Garage', subtitle: 'Cancello automatico', icon: 'motor', on: false },
        { id: 'mo-5', name: 'Veranda', subtitle: 'Tenda da sole', icon: 'motor', on: false },
        { id: 'mo-6', name: 'Mansarda', subtitle: 'Lucernario motorizzato', icon: 'motor', on: false }
      ]
    },
    {
      id: 'sensori',
      label: 'Sensori',
      icon: 'sensor',
      devices: [
        { id: 'se-1', name: 'Ingresso', subtitle: 'Sensore movimento', icon: 'sensor', on: true },
        { id: 'se-2', name: 'Studio musica', subtitle: 'Sensore audio', icon: 'sensor', on: true },
        { id: 'se-3', name: 'Giardino esterno', subtitle: 'Sensore pioggia', icon: 'sensor', on: true },
        { id: 'se-4', name: 'Area piscina', subtitle: 'Sensore temperatura acqua', icon: 'sensor', on: true }
      ]
    }
  ]
}

export function useHomeStore() {
  const property = useState('home-property', () => ({
    name: 'Villa Meraviglia',
    photo: '/images/villa-hero.jpg',
    ownerName: 'Tanja'
  }))

  const widgets = useState<Widget[]>('home-widgets', () => [
    { id: 'temp', type: 'temperature', label: 'TEMPERATURA', value: '20,4', unit: '°C', detailLabel: 'Zona giorno' },
    { id: 'humidity', type: 'humidity', label: 'UMIDITÀ', value: '20,4', unit: '%', detailLabel: 'Zona giorno' },
    { id: 'energy', type: 'energy', label: 'CONSUMO DI ENERGIA OGGI', value: '1,45', unit: 'kWh', detailLabel: '' },
    { id: 'irrigation', type: 'irrigation', label: 'IRRIGATORE', value: '5min x 2', unit: '', detailLabel: 'Aiuola' }
  ])

  const scenes = useState<HomeScene[]>('home-scenes', () => [
    { id: 'yoga', label: 'Yoga', icon: 'yoga', color: 'purple' },
    { id: 'sveglia', label: 'Sveglia', icon: 'sun', color: 'green' },
    { id: 'sogni-oro', label: "Sogni d'oro", icon: 'moon', color: 'blue' }
  ])

  const zones = useState<Zone[]>('home-zones', () => makeZones())
  const deviceCategories = useState<DeviceCategory[]>('home-device-categories', () => makeDeviceCategories())

  function toggleRoomDevice(roomId: string, deviceId: string) {
    for (const zone of zones.value) {
      const room = zone.rooms.find((r) => r.id === roomId)
      if (room) {
        const device = room.devices.find((d) => d.id === deviceId)
        if (device) device.on = !device.on
      }
    }
  }

  function toggleCategoryDevice(categoryId: string, deviceId: string) {
    const category = deviceCategories.value.find((c) => c.id === categoryId)
    const device = category?.devices.find((d) => d.id === deviceId)
    if (device) device.on = !device.on
  }

  function toggleAllInCategory(categoryId: string, on: boolean) {
    const category = deviceCategories.value.find((c) => c.id === categoryId)
    if (!category) return
    category.devices.forEach((d) => (d.on = on))
  }

  function roomDevicesOnCount(room: Room) {
    return room.devices.filter((d) => d.on).length
  }

  return {
    property,
    widgets,
    scenes,
    zones,
    deviceCategories,
    toggleRoomDevice,
    toggleCategoryDevice,
    toggleAllInCategory,
    roomDevicesOnCount
  }
}
