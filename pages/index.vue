<template>
  <div class="container">
    <div v-show="!areas.selectedArea">
      <div class="columns">
        <div class="column">
          <client-only>
            <NSelect
              v-model:value="selected"
              v-if="!areas.selectedArea"
              filterable
              :options="areas.areaOptions"
              placeholder="Select an area of interest"
              class="mb-5"
            />
          </client-only>
          <p class="mb-5">Click the map to find areas of interest.</p>
          <div class="list">
            <li v-for="areaName in areas.matchedAreaNames" class="list-item">
              <a @click="select(areaName)">{{ areaName }}</a>
            </li>
          </div>
        </div>
        <div class="column">
          <div id="map" style="width: 100%; height: 500px"></div>
        </div>
      </div>
    </div>
    <div v-show="areas.selectedArea">
      <NH1>{{ areas.selectedArea }}</NH1>
      <NButton @click="select(null)">Go Back</NButton>
      <NTable :bordered="false" :single-line="false" class="my-5">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in areas.selectedAreaData">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </NTable>
      <NButton @click="select(null)">Go Back</NButton>
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
      selected: undefined,
      map: undefined,
      mapFeatures: [],
    }
  },
  updated() {
    this.map.invalidateSize()
  },
  methods: {
    select(name) {
      this.selected = name
      const areas = useAreas()
      areas.$patch({
        selected: this.selected,
      })
    },
  },
  watch: {
    selected: function (value) {
      const areas = useAreas()
      areas.$patch({
        selected: value,
      })
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
