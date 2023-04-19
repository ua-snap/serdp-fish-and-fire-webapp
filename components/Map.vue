<template>
  <div id="map" />
</template>

<style scoped>
#map {
  width: 100%;
  height: 500px;
}
</style>

<script setup lang="ts">
import { useStore } from '~/stores/store'
const store = useStore()

var map = undefined // Leaflet map object
var maxBounds = undefined
const mapFeatures = ref([])
const resultMapFeature = ref(undefined)
const selectedArea = computed(() => store.selectedArea)

const updateMap = () => {
  // Clear layer(s)
  if (!selectedArea.value && !resultMapFeature.value != undefined) {
    resultMapFeature.value.clearLayers()
    resultMapFeature.value = undefined
  }
  mapFeatures.value.forEach(feature => {
    feature.clearLayers()
  })

  // Add layer(s)
  if (!selectedArea.value) {
    mapFeatures.value = []
    store.matchedGeoms.forEach(polygon => {
      mapFeatures.value.push(L.geoJSON(polygon).addTo(map))
    })
  }
  if (selectedArea.value) {
    store.fetchResultGeom().then(() => {
      resultMapFeature.value = L.geoJSON(store.reportGeom).addTo(map)
      map.fitBounds(resultMapFeature.value.getBounds())
    })
  }

  if (selectedArea.value == undefined) {
    fitAllPolygons()
  }
}

const fitAllPolygons = () => {
  map.fitBounds(maxBounds)
}

watch(selectedArea, async () => {
  updateMap()
})

onMounted(() => {
  maxBounds = L.latLngBounds([
    [63.5, -149.5],
    [66, -143.5],
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
      maxZoom: 9,
      zoomSnap: 0.1,
      maxBounds: maxBounds,
      scrollWheelZoom: false,
      layers: [baseLayer],
    })
  }
  fitAllPolygons()
  map.on('click', e => {
    var popLocation = e.latlng
    store.fetchIntersectingAreas(e.latlng.lat, e.latlng.lng).then(() => {
      mapFeatures.value.forEach(feature => {
        feature.clearLayers()
      })
      store.matchedGeoms.forEach(polygon => {
        mapFeatures.value.push(L.geoJSON(polygon).addTo(map))
      })
    })
  })
})

onUpdated(() => {
  map.invalidateSize()
  fitAllPolygons()
})
</script>
