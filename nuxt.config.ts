// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/google-fonts', '@nuxtjs/color-mode'],
  colorMode: {
    classPrefix: '',
    classSuffix: '-mode',
    preference: 'system',
    fallback: 'light',
    storageKey: 'kinsync-color-mode'
  },
  googleFonts: {
    families: {
      'Work Sans': [400, 500, 600, 700]
    },
    display: 'swap',
    download: true,
    inject: true
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'it' },
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover'
    }
  }
})
