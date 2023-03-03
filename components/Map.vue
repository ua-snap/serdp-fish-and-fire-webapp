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

const map = ref(undefined)
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
      mapFeatures.value.push(L.geoJSON(polygon).addTo(map.value))
    })
    map.value.setView([64.8, -146.4], 3)
  }
  if (selectedArea.value) {
    store.fetchResultGeom().then(() => {
      resultMapFeature.value = L.geoJSON(store.reportGeom).addTo(map.value)
      map.value.fitBounds(resultMapFeature.value.getBounds())
    })
  }
}

watch(selectedArea, async () => {
  updateMap()
})

onMounted(() => {
  const proj = new L.Proj.CRS(
    'EPSG:3338',
    '+proj=aea +lat_1=55 +lat_2=65 +lat_0=50 +lon_0=-154 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
    {
      resolutions: [4096, 2048, 1024, 512, 256, 128, 64],
    }
  )

  if (map.value == undefined) {
    map.value = L.map('map', {
      zoom: 3,
      minZoom: 1,
      maxZoom: 6,
      zoomSnap: 0.1,
      center: [64.8, -146.4],
      scrollWheelZoom: false,
      crs: proj,
      layers: new L.tileLayer.wms('https://gs.mapventure.org/geoserver/wms', {
        transparent: true,
        srs: 'EPSG:3338',
        format: 'image/png',
        version: '1.3.0',
        layers: [
          'atlas_mapproxy:alaska_osm_retina',
          'shadow_mask:iem_with_ak_aleutians_symmetric_difference',
        ],
      }),
    })
  }

  map.value.on('click', e => {
    var popLocation = e.latlng
    store.fetchIntersectingAreas(e.latlng.lat, e.latlng.lng).then(() => {
      mapFeatures.value.forEach(feature => {
        feature.clearLayers()
      })
      store.matchedGeoms.forEach(polygon => {
        mapFeatures.value.push(L.geoJSON(polygon).addTo(map.value))
      })
    })
  })
})

onMounted(() => {
  map.value.invalidateSize()
})
</script>
