import { resolve } from 'path'

export default defineNuxtConfig({
  ssr: false,
  target: 'static',
  alias: {
    'date-fns': resolve(__dirname, './node_modules/date-fns'),
  },
  nitro: {
    prerender: {
      routes: ['/', '/report', '/fmo'],
    },
  },
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    link: [{ rel: 'manifest', href: '/site.webmanifest' }],
  },
  app: {
    head: {
      script: [
        {
          src: 'https://umami.snap.uaf.edu/script.js',
          'data-website-id': '0d96da3f-f9c7-4f69-946d-848d38c0b5d3',
          'data-do-not-track': 'true',
          'data-domains': 'snap.uaf.edu',
          async: 'true',
          defer: 'true',
        },
      ],
    },
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
  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: 'report.hash',
        path: '/report/:hash',
        file: resolve('/pages/report.vue'),
      })
    },
  },
})
