// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  nitro: {
    // Forza il preset statico ovunque: senza questo, Nitro rileva la variabile
    // d'ambiente NETLIFY in CI e passa da solo a un preset diverso che scrive
    // in dist/ invece di .output/public, disallineandosi dal `publish` in
    // netlify.toml (causa dell'errore "Deploy directory does not exist").
    preset: 'static'
  },
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
