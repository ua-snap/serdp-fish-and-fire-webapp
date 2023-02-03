import { defineStore } from 'pinia'
import areaData from '~/assets/data'

export const useAreas = defineStore('areas', {
  state: () => ({
    areas: undefined,
    intersectingAreas: undefined,
    selected: undefined,
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
    selectedArea: state => {
      return state.selected
    },
    selectedAreaData: state => {
      let matchedData = undefined
      areaData.forEach(obj => {
        if (obj['AOI_Name_'] == state.selected) {
          matchedData = obj
          delete matchedData['AOI_Name_']
        }
      })
      return matchedData
    },
  },
  actions: {
    async fetchAreaOptions() {
      try {
        let groups = {}

        let groupLookup = {
          DOD: 'Department of Defense (DOD) Lands',
          ADFG: 'ADF&G Game Management Units',
          FIRE: 'AFS Fire Management Units',
          HUC: 'Hydrologic Unit Code (HUC)',
          PARK: 'Park and Conservation Units',
        }

        const runtimeConfig = useRuntimeConfig()
        let geoserverUrl = runtimeConfig.public.geoserverUrl
        let response = await $fetch(geoserverUrl)
        if (response != undefined) {
          response.features.forEach(area => {
            let category = area.properties['Category']
            if (!groups.hasOwnProperty(category)) {
              groups[category] = {
                type: 'group',
                label: groupLookup[category],
                key: category,
                children: [],
              }
            }
            groups[category]['children'].push({
              label: area.properties['AOI_Name_'],
              value: area.properties['AOI_Name_'], // Change this to real ID
            })
          })
        }
        let areas = []
        Object.keys(groups).forEach(key => {
          areas.push(groups[key])
        })
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
