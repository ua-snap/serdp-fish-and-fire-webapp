<template>
  <section class="section content is-size-5">
    <h1 class="title">Hydrology</h1>
    <p>
      This section shows streamflow metrics and mean daily streamflow
      (m<sup>3</sup>/s) projections compared with a historical dataset (ERA) for
      two climate models (NCAR-CCSM4; GFDL-CM3). Historic and future streamflow
      projections were calculated using the
      <a
        href="https://ral.ucar.edu/sites/default/files/public/projects/wrf_hydro/technical-description-user-guide/wrf-hydro-v5.1.1-technical-description.pdf"
        >WRF-Hydro Modeling System</a
      >. The
      <a
        href="https://www.researchgate.net/publication/259542586_An_Objective_and_Parsimonious_Approach_for_Classifying_Natural_Flow_Regimes_at_a_Continental_Scale"
        >seven fundamental daily streamflow statistics</a
      >
      (FDSS) describe properties of the flow regime (e.g.; timing, magnitude,
      duration, rate of change) and can be used to classify streams and detect
      hydrologic alteration. The
      <a
        href="https://www.researchgate.net/profile/Seth-Wenger/publication/228975973_Macroscale_hydrologic_modeling_of_ecologically_relevant_flow_metrics/links/00b495241a477d175b000000/Macroscale-hydrologic-modeling-of-ecologically-relevant-flow-metrics.pdf"
        >ecologically relevant</a
      >
      (ER) streamflow metrics are hypothesized to influence the distribution and
      recruitment of salmonid fishes. Results are presented as multi-year means
      for each stream order within the selected management units. These
      calculations were based on the annual water year, which runs from October
      1 to September 30.
    </p>
    <p>In the charts below, MAF stands for mean annual flow.</p>
  </section>
  <div class="columns is-desktop">
    <div class="column is-half-desktop">
      <p class="is-size-5 mb-2">Hydrology Statistics</p>
      <NSelect
        v-model:value="metricSelection"
        :options="metricOptions"
        placeholder="Select metric"
        class="metric-selector"
      />
    </div>
    <div class="column is-half-desktop">
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
  <div class="columns is-desktop" v-for="streamOrder in streamOrders">
    <div class="column is-half-desktop">
      <div v-bind:id="'hydro-stats-chart-' + streamOrder"></div>
    </div>
    <div class="column is-half-desktop">
      <div v-bind:id="'hydrograph-chart-' + streamOrder"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import { NSelect, NRadioGroup, NRadio, NSpace } from 'naive-ui'
import chartUtils from '~/utils/chartUtils'
const route = useRoute()
const store = useStore()

let metricSelection = ref('mean_annual_flow')
let periodSelection = ref('1')

const modelLabels = {
  ccsm: 'NCAR-CCSM4',
  gfdl: 'GFDL-CM3',
}

const metricLabels = {
  mean_annual_flow: 'Mean annual flow',
  LCV: 'Coefficient of variation',
  LSkew: 'Skewness',
  LKurt: 'Kurtosis',
  AR1: 'AR1',
  Amplitude: 'Amplitude',
  phase: 'Phase',
  MeanSummer: 'Mean summer flow',
  WinterMean: 'Mean winter flow',
  Spring2yr: 'Frequency of spring 2 year high flows',
  Spring1pt5yr: 'Frequency of spring 1.5 year high flows',
  Spring99: 'Number of days spring flows were in the top 1% of annual flows',
  Spring95: 'Number of days spring flows were in the top 5% of annual flows',
  CtrFlowMass: 'Center of timing of the mass of flow for an annual water year',
  Summer95: 'Number of days summer flows were in the top 5% of annual flows',
  Summer20p:
    'Number of days summer flows were less than 20% of the mean annual flow',
  Highlow:
    'Annual 1.5 year high flow probability divided by the mean summer flow',
  flow7q10: '7 day low flow with a 10 year return interval',
}

const metricOptions = [
  {
    type: 'group',
    label: 'Seven fundamental daily streamflow statistics (FDSS)',
    key: 'Seven fundamental daily streamflow statistics (FDSS)',
    children: [
      {
        label: metricLabels['mean_annual_flow'],
        value: 'mean_annual_flow',
      },
      {
        label: metricLabels['LCV'],
        value: 'LCV',
      },
      {
        label: metricLabels['LSkew'],
        value: 'LSkew',
      },
      {
        label: metricLabels['LKurt'],
        value: 'LKurt',
      },
      {
        label: metricLabels['AR1'],
        value: 'AR1',
      },
      {
        label: metricLabels['Amplitude'],
        value: 'Amplitude',
      },
      {
        label: metricLabels['phase'],
        value: 'phase',
      },
    ],
  },
  {
    type: 'group',
    label: 'Ecologically relevant (ER)',
    key: 'Ecologically relevant (ER)',
    children: [
      {
        label: metricLabels['MeanSummer'],
        value: 'MeanSummer',
      },
      {
        label: metricLabels['WinterMean'],
        value: 'WinterMean',
      },
      {
        label: metricLabels['Spring2yr'],
        value: 'Spring2yr',
      },
      {
        label: metricLabels['Spring1pt5yr'],
        value: 'Spring1pt5yr',
      },
      {
        label: metricLabels['Spring99'],
        value: 'Spring99',
      },
      {
        label: metricLabels['Spring95'],
        value: 'Spring95',
      },
      {
        label: metricLabels['CtrFlowMass'],
        value: 'CtrFlowMass',
      },
      {
        label: metricLabels['Summer95'],
        value: 'Summer95',
      },
      {
        label: metricLabels['Summer20p'],
        value: 'Summer20p',
      },
      {
        label: metricLabels['Highlow'],
        value: 'Highlow',
      },
      {
        label: metricLabels['flow7q10'],
        value: 'flow7q10',
      },
    ],
  },
]

