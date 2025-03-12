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
.leaflet-container {
  cursor: not-allowed !important;
}
</style>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import boundaryJson from '~/assets/boundary.json'

const { $turfArea } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const store = useStore()

var map = undefined // Leaflet map object
var polygonBounds = undefined
var maxBounds = undefined
var layerGroup = new L.LayerGroup()
var boundaryLayer = undefined
var shadowMask = undefined
var marker = undefined

const resultMapFeature = ref(undefined)
const reset = computed(() => store.reset)

const updateMap = () => {
  // Restore intersecting polygons from previous click operation
  if (route.params.hash == undefined) {
    layerGroup.addTo(map)
    map.addLayer(shadowMask)
  } else {
    map.removeLayer(layerGroup)
    map.removeLayer(shadowMask)
  }

  if (route.params.hash != undefined) {
    store.fetchResultGeom().then(() => {
      resultMapFeature.value = L.geoJSON(store.reportGeom).addTo(map)
      map.fitBounds(resultMapFeature.value.getBounds(), { padding: [50, 50] })
    })
  }
}

const fitAllPolygons = () => {
  map.fitBounds(polygonBounds)
}

watch(reset, async () => {
  if (reset.value == true) {
    layerGroup.clearLayers()
    if (marker != undefined) {
      map.removeLayer(marker)
      marker = undefined
    }
    store.$patch({
      reset: false,
      intersectingAreas: [],
      point: {
        lat: undefined,
        lng: undefined,
      },
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

  const runtimeConfig = useRuntimeConfig()
  let geoserverUrl = runtimeConfig.public.geoserverUrl
  shadowMask = new L.tileLayer.wms(geoserverUrl + '/wms', {
    transparent: true,
    format: 'image/png',
    version: '1.3.0',
    layers: ['fish_and_fire:AOIs_shadowmask'],
  })

  if (map == undefined) {
    map = L.map('map', {
      minZoom: 4,
      zoomSnap: 0.1,
      doubleClickZoom: false,
      maxBounds: maxBounds,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      layers: [baseLayer, shadowMask],
    })
  }

  updateMap()
  fitAllPolygons()
  addMapHandlers()
})

const addMapHandlers = () => {
  boundaryLayer = L.geoJSON(boundaryJson, {
    onEachFeature: function (feature, layer) {
      layer.on('click', e => {
        if (
          marker == undefined &&
          store.matchedAreaNames.length == 0 &&
          route.params.hash == undefined
        ) {
          let lat = e.latlng.lat
          let lng = e.latlng.lng
          store.$patch({
            point: {
              lat: lat.toFixed(2),
              lng: lng.toFixed(2),
            },
          })
          layerGroup.addTo(map)
          marker = L.marker([lat, lng]).addTo(map)
          store.fetchIntersectingAreas(lat, lng).then(() => {
            if (store.matchedAreas.length > 0) {
              boundaryLayer.off('click')
              addMatchedAreas()
            }
          })
        }
      })
    },
    style: {
      opacity: 0.0,
      fillOpacity: 0.0,
    },
  }).addTo(map)
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
            select(feature.properties.name)
          },
        })
      },
    })
  )
}

onUpdated(() => {
  fitAllPolygons()
})

const select = name => {
  let hash = store.hashFromName(name)
  router.push({
    path: 'report/' + hash,
  })
}
</script>
