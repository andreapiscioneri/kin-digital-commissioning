export function useSystemPrompts() {
  const cookieChoice = useState<'pending' | 'accepted' | 'rejected'>('sys-cookie-choice', () => 'pending')
  const notificationsChoice = useState<'pending' | 'granted' | 'denied'>('sys-notifications-choice', () => 'pending')

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
