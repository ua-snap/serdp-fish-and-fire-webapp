<template>
  <NRadioGroup
    v-model:value="fmoSelection"
    name="model-group"
    class="ml-5 mb-5"
  >
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
  <div id="chart"></div>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
const store = useStore()

let fmoSelection = ref('nofmo')

const fmoLabels = {
  nofmo: 'FMO #1',
  fmo: 'FMO #2',
  altfmo: 'FMO #3',
}

const modelLabels = {
  ccsm: 'NCAR-CCSM4 (RCP 8.5)',
  gfdl: 'GFDL-CM3 (RCP 8.5)',
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

const renderPlot = () => {
  let lowOffset =
    store.chartData['historical']['neutral'] -
    store.chartData['historical']['low']
  let highOffset =
    store.chartData['historical']['high'] -
    store.chartData['historical']['neutral']
  let traces = [
    {
      type: 'scatter',
      name: 'CRU TS 4.0',
      x: [1],
      y: [store.chartData['historical']['neutral']],
      error_y: {
        type: 'data',
        array: [highOffset],
        arrayminus: [lowOffset],
        visible: true,
      },
    },
  ]
  const modelSymbols = {
    ccsm: 'circle',
    gfdl: 'square',
  }
  Object.keys(store.chartData[fmoSelection.value]).forEach(model => {
    traces.push({
      type: 'scatter',
      mode: 'markers',
      name: modelLabels[model],
      x: [1, 2, 3],
      y: store.chartData[fmoSelection.value][model],
      marker: {
        symbol: modelSymbols[model],
      },
    })
  })
  if (store.selected) {
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
            store.selected +
            '<br />' +
            fmoLabels[fmoSelection.value],
        },
        xaxis: {
          tickvals: [0, 1, 2, 3],
          ticktext: ['', '2002-2018', '2038-2047', '2068-2077'],
          dtick: 1,
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
}

watch(fmoSelection, async () => {
  renderPlot()
})

onMounted(() => {
  renderPlot()

  // Trigger Plotly responsiveness to fill available width.
  window.dispatchEvent(new Event('resize'))
})
</script>
