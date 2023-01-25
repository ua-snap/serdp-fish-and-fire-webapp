<template>
  <div class="container">
    <div class="columns">
      <div class="column">
        <client-only>
          <NSelect
            v-model:value="value"
            filterable
            :options="areas.areaOptions"
            placeholder="Select an area of interest"
            class="mb-5"
          />
        </client-only>
        <p class="mb-5">Click the map to find areas of interest.</p>
        <div class="list">
          <li v-for="areaName in areas.matchedAreaNames" class="list-item">
            {{ areaName }}
          </li>
        </div>
      </div>
      <div class="column">
        <div id="map" style="width: 100%; height: 500px"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAreas } from '~/stores/areas'
const areas = useAreas()
areas.fetchAreaOptions()
</script>

<script lang="ts">
export default {
  data() {
    return {
      value: undefined,
      map: undefined,
      mapFeatures: [],
    }
  },
  mounted() {
    var proj = new L.Proj.CRS(
      'EPSG:3338',
      '+proj=aea +lat_1=55 +lat_2=65 +lat_0=50 +lon_0=-154 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
      {
        resolutions: [4096, 2048, 1024, 512, 256, 128, 64],
      }
    )

    this.map = L.map('map', {
      zoom: 3,
      minZoom: 1,
      maxZoom: 6,
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

    const areas = useAreas()
    this.map.on('click', e => {
      var popLocation = e.latlng
      areas.fetchIntersectingAreas(e.latlng.lat, e.latlng.lng).then(() => {
        this.mapFeatures.forEach(feature => {
          feature.clearLayers()
        })
        areas.matchedGeoms.forEach(polygon => {
          this.mapFeatures.push(L.geoJSON(polygon).addTo(this.map))
        })
      })
    })
  },
}
</script>
