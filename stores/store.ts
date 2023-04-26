import { defineStore } from 'pinia'
import fishGrowthDict from '~/assets/fish_growth'
import fireImpactDict from '~/assets/riparian_fire_impact'
import hydrographDict from '~/assets/hydrograph_data.json'
import hydroStatsDict from '~/assets/hydrology_stats'
import streamTempDict from '~/assets/stream_temp_stats'

export const useStore = defineStore('store', () => {
  // Store imported JSONs into common data object for easier lookup later.
  const data = {
    fishGrowth: fishGrowthDict,
    fireImpact: fireImpactDict,
    hydrograph: hydrographDict,
    hydroStats: hydroStatsDict,
    streamTemp: streamTempDict,
  }

  const areas = ref([])
  const intersectingAreas = ref(undefined)
  const selected = ref(undefined)
  const resultGeom = ref(undefined)
  const reset = ref(false)

  const fetchAreaOptions = async () => {
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
      areas.value = []
      Object.keys(groups).forEach(key => {
        areas.value.push(groups[key])
      })
    } catch (error) {
      console.log(error)
    }
  }

  const fetchIntersectingAreas = async (lat, lon) => {
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
        intersectingAreas.value = response.features
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchResultGeom = async () => {
    try {
      const runtimeConfig = useRuntimeConfig()
      let geoserverUrl =
        runtimeConfig.public.geoserverUrl +
        "&cql_filter=AOI_Name_='" +
        selected.value +
        "'"
      let response = await $fetch(geoserverUrl)
      if (response != undefined) {
        resultGeom.value = response.features[0].geometry
      }
    } catch (error) {
      console.log(error)
    }
  }

  const areaOptions = computed(() => {
    return areas.value
  })

  const matchedAreaNames = computed(() => {
    let names = []
    if (intersectingAreas.value != undefined) {
      intersectingAreas.value.forEach(area => {
        names.push(area.properties['AOI_Name_'])
      })
    }
    return names
  })

  const matchedAreas = computed(() => {
    let geoms = []
    if (intersectingAreas.value != undefined) {
      intersectingAreas.value.forEach(area => {
        geoms.push(area)
      })
    }
    return geoms
  })

  const selectedArea = computed(() => {
    return selected.value
  })

  const reportGeom = computed(() => {
    return resultGeom.value
  })

  const hasArea = computed(() => {
    return function (datasetKey) {
      return data[datasetKey].hasOwnProperty(selected.value)
    }
  })

  const fishGrowthData = computed(() => {
    let chartData = {}
    if (selected.value) {
      chartData = data['fishGrowth'][selected.value]
    }
    return chartData
  })

  const fireImpactData = computed(() => {
    let chartData = {}
    if (selected.value) {
      chartData = data['fireImpact'][selected.value]
    }
    return chartData
  })

  const hydrographData = computed(() => {
    let chartData = {}
    if (selected.value) {
      chartData = data['hydrograph'][selected.value]
    }
    return chartData
  })

  const hydroStatsData = computed(() => {
    let chartData = {}
    if (selected.value) {
      chartData = data['hydroStats'][selected.value]
    }
    return chartData
  })

  const streamTempData = computed(() => {
    let chartData = {}
    if (selected.value) {
      chartData = data['streamTemp'][selected.value]
    }
    return chartData
  })

  return {
    fetchAreaOptions,
    fetchIntersectingAreas,
    fetchResultGeom,
    areaOptions,
    intersectingAreas,
    matchedAreaNames,
    matchedAreas,
    selected,
    selectedArea,
    reportGeom,
    hasArea,
    fishGrowthData,
    fireImpactData,
    hydrographData,
    hydroStatsData,
    streamTempData,
    reset,
  }
})
