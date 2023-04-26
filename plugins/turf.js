import area from '@turf/area';

export default defineNuxtPlugin(nuxtApp => {
  return {
    provide: {
      turfArea: area,
    },
  }
})
