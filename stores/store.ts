import { defineStore } from 'pinia'
import areaData from '~/assets/data'

export const useStore = defineStore('store', {
  state: () => ({
    areas: undefined,
    intersectingAreas: undefined,
    selected: undefined,
    resultGeom: undefined,
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
    reportGeom: state => {
      return state.resultGeom
    },
    chartData: state => {
      let matchedData = undefined
      let chartData = {}
      if (state.selected) {
        areaData.forEach(obj => {
          if (obj['AOI_Name_'] == state.selected) {
            matchedData = structuredClone(obj)
            delete matchedData['AOI_Name_']
          }
        })
        Object.keys(matchedData).forEach(key => {
          if (key.includes('ccsm_') || key.includes('gfdl_')) {
            let [model, fmo, index] = key.split('_')
            if (!chartData.hasOwnProperty(fmo)) {
              chartData[fmo] = {
                ccsm: [null],
                gfdl: [null],
              }
            }
            chartData[fmo][model].splice(index, 0, matchedData[key])
          }
        })
        chartData['historical'] = {
          low: matchedData['low_scenario'],
          high: matchedData['high_scenario'],
        }
      }
      return chartData
    },
    tableData: state => {
      let matchedData = undefined
      areaData.forEach(obj => {
        if (obj['AOI_Name_'] == state.selected) {
          matchedData = structuredClone(obj)
          delete matchedData['AOI_Name_']
        }
      })
      let tableData = {}
      if (matchedData) {
        Object.keys(matchedData).forEach(key => {
          if (
            !key.includes('ccsm_') &&
            !key.includes('gfdl_') &&
            !key.includes('_scenario')
          ) {
            tableData[key] = matchedData[key]
          }
        })
      }
      return tableData
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
              value: area.properties['AOI_Name_'],
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
    async fetchResultGeom() {
      try {
        const runtimeConfig = useRuntimeConfig()
        let geoserverUrl =
          runtimeConfig.public.geoserverUrl +
          "&cql_filter=AOI_Name_='" +
          this.selected +
          "'"
        let response = await $fetch(geoserverUrl)
        if (response != undefined) {
          this.$patch(state => {
            state.resultGeom = response.features[0].geometry
          })
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
})
