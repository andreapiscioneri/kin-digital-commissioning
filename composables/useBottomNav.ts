export interface BottomNavItem {
  label: string
  path: string
  icon: 'dashboard' | 'projects' | 'notifications' | 'profile'
  badge?: number
}

const NAV_PATHS = ['/dashboard', '/account/notifiche', '/account/profilo']

export function useBottomNav() {
  const route = useRoute()
  const { unreadCount } = useNotificationsStore()

  const items = computed<BottomNavItem[]>(() => [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Progetti', path: '/progetti', icon: 'projects' },
    { label: 'Notifiche', path: '/account/notifiche', icon: 'notifications', badge: unreadCount.value },
    { label: 'Profilo', path: '/account/profilo', icon: 'profile' }
  ])

  const normalizedPath = computed(() => (route.path.length > 1 ? route.path.replace(/\/+$/, '') : route.path))
  const isVisible = computed(() => NAV_PATHS.includes(normalizedPath.value))
  const showFab = computed(() => normalizedPath.value === '/dashboard')

  return { items, isVisible, showFab, normalizedPath }
}