const metricYAxisLabels = {
  mean_annual_flow: 'Mean annual flow (m<sup>3</sup>/s)',
  MeanSummer: 'Mean summer flow (m<sup>3</sup>/s)',
  WinterMean: 'Mean winter flow (m<sup>3</sup>/s)',
  LCV: 'Variation',
  LSkew: 'Skewness',
  LKurt: 'Kurtosis',
  AR1: 'Correlation',
  Amplitude: 'Magnitude',
  phase: 'Average day of year',
  Spring2yr: 'Frequency',
  Spring1pt5yr: 'Frequency',
  Spring99: 'Number of days',
  Spring95: 'Number of days',
  CtrFlowMass: 'Day of year',
  Summer95: 'Number of days',
  Summer20p: 'Number of days',
  Highlow: 'Probability / mean',
  flow7q10: '7 day low flow (m<sup>3</sup>/s)',
}

const metricDateRange = {
  MeanSummer: 'Jun. 1 – Sep. 30',
  WinterMean: 'Dec. 1 – Feb. 28',
  Spring2yr: 'Feb. 1 – Aug. 1',
  Spring1pt5yr: 'Feb. 1 – Aug. 1',
  Spring99: 'Feb. 1 – Aug. 1',
  Spring95: 'Feb. 1 – Aug. 1',
  Summer95: 'Jun. 1 – Sep. 30',
  Summer20p: 'Jun. 1 – Sep. 30',
}

const periodLabels = {
  '1': '2038-2047',
  '2': '2068-2077',
}

const streamStrings = {
  '1': 'Headwater Streams (MAF ≤ 1m<sup>3</sup>/s)',
  '2': 'Small Tributaries (1 < MAF ≤ 5m<sup>3</sup>/s)',
  '3': 'Large Tributaries (5 < MAF ≤ 25m<sup>3</sup>/s)',
  '4': 'Main Stem Rivers (MAF > 25m<sup>3</sup>/s)',
}

const periodOptions = []
Object.keys(periodLabels).forEach(key => {
  periodOptions.push({
    label: periodLabels[key],
    value: key,
  })
})

const streamOrders = computed(() => {
  return Object.keys(store.areaData['hydroStats'])
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
    if (
      store.areaData['hydroStats'][streamOrder]['ccsm'] == undefined ||
      store.areaData['hydroStats'][streamOrder]['ccsm']['0'] == undefined
    ) {
      return
    }

    let statsTraces = []
    let hydrographTraces = []

    // Store a historical trace for each hydrology stat stream order chart.
    statsTraces.push({
      type: 'scatter',
      mode: 'markers',
      name: 'ERA',
      x: [1, 2, 3],
      y: [
        store.areaData['hydroStats'][streamOrder]['ccsm']['0'][
          metricSelection.value
        ],
      ],
      marker: {
        symbol: symbols['era'],
        size: 7,
        color: colors['era'],
      },
    })

    if (streamOrder != -9999) {
      if (store.areaData['hydrograph'][streamOrder] == undefined) {
        return
      }
      let daysOfYear = Object.keys(
        store.areaData['hydrograph'][streamOrder]['era'][0]
      )
      let hydrographPoints = []
      daysOfYear.forEach(doy => {
        hydrographPoints.push(
          store.areaData['hydrograph'][streamOrder]['era'][0][doy]['streamflow']
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

    let models = Object.keys(store.areaData['hydroStats'][streamOrder])
    models.forEach(model => {
      let periods = Object.keys(
        store.areaData['hydroStats'][streamOrder][model]
      )
      let hydroStatsPoints = [null]
      for (let period = 1; period < periods.length; period++) {
        hydroStatsPoints.push(
          store.areaData['hydroStats'][streamOrder][model][period][
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
          store.areaData['hydrograph'][streamOrder][model][
            periodSelection.value
          ]
        )
        let hydrographPoints = []
        daysOfYear.forEach(doy => {
          hydrographPoints.push(
            store.areaData['hydrograph'][streamOrder][model][
              periodSelection.value
            ][doy]['streamflow']
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

    const { $Plotly } = useNuxtApp()

    let metricLabel = metricLabels[metricSelection.value]
    metricLabel = chartUtils.wordwrapString(metricLabel)
    metricLabel = '<b>' + metricLabel + '</b>'

    let areaString = store.aoiName
    areaString = chartUtils.wordwrapString(areaString)

    let chartTitle = metricLabel + '<br />' + areaString + '<br />'

    if (metricDateRange.hasOwnProperty(metricSelection.value)) {
      chartTitle +=
        'Date Range: ' + metricDateRange[metricSelection.value] + '<br />'
    }

    chartTitle += streamStrings[streamOrder]

    // Create and populate each hydro stat stream order chart with traces.
    $Plotly.newPlot(
      'hydro-stats-chart-' + streamOrder,
      statsTraces,
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
            text: metricYAxisLabels[metricSelection.value],
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
          scale: 2,
        },
      }
    )

    chartTitle =
      '<b>Hydrograph</b><br />' +
      areaString +
      '<br />Period: ' +
      periodLabels[periodSelection.value] +
      '<br />' +
      streamStrings[streamOrder]

    // Create and populate each hydrology stream order chart with traces.
    $Plotly.newPlot(
      'hydrograph-chart-' + streamOrder,
      hydrographTraces,
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
          tickvals: [1, 91, 182, 274],
          ticktext: ['Jan', 'Apr', 'Jul', 'Oct'],
          range: [1, 365],
          dtick: 1,
        },
        yaxis: {
          automargin: true,
          title: {
            text: 'Streamflow (m<sup>3</sup>/s)',
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
          filename: 'hydrograph',
          scale: 2,
        },
      }
    )
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
