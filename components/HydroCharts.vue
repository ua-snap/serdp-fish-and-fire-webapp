<template>
  <h1 class="title">Hydrology</h1>
  <div class="columns">
    <div class="column is-half">
      <p class="is-size-5 mb-2">Hydrology Statistics</p>
      <NSelect
        v-model:value="metricSelection"
        :options="metricOptions"
        placeholder="Select metric"
        class="metric-selector"
      />
    </div>
    <div class="column is-half">
      <NRadioGroup v-model:value="periodSelection" name="period-selector">
        <p class="is-size-5 mb-2">Hydrograph Period</p>
        <NSpace>
          <NRadio
            v-for="periodOption in periodOptions"
            :key="periodOption.value"
            :value="periodOption.value"
            :label="periodOption.label"
          />
        </NSpace>
      </NRadioGroup>
    </div>
  </div>
  <div class="columns" v-for="streamOrder in streamOrders">
    <div class="column is-half">
      <div v-bind:id="'hydro-stats-chart-' + streamOrder"></div>
    </div>
    <div class="column is-half">
      <div v-bind:id="'hydrograph-chart-' + streamOrder"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.metric-selector {
  width: 300px;
}
</style>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import { NSelect, NRadioGroup, NRadio, NSpace } from 'naive-ui'
const store = useStore()

let metricSelection = ref('mean_annual_flow')
let periodSelection = ref('1')

const modelLabels = {
  ccsm: 'NCAR-CCSM4',
  gfdl: 'GFDL-CM3',
}

const metricLabels = {
  mean_annual_flow: 'Mean Annual Flow',
  LCV: 'LCV',
  LSkew: 'LSkew',
  LKurt: 'LKurt',
  AR1: 'AR1',
  Amplitude: 'Amplitude',
  phase: 'phase',
  WinterMean: 'WinterMean',
  Spring2yr: 'Spring2yr',
  Spring1pt5yr: 'Spring1pt5yr',
  Spring99: 'Spring99',
  Spring95: 'Spring95',
  Channelflow: 'Channelflow',
  CtrFlowMass: 'CtrFlowMass',
  Summer95: 'Summer95',
  Summer20p: 'Summer20p',
  MeanSummer: 'MeanSummer',
  Highlow: 'Highlow',
  flow7q10: 'flow7q10',
}

const periodLabels = {
  '1': '2038-2047',
  '2': '2068-2077',
}

const metricOptions = []
Object.keys(metricLabels).forEach(key => {
  metricOptions.push({
    label: metricLabels[key],
    value: key,
  })
})

const periodOptions = []
Object.keys(periodLabels).forEach(key => {
  periodOptions.push({
    label: periodLabels[key],
    value: key,
  })
})

const streamOrders = computed(() => {
  return Object.keys(store.hydroStatsData)
})

const renderPlot = () => {
  const symbols = {
    era: 'circle',
    ccsm: 'square',
    gfdl: 'diamond',
  }
  const colors = {
    era: '#bbbbbb',
    ccsm: '#3333ff',
    gfdl: '#ff3333',
  }

  // Add separate hydrology stat and hydrograph charts for each stream order.
  streamOrders.value.forEach(streamOrder => {
    let statsTraces = []
    let hydrographTraces = []

    // Store a historical trace for each hydrology stat stream order chart.
    statsTraces.push({
      type: 'scatter',
      mode: 'markers',
      name: 'ERA',
      x: [1, 2, 3],
      y: [
        store.hydroStatsData[streamOrder]['ccsm']['0'][metricSelection.value],
      ],
      marker: {
        symbol: symbols['era'],
        size: 7,
        color: colors['era'],
      },
    })

    if (streamOrder != -9999) {
      let daysOfYear = Object.keys(store.hydrographData[streamOrder]['era'][0])
      let hydrographPoints = []
      daysOfYear.forEach(doy => {
        hydrographPoints.push(
          store.hydrographData[streamOrder]['era'][0][doy]['streamflow']
        )
      })

      // Store a historical trace for each hydrograph stream order chart.
      hydrographTraces.push({
        mode: 'lines',
        name: 'ERA',
        x: daysOfYear,
        y: hydrographPoints,
        marker: {
          symbol: symbols['era'],
          size: 7,
          color: colors['era'],
        },
      })
    }

    let models = Object.keys(store.hydroStatsData[streamOrder])
    models.forEach(model => {
      let periods = Object.keys(store.hydroStatsData[streamOrder][model])
      let hydroStatsPoints = [null]
      for (let period = 1; period < periods.length; period++) {
        hydroStatsPoints.push(
          store.hydroStatsData[streamOrder][model][period][
            metricSelection.value
          ]
        )
      }

      // Store projected traces for each hydro stat stream order chart.
      statsTraces.push({
        type: 'scatter',
        mode: 'markers',
        name: modelLabels[model],
        x: [1, 2, 3],
        y: hydroStatsPoints,
        marker: {
          symbol: symbols[model],
          size: 7,
          color: colors[model],
        },
      })
      if (streamOrder != -9999) {
        let daysOfYear = Object.keys(
          store.hydrographData[streamOrder][model][periodSelection.value]
        )
        let hydrographPoints = []
        daysOfYear.forEach(doy => {
          hydrographPoints.push(
            store.hydrographData[streamOrder][model][periodSelection.value][
              doy
            ]['streamflow']
          )
        })

        // Store projected traces for each hydrology stream order chart.
        hydrographTraces.push({
          mode: 'lines',
          name: modelLabels[model],
          x: daysOfYear,
          y: hydrographPoints,
          marker: {
            symbol: symbols[model],
            size: 7,
            color: colors[model],
          },
        })
      }
    })

    if (store.selected) {
      const { $Plotly } = useNuxtApp()

      // Create and populate each hydro stat stream order chart with traces.
      $Plotly.newPlot(
        'hydro-stats-chart-' + streamOrder,
        statsTraces,
        {
          autosize: true,
          height: 475,
          margin: {
            l: 75,
            r: 75,
          },
          title: {
            text:
              metricLabels[metricSelection.value] +
              '<br />' +
              store.selected +
              '<br />Stream Order: ' +
              streamOrder,
          },
          xaxis: {
            tickvals: [0, 1, 2, 3],
            ticktext: ['', '2002-2018', '2038-2047', '2068-2077'],
            dtick: 1,
          },
          yaxis: {
            automargin: true,
            title: {
              text: metricLabels[metricSelection.value],
              standoff: 15,
            },
          },
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
          toImageButtonOptions: {
            filename: metricLabels[metricSelection.value]
              .toLowerCase()
              .replace(/ /g, '_'),
          },
        }
      )

      // Create and populate each hydrology stream order chart with traces.
      $Plotly.newPlot(
        'hydrograph-chart-' + streamOrder,
        hydrographTraces,
        {
          autosize: true,
          height: 475,
          margin: {
            l: 75,
            r: 75,
          },
          title: {
            text:
              'Hydrograph<br />' +
              store.selected +
              '<br />Stream Order: ' +
              streamOrder,
          },
          xaxis: {
            tickvals: [1, 91, 182, 274],
            ticktext: ['Jan', 'Apr', 'Jul', 'Oct'],
            range: [1, 365],
            dtick: 1,
          },
          yaxis: {
            automargin: true,
            title: {
              text: 'Streamflow',
              standoff: 15,
            },
          },
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
  })
}

watch(metricSelection, async () => {
  renderPlot()
})

watch(periodSelection, async () => {
  renderPlot()
})

onMounted(() => {
  renderPlot()

  // Fire resize event to trigger Plotly responsiveness.
  window.dispatchEvent(new Event('resize'))
})
</script>
