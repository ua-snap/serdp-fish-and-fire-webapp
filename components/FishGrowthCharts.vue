<template>
  <section class="section content is-size-5">
    <h1 class="title">Fish Growth</h1>
    <p>
      This section shows projections of juvenile Chinook salmon growth potential
      under three
      <a @click="router.push({ name: 'fmo' })">fire management options</a>.
      Future projections are presented for two specific climate models
      (NCAR-CCSM4 and GFDL-CM3), compared with a historical range
      (2002&ndash;2018). Growth potential indicates how large a well-fed
      juvenile Chinook salmon could potentially grow by the end of its first
      summer, in terms of body wet weight (g). Simulations account for changes
      in stream temperature influenced by climate and wildfire, assuming that
      fish feeding rates and food quality remain similar to their current values
      in the future. Only stream reaches containing adequate habitat for
      juvenile Chinook salmon are included (based on a model of underlying
      geomorphology,
      <a
        href="https://www.fs.usda.gov/pnw/pubs/journals/pnw_2007_burnett001.pdf"
        >described here</a
      >). Although models projected a range of probabilistic future
      temperatures, only the mean values are shown in this visualization for
      simplicity.
    </p>
    <p>
      Growth potential estimates are presented for multiple stream orders; the
      projections for stream orders 3&ndash;5 are most closely tied to field
      data, whereas growth estimates for larger mainstem rivers (stream orders
      6&ndash;7) are more uncertain. For example, juvenile fish may be more
      food-limited in larger mainstem rivers, which tend to be warmer than their
      tributaries upstream. Stream temperature and juvenile Chinook salmon
      growth were simulated on an 8-day timestep. Wildfires were simulated
      across the study area based on probabilistic flammability metrics (<a
        href="https://uaf-snap.org/wp-content/uploads/2020/06/ALFRESCO_overview.pdf"
        >described here</a
      >), influenced by vegetation type, climate, and fire management option.
    </p>
  </section>
  <div class="columns">
    <div class="column is-half">
      <NRadioGroup v-model:value="fmoSelection" name="fmo-group">
        <FmoRadioLabel />
        <NSpace>
          <NRadio
            v-for="fmoOption in fmoOptions"
            :key="fmoOption.value"
            :value="fmoOption.value"
            :label="fmoOption.label"
          />
        </NSpace>
      </NRadioGroup>
    </div>
  </div>
  <div class="is-clearfix">
    <div
      v-for="streamOrder in streamOrders"
      v-bind:id="'fish-growth-chart-' + streamOrder"
      class="fish-growth-chart is-pulled-left"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.fish-growth-chart {
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
import { NRadioGroup, NRadio, NSpace } from 'naive-ui'
const router = useRouter()
const store = useStore()

let fmoSelection = ref('nofmo')

const modelLabels = {
  ccsm: 'NCAR-CCSM4',
  gfdl: 'GFDL-CM3',
}

const fmoLabels = {
  hist: 'Historical',
  nofmo: 'FMO #1',
  fmo: 'FMO #2',
  altfmo: 'FMO #3',
}

const fmoOptions = [
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
]

const streamOrders = computed(() => {
  return Object.keys(store.areaData['fishGrowth'][fmoSelection.value])
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
      store.areaData['fishGrowth']['hist'][streamOrder]['ccsm'] == undefined
    ) {
      return
    }

    let traces = []

    // Store historical trace.
    traces.push({
      type: 'scatter',
      mode: 'markers',
      name: 'ERA',
      x: [1, 2, 3],
      y: [
        store.areaData['fishGrowth']['hist'][streamOrder]['ccsm']['0'][
          'FishWeight'
        ],
      ],
      marker: {
        symbol: symbols['era'],
        size: 7,
        color: colors['era'],
      },
    })
    let models = Object.keys(
      store.areaData['fishGrowth'][fmoSelection.value][streamOrder]
    )

    // Store projected traces.
    models.forEach(model => {
      let periods = Object.keys(
        store.areaData['fishGrowth'][fmoSelection.value][streamOrder][model]
      )
      let traceValues = [null]
      for (let period = 1; period <= periods.length; period++) {
        traceValues.push(
          store.areaData['fishGrowth'][fmoSelection.value][streamOrder][model][
            period
          ]['FishWeight']
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
      '<b>Fish growth</b><br />' +
      areaString +
      '<br />' +
      fmoLabels[fmoSelection.value] +
      ', Stream Order: ' +
      streamOrder

    // Create and populate each stream order chart with traces.
    $Plotly.newPlot(
      'fish-growth-chart-' + streamOrder,
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
            text: 'Fish Weight (g)',
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
          filename: 'fish_growth',
        },
      }
    )
  })
}

watch(fmoSelection, async () => {
  renderPlot()
})

onMounted(() => {
  renderPlot()

  // Fire resize event to trigger Plotly responsiveness.
  window.dispatchEvent(new Event('resize'))
})
</script>
