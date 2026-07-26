import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.kinsync.commissioning',
  appName: 'Kin Sync',
  webDir: '.output/public',
  ios: {
    contentInset: 'always'
  },
  android: {
    allowMixedContent: false
  }
}

export default config
