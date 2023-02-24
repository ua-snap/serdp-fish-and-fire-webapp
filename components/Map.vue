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
        this.map.setView([64.8, -146.4], 3)
      }
      if (this.selectedArea) {
        store.fetchResultGeom().then(() => {
          this.resultMapFeature = L.geoJSON(store.reportGeom).addTo(this.map)
          this.map.fitBounds(this.resultMapFeature.getBounds())
        })
      }
    },
  },
  mounted() {
    var proj = new L.Proj.CRS(
      'EPSG:3338',
      '+proj=aea +lat_1=55 +lat_2=65 +lat_0=50 +lon_0=-154 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
      {
        resolutions: [4096, 2048, 1024, 512, 256, 128, 64],
      }
    )

    if (this.map == undefined) {
      this.map = L.map('map', {
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
