<template>
  <section class="section content is-size-5">
    <h2 class="title">Stream Temperature</h2>
    <p>
      This section summarizes future projections of ecologically relevant stream
      temperature metrics. Future projections are presented for two specific
      climate models (NCAR-CCSM4 and GFDL-CM3), compared with a historical
      dataset (ERA-Interim Reanalysis). Results are presented as means for
      different stream orders within the selected area of interest. Only stream
      reaches containing adequate habitat for juvenile Chinook salmon are
      included (based on a model of underlying geomorphology,
      <a
        href="https://www.fs.usda.gov/pnw/pubs/journals/pnw_2007_burnett001.pdf"
        >described here</a
      >). These stream temperature projections take future climate into account,
      but do not incorporate future wildfire. Although models projected a range
      of probabilistic future temperatures, only the mean values are shown in
      this visualization for simplicity.
    </p>
    <p>
      Stream temperature data for this and all other areas is available as a
      <a
        href="https://raw.githubusercontent.com/ua-snap/serdp-fish-and-fire-webapp/main/scripts/input/Stream_Temp_Stats_by_AOI.csv"
        >downloadable CSV</a
      >.
    </p>
  </section>
  <div class="columns">
    <div class="column is-half">
      <p class="is-size-5 mb-2">Stream Temperature Statistics</p>
      <NSelect
        v-model:value="metricSelection"
        :options="metricOptions"
        placeholder="Select metric"
        class="metric-selector"
      />
    </div>
  </div>
  <div class="is-clearfix">
    <div
      v-for="streamOrder in streamOrders"
      v-bind:id="'stream-temp-chart-' + streamOrder"
      class="stream-temp-chart is-pulled-left"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.metric-selector {
  width: 300px;
}
.stream-temp-chart {
  @media (max-width: 1023px) {
    width: 100%;
  }
  @media (min-width: 1024px) {
    width: 50%;
  }
}
</style>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import chartUtils from '~/utils/chartUtils'
import { NSelect } from 'naive-ui'
const route = useRoute()
const store = useStore()

let metricSelection = ref('mean_ann')

const modelLabels = {
  ccsm: 'NCAR-CCSM4',
  gfdl: 'GFDL-CM3',
}

const metricLabels = {
  mean_ann: 'Mean annual temperature',
  min_ann: 'Minimum annual temperature',
  max_ann: 'Maximum annual temperature',
  gsdd: 'Growing season degree days',
  mean_apr: 'Mean April temperature',
  mean_may: 'Mean May temperature',
  mean_jun: 'Mean June temperature',
  mean_jul: 'Mean July temperature',
  mean_aug: 'Mean August temperature',
  mean_sep: 'Mean September temperature',
  mean_oct: 'Mean October temperature',
}

const unitLabels = {
  temperature: 'Temperature (°C)',
  degree_days: 'Degree Days (°C⋅days)',
}

const yAxisLabels = {
  mean_ann: unitLabels['temperature'],
  min_ann: unitLabels['temperature'],
  max_ann: unitLabels['temperature'],
  gsdd: unitLabels['degree_days'],
  mean_apr: unitLabels['temperature'],
  mean_may: unitLabels['temperature'],
  mean_jun: unitLabels['temperature'],
  mean_jul: unitLabels['temperature'],
  mean_aug: unitLabels['temperature'],
  mean_sep: unitLabels['temperature'],
  mean_oct: unitLabels['temperature'],
}

const metricOptions = []
Object.keys(metricLabels).forEach(key => {
  metricOptions.push({
    label: metricLabels[key],
    value: key,
  })
})

const streamOrders = computed(() => {
  return Object.keys(store.areaData['streamTemp'])
})

