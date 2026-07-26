import { Capacitor } from '@capacitor/core'

export type AppPlatform = 'ios' | 'android' | 'web'

export function usePlatform() {
  const platform = useState<AppPlatform>('platform-current', () =>
    import.meta.client ? (Capacitor.getPlatform() as AppPlatform) : 'web'
  )
  const isNative = useState<boolean>('platform-is-native', () =>
    import.meta.client ? Capacitor.isNativePlatform() : false
  )

  return { platform, isNative }
}
