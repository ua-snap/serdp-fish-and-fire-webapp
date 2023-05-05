import { defineStore } from 'pinia'

export const useStore = defineStore('store', () => {
  const areas = ref([])
  const intersectingAreas = ref(undefined)
  const selected = ref(undefined)
  const resultGeom = ref(undefined)
  const areaData = ref({})
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
      let geoserverUrl =
        runtimeConfig.public.geoserverUrl + '&PropertyName=(AOI_Name_,Category)'
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

  const fetchResultData = async () => {
    let areaName = selected.value

    // Combine repeated spaces and convert unsafe characters to underscores.
    // These same string operations are performed when the JSON files are
    // generated in csv2json.py.
    let fileSafe = areaName.replace(/ +/g, ' ')
    fileSafe = fileSafe.replace(/[ :()]/g, '_')

    let datasets = [
      { subdir: 'fish_growth', dictKey: 'fishGrowth' },
      { subdir: 'riparian_fire_impact', dictKey: 'fireImpact' },
      { subdir: 'hydrograph_data', dictKey: 'hydrograph' },
      { subdir: 'hydrology_stats', dictKey: 'hydroStats' },
      { subdir: 'stream_temp_stats', dictKey: 'streamTemp' },
    ]

    datasets.forEach(dataset => {
      let subdir = dataset['subdir']
      try {
        import(`../assets/data/${subdir}/${fileSafe}.json`).then(module => {
          areaData.value[dataset.dictKey] = module.default
        })
      } catch (error) {
        console.log(error)
      }
    })
  }

  const fetchResultGeom = async () => {
    try {
      const runtimeConfig = useRuntimeConfig()
      let geoserverUrl =
        runtimeConfig.public.geoserverUrl +
        "&cql_filter=AOI_Name_='" +
        encodeURIComponent(selected.value) +
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

  return {
    fetchAreaOptions,
    fetchIntersectingAreas,
    fetchResultData,
    fetchResultGeom,
    areaOptions,
    intersectingAreas,
    matchedAreaNames,
    matchedAreas,
    selected,
    selectedArea,
    areaData,
    reportGeom,
    reset,
  }
})
