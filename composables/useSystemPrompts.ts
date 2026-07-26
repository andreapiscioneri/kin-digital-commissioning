type CookieChoice = 'pending' | 'accepted' | 'rejected'
type NotificationsChoice = 'pending' | 'granted' | 'denied'

const COOKIE_KEY = 'kinsync-cookie-choice'
const NOTIFICATIONS_KEY = 'kinsync-notifications-choice'

function readStored<T extends string>(key: string): T | null {
  if (!import.meta.client) return null
  const value = window.localStorage.getItem(key)
  return (value as T) || null
}

export function useSystemPrompts() {
  const cookieChoice = useState<CookieChoice>('sys-cookie-choice', () => readStored<CookieChoice>(COOKIE_KEY) || 'pending')
  const notificationsChoice = useState<NotificationsChoice>(
    'sys-notifications-choice',
    () => readStored<NotificationsChoice>(NOTIFICATIONS_KEY) || 'pending'
  )

  if (import.meta.client) {
    watch(cookieChoice, (value) => window.localStorage.setItem(COOKIE_KEY, value))
    watch(notificationsChoice, (value) => window.localStorage.setItem(NOTIFICATIONS_KEY, value))
  }

  function acceptCookies() {
    cookieChoice.value = 'accepted'
  }

  function rejectCookies() {
    cookieChoice.value = 'rejected'
  }

  function grantNotifications() {
    notificationsChoice.value = 'granted'
  }

  function denyNotifications() {
    notificationsChoice.value = 'denied'
  }

  return { cookieChoice, notificationsChoice, acceptCookies, rejectCookies, grantNotifications, denyNotifications }
}
