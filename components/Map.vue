<template>
  <div id="map" />
</template>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 500px;
}
/* Remove rectangular border around clicked polygon */
:deep(path.leaflet-interactive:focus) {
  outline: none;
}
</style>

<script setup lang="ts">
import { useStore } from '~/stores/store'
const { $turfArea } = useNuxtApp()
const store = useStore()

var map = undefined // Leaflet map object
var polygonBounds = undefined
var maxBounds = undefined
var layerGroup = new L.LayerGroup()

const resultMapFeature = ref(undefined)
const selectedArea = computed(() => store.selectedArea)
const reset = computed(() => store.reset)

const updateMap = () => {
  // Clear selected polygon
  if (!selectedArea.value && !resultMapFeature.value != undefined) {
    resultMapFeature.value.clearLayers()
    resultMapFeature.value = undefined
  }

  // Restore intersecting polygons from previous click operation
  if (!selectedArea.value) {
    layerGroup.addTo(map)
  } else {
    map.removeLayer(layerGroup)
  }

  if (selectedArea.value) {
    store.fetchResultGeom().then(() => {
      resultMapFeature.value = L.geoJSON(store.reportGeom).addTo(map)
      map.fitBounds(resultMapFeature.value.getBounds(), { padding: [50, 50] })
    })
  }

  if (selectedArea.value == undefined) {
    fitAllPolygons()
    map.invalidateSize()
  }
}

const fitAllPolygons = () => {
  map.fitBounds(polygonBounds)
}

watch(selectedArea, async () => {
  updateMap()
})

watch(reset, async () => {
  if (reset.value == true) {
    layerGroup.clearLayers()
    store.$patch({
      reset: false,
      intersectingAreas: [],
    })
    addMapHandlers()
  }
})

onMounted(() => {
  // polygonBounds is a bounding box around all available AOI polygons.
  polygonBounds = L.latLngBounds([63.5, -149.5], [66, -143.5])

  // Add some buffer space to polygonBounds for maxBounds. We need maxBounds to
  // be slightly larger to add enough wiggle room for any selected AOI polygon
  // to be centered properly on the map on the report view.
  let latBuffer = 1
  let lngBuffer = 2
  maxBounds = L.latLngBounds([
    [polygonBounds.getSouth() - latBuffer, polygonBounds.getWest() - lngBuffer],
    [polygonBounds.getNorth() + latBuffer, polygonBounds.getEast() + lngBuffer],
  ])

  var baseLayer = new L.tileLayer.wms(
    'https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
    {
      layers: '0',
      format: 'image/png',
      transparent: true,
      attribution: 'USGS',
      baseLayer: true,
    }
  )
  if (map == undefined) {
    map = L.map('map', {
      minZoom: 4,
      zoomSnap: 0.1,
      maxBounds: maxBounds,
      scrollWheelZoom: false,
      layers: [baseLayer],
    })
  }
  fitAllPolygons()
  addMapHandlers()
})

const addMapHandlers = () => {
  map.on('click', e => {
    layerGroup.addTo(map)
    store.fetchIntersectingAreas(e.latlng.lat, e.latlng.lng).then(() => {
      if (store.matchedAreas.length > 0) {
        map.off('click')
        addMatchedAreas()
      }
    })
  })
}

const addMatchedAreas = () => {
  // Calculate the area (size) of each polygon.
  let areasWithSizes = store.matchedAreas.map(area => {
    return {
      area: area,
      size: $turfArea(area.geometry),
    }
  })

  // Sort areas by polygon size (largest to smallest).
  let sortedAreas = areasWithSizes
    .sort((a, b) => {
      return b.size - a.size
    })
    .map(areaWithSize => {
      return areaWithSize.area
    })

  // Add polygons to map starting with largest polygon, effectively placing
  // larger polygons at a lower z-index. This ensures that large polygons
  // do not completely overlap smaller polygons so that small polygons
  // remain hoverable.
  sortedAreas.forEach(area => {
    addArea(area)
  })
}

const addArea = area => {
  let defaultStyle = {
    color: '#09a3ea',
    fillOpacity: 0.2,
  }

  let highlightedStyle = {
    color: '#fcf1b5',
    fillOpacity: 0.9,
  }
  area.geometry.properties = {
    id: area.properties['AOI_Name_'],
    name: area.properties['AOI_Name_'],
  }
  layerGroup.addLayer(
    L.geoJSON(area.geometry, {
      style: defaultStyle,
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name)
        layer.on({
          mouseover: e => {
            let layer = e.target
            layer.setStyle(highlightedStyle)
          },
          mouseout: e => {
            let layer = e.target
            layer.setStyle(defaultStyle)
            layer.closeTooltip()
          },
          click: e => {
            layer.setStyle(defaultStyle)
            store.$patch({
              selected: feature.properties.name,
            })
          },
        })
      },
    })
  )
}

onUpdated(() => {
  fitAllPolygons()
})
</script>
