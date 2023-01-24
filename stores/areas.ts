import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAreas = defineStore('areas', {
  state: () => ({
    areas: undefined,
    intersectingAreas: undefined,
  }),

  getters: {
    areaOptions: state => state.areas,
    matchedAreaNames: state => {
      let names = []
      if (state.intersectingAreas != undefined) {
        state.intersectingAreas.forEach(area => {
          names.push(area.properties['AOI_Name_'])
        })
      }
      return names
    },
    matchedGeoms: state => {
      let geoms = []
      if (state.intersectingAreas != undefined) {
        state.intersectingAreas.forEach(area => {
          geoms.push(area.geometry)
        })
      }
      return geoms
    },
  },
  actions: {
    async fetchAreaOptions() {
      try {
        let fetches = []
        let areas = []
        const runtimeConfig = useRuntimeConfig()
        let geoserverUrl = runtimeConfig.public.geoserverUrl
        let response = await $fetch(geoserverUrl)
        if (response != undefined) {
          response.features.forEach(area => {
            areas.push({
              label: area.properties['AOI_Name_'],
              value: area.properties['AOI_Name_'], // Change this to real ID
            })
          })
        }
        this.$patch(state => {
          state.areas = areas
        })
      } catch (error) {
        console.log(error)
      }
    },
    async fetchIntersectingAreas(lat, lon) {
      try {
        let areas = []
        const runtimeConfig = useRuntimeConfig()
        let geoserverUrl =
          runtimeConfig.public.geoserverUrl +
          '&cql_filter=INTERSECTS(the_geom,POINT(' +
          lon +
          ' ' +
          lat +
          '))'
        let response = await $fetch(geoserverUrl)
        if (response != undefined) {
          this.$patch(state => {
            state.intersectingAreas = response.features
          })
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
})
