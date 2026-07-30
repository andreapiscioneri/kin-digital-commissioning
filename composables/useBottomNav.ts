export interface BottomNavItem {
  label: string
  path: string
  icon: 'dashboard' | 'projects' | 'notifications' | 'profile' | 'project' | 'devices' | 'scene' | 'diagnostics'
  badge?: number
  active?: boolean
}

const APP_NAV_PATHS = ['/dashboard', '/account/notifiche', '/account/profilo']

export function useBottomNav() {
  const route = useRoute()
  const { unreadCount } = useNotificationsStore()
  const projectId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

  const normalizedPath = computed(() => (route.path.length > 1 ? route.path.replace(/\/+$/, '') : route.path))
  const projectDetailPath = computed(() => (projectId.value ? `/progetti/${projectId.value}` : ''))
  const onProjectDetail = computed(() => !!projectDetailPath.value && normalizedPath.value === projectDetailPath.value)
  const scanPath = computed(() => `${projectDetailPath.value}/dispositivi/scan`)
  const activeProjectTab = computed(() => (typeof route.query.tab === 'string' ? route.query.tab : 'livelli'))

  const items = computed<BottomNavItem[]>(() => {
    if (onProjectDetail.value) {
      const basePath = projectDetailPath.value
      const isProjectTab = activeProjectTab.value === 'livelli'
      const isDevicesTab = activeProjectTab.value === 'dispositivi'
      const isSceneTab = activeProjectTab.value === 'scene'
      const isDiagnosticsTab = activeProjectTab.value === 'collaboratori'

      return [
        {
          label: 'Progetto',
          path: `${basePath}?tab=livelli`,
          icon: 'project',
          active: normalizedPath.value === basePath && isProjectTab
        },
        {
          label: 'Dispositivi',
          path: `${basePath}?tab=dispositivi`,
          icon: 'devices',
          active: normalizedPath.value === basePath && isDevicesTab
        },
        {
          label: 'Scene',
          path: `${basePath}?tab=scene`,
          icon: 'scene',
          active: normalizedPath.value === basePath && isSceneTab
        },
        {
          label: 'Diagnostica',
          path: `${basePath}?tab=collaboratori`,
          icon: 'diagnostics',
          active: normalizedPath.value === basePath && isDiagnosticsTab
        }
      ]
    }

    return [
      { label: 'Dashboard', path: '/dashboard', icon: 'dashboard', active: normalizedPath.value === '/dashboard' },
      { label: 'Progetti', path: '/progetti', icon: 'projects', active: normalizedPath.value === '/progetti' },
      {
        label: 'Notifiche',
        path: '/account/notifiche',
        icon: 'notifications',
        badge: unreadCount.value,
        active: normalizedPath.value === '/account/notifiche'
      },
      { label: 'Profilo', path: '/account/profilo', icon: 'profile', active: normalizedPath.value === '/account/profilo' }
    ]
  })

  const isVisible = computed(() => APP_NAV_PATHS.includes(normalizedPath.value) || onProjectDetail.value)
  const showFab = computed(() => normalizedPath.value === '/dashboard' || onProjectDetail.value)
  const fabPath = computed(() => (onProjectDetail.value ? scanPath.value : '/progetti/nuovo'))

  return { items, isVisible, showFab, fabPath, normalizedPath }
}
