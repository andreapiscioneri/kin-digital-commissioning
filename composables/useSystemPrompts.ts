type CookieChoice = 'pending' | 'accepted' | 'rejected'
type NotificationsChoice = 'pending' | 'granted' | 'denied'

export function useSystemPrompts() {
  // Stato solo in-memory (non persistito): come i veri prompt di sistema,
  // vanno richiesti ad ogni avvio dell'app finché non si integra un vero
  // storage dei permessi lato dispositivo.
  const cookieChoice = useState<CookieChoice>('sys-cookie-choice', () => 'pending')
  const notificationsChoice = useState<NotificationsChoice>('sys-notifications-choice', () => 'pending')

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
