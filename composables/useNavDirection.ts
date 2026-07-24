export function useNavDirection() {
  const direction = useState<'forward' | 'back' | 'close'>('nav-direction', () => 'forward')
  const transitionName = computed(() => `page-${direction.value}`)

  function goForward(path: string) {
    direction.value = 'forward'
    navigateTo(path)
  }

  function goBack(fallback: string) {
    direction.value = 'back'
    const router = useRouter()
    if (import.meta.client && window.history.length > 1) {
      router.back()
    } else {
      navigateTo(fallback)
    }
  }

  function goBackTo(path: string) {
    direction.value = 'back'
    navigateTo(path)
  }

  function goClose(path: string) {
    direction.value = 'close'
    navigateTo(path)
  }

  return { direction, transitionName, goForward, goBack, goBackTo, goClose }
}
