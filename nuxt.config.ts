// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/color-mode'],
  colorMode: {
    classPrefix: '',
    classSuffix: '-mode',
    preference: 'light',
    fallback: 'light',
    storageKey: 'kinsync-color-mode'
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'it' },
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover'
    }
  }
})
