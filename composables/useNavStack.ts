export function useNavStack() {
  const stack = useState<string[]>('nav-stack', () => [])
  const direction = useState<'forward' | 'back' | 'close'>('nav-direction', () => 'forward')
  const transitionName = computed(() => `page-${direction.value}`)

  function goForward(path: string) {
    const route = useRoute()
    stack.value = [...stack.value, route.fullPath]
    direction.value = 'forward'
    navigateTo(path)
  }

  function goBack(fallback?: string) {
    direction.value = 'back'

    if (stack.value.length > 0) {
      const previous = stack.value[stack.value.length - 1]
      stack.value = stack.value.slice(0, -1)
      navigateTo(previous)
      return
    }

    if (import.meta.client && window.history.length > 1) {
      const router = useRouter()
      router.back()
      return
    }

    navigateTo(fallback || '/progetti')
  }

  function goBackTo(path: string) {
    const idx = stack.value.lastIndexOf(path)
    stack.value = idx >= 0 ? stack.value.slice(0, idx) : []
    direction.value = 'back'
    navigateTo(path)
  }

  function goClose(path: string) {
    stack.value = []
    direction.value = 'close'
    navigateTo(path)
  }

  return { direction, transitionName, goForward, goBack, goBackTo, goClose }
}