const yAxisRange = computed(() => {
  // Collect all values in this array to be used to determine shared min/max
  // values for y-axis range across all fish growth charts.
  let allValues = []

  streamOrders.value.forEach(streamOrder => {
    let historicalValue =
      store.areaData['streamTemp'][streamOrder]['ccsm']['0'][
        metricSelection.value
      ]
    allValues.push(historicalValue)

    let models = Object.keys(store.areaData['streamTemp'][streamOrder])
    models.forEach(model => {
      let periods = Object.keys(
        store.areaData['streamTemp'][streamOrder][model]
      )
      for (let period = 1; period < periods.length; period++) {
        let projectedValue =
          store.areaData['streamTemp'][streamOrder][model][period][
            metricSelection.value
          ]
        allValues.push(projectedValue)
      }
    })
  })

  let minValue = Math.min.apply(Math, allValues)
  let maxValue = Math.max.apply(Math, allValues)

  // Add some padding above/below min/max so plot markers don't get cropped.
  minValue -= minValue > 0 ? minValue * 0.03 : maxValue * 0.03
  maxValue += maxValue * 0.03

  return [minValue, maxValue]
})

const renderPlot = () => {
  const symbols = {
    era: 'circle',
    ccsm: 'square',
    gfdl: 'diamond',
  }
  const colors = {
    era: '#333333',
    ccsm: '#3333ff',
    gfdl: '#ff3333',
  }

  // Add a separate chart for each available stream order.
  streamOrders.value.forEach(streamOrder => {
    if (
      store.areaData['streamTemp'][streamOrder]['ccsm'] == undefined ||
      store.areaData['streamTemp'][streamOrder]['ccsm']['0'] == undefined
    ) {
      return
    }

    let traces = []

    // Store historical trace.
    traces.push({
      type: 'scatter',
      mode: 'markers',
      name: 'ERA-Interim',
      x: [1, 2, 3],
      y: [
        store.areaData['streamTemp'][streamOrder]['ccsm']['0'][
          metricSelection.value
        ],
      ],
      marker: {
        symbol: symbols['era'],
        size: 7,
        color: colors['era'],
      },
    })
    let models = Object.keys(store.areaData['streamTemp'][streamOrder])

    // Store projected traces.
    models.forEach(model => {
      let periods = Object.keys(
        store.areaData['streamTemp'][streamOrder][model]
      )
      let traceValues = [null]
      for (let period = 1; period < periods.length; period++) {
        traceValues.push(
          store.areaData['streamTemp'][streamOrder][model][period][
            metricSelection.value
          ]
        )
      }
      traces.push({
        type: 'scatter',
        mode: 'markers',
        name: modelLabels[model],
        x: [1, 2, 3],
        y: traceValues,
        marker: {
          symbol: symbols[model],
          size: 7,
          color: colors[model],
        },
      })
    })

    const { $Plotly } = useNuxtApp()

    let areaString = store.aoiName
    areaString = chartUtils.wordwrapString(areaString)

    let chartTitle =
      '<b>' +
      metricLabels[metricSelection.value] +
      '</b>' +
      '<br />' +
      areaString +
      '<br />Stream Order: ' +
      streamOrder

    // Create and populate chart with traces.
    $Plotly.newPlot(
      'stream-temp-chart-' + streamOrder,
      traces,
      {
        autosize: true,
        height: 475,
        margin: {
          t: chartUtils.topPadding(chartTitle),
          l: 75,
          r: 75,
        },
        title: {
          text: chartTitle,
          y: 0.95,
        },
        xaxis: {
          tickvals: [0, 1, 2, 3],
          ticktext: ['', '2002-2018', '2038-2047', '2068-2077'],
          dtick: 1,
        },
        yaxis: {
          automargin: true,
          title: {
            text: yAxisLabels[metricSelection.value],
            standoff: 15,
          },
          range: yAxisRange.value,
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
          scale: 2,
        },
      }
    )
  })
}

watch(metricSelection, async () => {
  renderPlot()
})

onMounted(() => {
  renderPlot()
  // Fire resize event to trigger Plotly responsiveness.
  window.dispatchEvent(new Event('resize'))
})
</script>
