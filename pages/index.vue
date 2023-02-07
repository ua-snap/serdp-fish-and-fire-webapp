<template>
  <div class="container">
    <div>
      <div v-show="areas.selectedArea">
        <NH1>{{ areas.selectedArea }}</NH1>
      </div>
      <div class="columns mb-5">
        <div class="column is-half">
          <div id="map" style="width: 100%; height: 500px"></div>
        </div>
        <div class="column is-half">
          <div v-show="!areas.selectedArea">
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
          <div v-show="areas.selectedArea">
            <NRadioGroup
              v-model:value="fmoSelection"
              name="model-group"
              class="ml-5 mb-5"
            >
              <p class="is-size-5">Fire Management Options</p>
              <NSpace>
                <NRadio
                  v-for="fmoOption in fmoOptions"
                  :key="fmoOption.value"
                  :value="fmoOption.value"
                  :label="fmoOption.label"
                />
              </NSpace>
            </NRadioGroup>
            <div id="chart"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="areas.selectedArea">
      <NTable :bordered="false" :single-line="false" class="my-5">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in areas.tableData">
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
let fmoLabels = {
  nofmo: 'FMO #1',
  fmo: 'FMO #2',
  altfmo: 'FMO #3',
}
let modelLabels = {
  ccsm: 'NCAR-CCSM4 (RCP 8.5)',
  gfdl: 'GFDL-CM3 (RCP 8.5)',
}
export default {
  data() {
    return {
      selected: undefined,
      map: undefined,
      mapFeatures: [],
      resultMapFeature: undefined,
      fmoOptions: [
        {
          label: fmoLabels['nofmo'],
          value: 'nofmo',
        },
        {
          label: fmoLabels['fmo'],
          value: 'fmo',
        },
        {
          label: fmoLabels['altfmo'],
          value: 'altfmo',
        },
      ],
      fmoSelection: 'nofmo',
    }
  },
  updated() {
    this.map.invalidateSize()
    window.dispatchEvent(new Event('resize'))
  },
  methods: {
    select(name) {
      this.selected = name
      const areas = useAreas()
      areas.$patch({
        selected: this.selected,
      })
    },
    renderPlot() {
      const areas = useAreas()
      let historicalHighOffset =
        areas.chartData['historical']['high'] -
        areas.chartData['historical']['low']
      let traces = [
        {
          type: 'bar',
          name: 'CRU TS 4.0',
          x: '0',
          base: [areas.chartData['historical']['low']],
          y: [historicalHighOffset],
        },
      ]
      let modelSymbols = {
        ccsm: 'circle',
        gfdl: 'square',
      }
      Object.keys(areas.chartData[this.fmoSelection]).forEach(model => {
        traces.push({
          type: 'scatter',
          mode: 'markers',
          name: modelLabels[model],
          x: ['0', '1', '2'],
          y: areas.chartData[this.fmoSelection][model],
          marker: {
            symbol: modelSymbols[model],
          },
        })
      })
      if (areas.selected) {
        const { $Plotly } = useNuxtApp()
        $Plotly.newPlot(
          'chart',
          traces,
          {
            autosize: true,
            height: 475,
            margin: {
              l: 50,
              r: 50,
              b: 75,
              t: 120,
              pad: 5,
            },
            title: {
              text:
                'Riparian Fire Vulnerability<br />' +
                this.selected +
                '<br />' +
                fmoLabels[this.fmoSelection],
            },
            xaxis: {
              tickvals: [0, 1, 2],
              ticktext: ['2002-2018', '2038-2047', '2068-2077'],
              dtick: 1,
            },
            bargap: 0.9,
          },
          {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
              'zoom2d',
              'pan2d',
              'select2d',
              'lasso2d',
              'zoomIn2d',
              'zoomOut2d',
              'autoScale2d',
              'resetScale2d',
            ],
          }
        )
      }
    },
  },
  watch: {
    selected: function (value) {
      const areas = useAreas()
      if (!areas.selectedArea && this.resultMapFeature != undefined) {
        this.resultMapFeature.clearLayers()
        this.resultMapFeature = null
      }
      this.mapFeatures.forEach(feature => {
        feature.clearLayers()
      })
      if (this.resultMapFeature) {
        this.resultMapFeature.clearLayers()
      }
      areas.$patch({
        selected: value,
      })
      if (!this.selected) {
        this.mapFeatures = []
        areas.matchedGeoms.forEach(polygon => {
          this.mapFeatures.push(L.geoJSON(polygon).addTo(this.map))
        })
        this.map.setView([64.8, -146.4], 3)
      }
      if (areas.selectedArea) {
        areas.fetchResultGeom().then(() => {
          this.resultMapFeature = L.geoJSON(areas.reportGeom).addTo(this.map)
          this.map.fitBounds(this.resultMapFeature.getBounds())
          this.renderPlot()
        })
      }
    },
    fmoSelection: function () {
      this.renderPlot()
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
