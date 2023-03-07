import { defineStore } from 'pinia'
import areaData from '~/assets/data'

export const useStore = defineStore('store', () => {
  const areas = ref([])
  const intersectingAreas = ref(undefined)
  const selected = ref(undefined)
  const resultGeom = ref(undefined)

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

  const matchedGeoms = computed(() => {
    let geoms = []
    if (intersectingAreas.value != undefined) {
      intersectingAreas.value.forEach(area => {
        geoms.push(area.geometry)
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

  // The chartData function adds more structure to the data imported from
  // data.json. data.json contains a flat list of key/value pairs for each AOI.
  // This function bundles the data into a structure for each AOI to make it
  // easier to use the data with Plotly. The data will be used to draw a
  // historical point (neutral) with high/low error bars, and two projected
  // data points for each FMO scenario and model. Projected data arrays for
  // each FMO scenario and model start with a null value to create an x-axis
  // offset from the historical data.
  //
  // The structure for each AOI will look like this:
  // {
  //   historical: {
  //     low: ...,
  //     neutral: ...,
  //     high: ...,
  //   },
  //   nofmo: {
  //     gfdl: [null, ...],
  //     ccsm: [null, ...],
  //   },
  //   fmo: {
  //     gfdl: [null, ...],
  //     ccsm: [null, ...],
  //   },
  //   altfmo: {
  //     gfdl: [null, ...],
  //     ccsm: [null, ...],
  //   },
  // }
  const chartData = computed(() => {
    let matchedData = undefined
    let chartData = {}
    if (selected.value) {
      areaData.forEach(obj => {
        if (obj['AOI_Name_'] == selected.value) {
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
        neutral: matchedData['neutral'],
        high: matchedData['high_scenario'],
      }
    }
    return chartData
  })

  // Think of the tableData function as the opposite of the chartData function.
  // It copies all of the remaining AOI key/value pairs from data.json that are
  // not involved in populating the chart, into a new object to be passed to
  // the results table.
  const tableData = computed(() => {
    let matchedData = undefined
    areaData.forEach(obj => {
      if (obj['AOI_Name_'] == selected.value) {
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
          !key.includes('_scenario') &&
          !key.includes('neutral')
        ) {
          tableData[key] = matchedData[key]
        }
      })
    }
    return tableData
  })

  return {
    fetchAreaOptions,
    fetchIntersectingAreas,
    fetchResultGeom,
    areaOptions,
    matchedAreaNames,
    matchedGeoms,
    selected,
    selectedArea,
    reportGeom,
    chartData,
    tableData,
  }
})
