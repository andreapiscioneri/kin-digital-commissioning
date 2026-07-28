type NotificationsChoice = 'pending' | 'granted' | 'denied'

export function useSystemPrompts() {
  // Stato solo in-memory (non persistito): come i veri prompt di sistema,
  // vanno richiesti ad ogni avvio dell'app finché non si integra un vero
  // storage dei permessi lato dispositivo.
  const notificationsChoice = useState<NotificationsChoice>('sys-notifications-choice', () => 'pending')

  function grantNotifications() {
    notificationsChoice.value = 'granted'
  }

  function denyNotifications() {
    notificationsChoice.value = 'denied'
  }

  return { notificationsChoice, grantNotifications, denyNotifications }
}
