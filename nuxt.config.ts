import { resolve } from 'path'

export default defineNuxtConfig({
  ssr: false,
  target: 'static',
  alias: {
    'date-fns': resolve(__dirname, './node_modules/date-fns'),
  },
  nitro: {
    prerender: {
      routes: ['/', '/fmo'],
    },
  },
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
  css: ['bulma/css/bulma.min.css', '~/assets/main.css'],
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    optimizeDeps: {
      include:
        process.env.NODE_ENV === 'development' ? ['naive-ui', 'vueuc'] : [],
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
