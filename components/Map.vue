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
</script>

<script lang="ts">
export default {
  data() {
    return {
      map: undefined,
      mapFeatures: [],
      resultMapFeature: undefined,
      maxBounds: undefined,
    }
  },
  computed: {
    selectedArea() {
      const store = useStore()
      return store.selectedArea
    },
  },
  updated() {
    this.map.invalidateSize()
    this.fitAllPolygons()
  },
  watch: {
    selectedArea: {
      handler: function () {
        this.updateMap()
      },
    },
  },
  methods: {
    updateMap() {
      const store = useStore()

      // Clear layer(s)
      if (!this.selectedArea && !this.resultMapFeature != undefined) {
        this.resultMapFeature.clearLayers()
        this.resultMapFeature = undefined
      }
      this.mapFeatures.forEach(feature => {
        feature.clearLayers()
      })

      // Add layer(s)
      if (!this.selectedArea) {
        this.mapFeatures = []
        store.matchedGeoms.forEach(polygon => {
          this.mapFeatures.push(L.geoJSON(polygon).addTo(this.map))
        })
        this.fitAllPolygons()
      }
      if (this.selectedArea) {
        store.fetchResultGeom().then(() => {
          this.resultMapFeature = L.geoJSON(store.reportGeom).addTo(this.map)
          this.map.fitBounds(this.resultMapFeature.getBounds())
        })
      }
    },
    fitAllPolygons() {
      this.map.fitBounds(this.maxBounds)
    },
  },
  mounted() {
    this.maxBounds = L.latLngBounds([
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
    if (this.map == undefined) {
      this.map = L.map('map', {
        minZoom: 4,
        maxZoom: 9,
        zoomSnap: 0.1,
        maxBounds: this.maxBounds,
        scrollWheelZoom: false,
        layers: [baseLayer],
      })
    }
    this.fitAllPolygons()
    const store = useStore()
    this.map.on('click', e => {
      var popLocation = e.latlng
      store.fetchIntersectingAreas(e.latlng.lat, e.latlng.lng).then(() => {
        this.mapFeatures.forEach(feature => {
          feature.clearLayers()
        })
        store.matchedGeoms.forEach(polygon => {
          this.mapFeatures.push(L.geoJSON(polygon).addTo(this.map))
        })
      })
    })
  },
}
</script>
