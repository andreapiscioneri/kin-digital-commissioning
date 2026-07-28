export interface AppNotification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

function initialNotifications(): AppNotification[] {
  return [
    { id: 'n1', title: 'Sincronizzazione completata', description: 'Il progetto "Rossi SpA" è stato sincronizzato correttamente.', time: '2 ore fa', read: false },
    { id: 'n2', title: 'Nuovo collaboratore', description: 'Hai invitato un nuovo Installer al progetto "Paladozza".', time: 'Ieri', read: false }
  ]
}

export function useNotificationsStore() {
  const notifications = useState<AppNotification[]>('notifications-list', initialNotifications)

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  function markAllRead() {
    notifications.value = notifications.value.map((n) => ({ ...n, read: true }))
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return { notifications, unreadCount, markAllRead, removeNotification }
}
