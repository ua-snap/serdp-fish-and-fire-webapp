export default defineNuxtConfig({
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  },
  build: {
    transpile:
      process.env.NODE_ENV === 'production'
        ? ['@pinia/nuxt', 'naive-ui', 'vueuc', '@css-render/vue3-ssr']
        : [],
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/main.css', 'bulma/css/bulma.min.css'],
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    optimizeDeps: {
      include:
        process.env.NODE_ENV === 'development'
          ? ['naive-ui', 'vueuc', 'date-fns-tz/esm/formatInTimeZone']
          : [],
    },
  },
  buildModules: [],
  serverMiddleware: [],
  runtimeConfig: {
    public: {
      geoserverUrl: process.env.GEOSERVER_URL,
    },
  },
})
