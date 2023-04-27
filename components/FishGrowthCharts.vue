<template>
  <h1 class="title">Fish Growth</h1>
  <div class="columns">
    <div class="column is-half">
      <NRadioGroup v-model:value="fmoSelection" name="fmo-group">
        <p class="is-size-5 mb-2">Fire Management Options</p>
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
import { NRadioGroup, NRadio, NSpace } from 'naive-ui'
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
  return Object.keys(store.fishGrowthData[fmoSelection.value])
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
    let traces = []

    // Store historical trace.
    traces.push({
      type: 'scatter',
      mode: 'markers',
      name: 'ERA',
      x: [1, 2, 3],
      y: [store.fishGrowthData['hist'][streamOrder]['ccsm']['0']['FishWeight']],
      marker: {
        symbol: symbols['era'],
        size: 7,
        color: colors['era'],
      },
    })
    let models = Object.keys(
      store.fishGrowthData[fmoSelection.value][streamOrder]
    )

    // Store projected traces.
    models.forEach(model => {
      let periods = Object.keys(
        store.fishGrowthData[fmoSelection.value][streamOrder][model]
      )
      let traceValues = [null]
      for (let period = 1; period <= periods.length; period++) {
        traceValues.push(
          store.fishGrowthData[fmoSelection.value][streamOrder][model][period][
            'FishWeight'
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

    if (store.selected) {
      const { $Plotly } = useNuxtApp()

      // Create and populate each stream order chart with traces.
      $Plotly.newPlot(
        'fish-growth-chart-' + streamOrder,
        traces,
        {
          autosize: true,
          height: 475,
          margin: {
            l: 75,
            r: 75,
          },
          title: {
            text:
              'Fish Growth<br />' +
              store.selected +
              '<br />' +
              fmoLabels[fmoSelection.value] +
              ', Stream Order: ' +
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
              text: 'Fish Weight (Grams)',
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

watch(fmoSelection, async () => {
  renderPlot()
})

onMounted(() => {
  renderPlot()

  // Fire resize event to trigger Plotly responsiveness.
  window.dispatchEvent(new Event('resize'))
})
</script>
