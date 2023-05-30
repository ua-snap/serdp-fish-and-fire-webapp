<template>
  <section class="section content is-size-5">
    <h1 class="title">Riparian Fire Index</h1>
    <p>
      This section shows projections for the mean riparian fire index, compared
      with a historical dataset (ERA-Interim Reanalysis). Results are presented
      for low, neutral, and high intensity wildfire scenarios for two specific
      climate models (NCAR-CCSM4 and GFDL-CM3). The fire scenarios are a
      function of fire size, intensity, and fire weather.
    </p>

    <p>
      The riparian fire index is the normalized percentage of riparian valley
      bottom area predicted to burn at high severity, as a function of wildfire
      intensity and weather, pre-fire vegetation and fuels, stream
      geomorphology, and catchment topography.
    </p>

    <p>
      Results are presented for the base riparian fire index (species = none),
      as a vulnerability index for two fish species, juvenile Chinook salmon,
      and Arctic grayling, and for three
      <a @click="router.push({ name: 'fmo' })">fire management options</a>. The
      vulnerability index is a function of the mean riparian fire index, the
      total length of high suitability fish habitat relative to total stream
      length, and flammability. Flammability is defined as the mean percentage
      of times pixels within this location burned in model simulations.
    </p>

    <p>
      Riparian fire index data for this and all other areas is available as a
      <a
        href="https://raw.githubusercontent.com/ua-snap/serdp-fish-and-fire-webapp/main/scripts/input/Riparian_Fire_Impact_by_AOI.csv"
        >downloadable CSV</a
      >.
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
    <div class="column is-half">
      <NRadioGroup v-model:value="speciesSelection" name="species-group">
        <p class="is-size-5 mb-2">Species</p>
        <NSpace>
          <NRadio
            v-for="speciesOption in speciesOptions"
            :key="speciesOption.value"
            :value="speciesOption.value"
            :label="speciesOption.label"
          />
        </NSpace>
      </NRadioGroup>
    </div>
  </div>
  <div id="chart"></div>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import { NRadioGroup, NRadio, NSpace } from 'naive-ui'
const router = useRouter()
const store = useStore()

let fmoSelection = ref('nofmo')
let speciesSelection = ref('NONE')

const fmoLabels = {
  nofmo: 'FMO #1',
  fmo: 'FMO #2',
  altfmo: 'FMO #3',
}

const speciesLabels = {
  NONE: 'None',
  CHK: 'Chinook salmon',
  GRA: 'Arctic grayling',
}

const modelLabels = {
  ccsm: 'NCAR-CCSM4',
  gfdl: 'GFDL-CM3',
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

const speciesOptions = [
  {
    label: speciesLabels['NONE'],
    value: 'NONE',
  },
  {
    label: speciesLabels['CHK'],
    value: 'CHK',
  },
  {
    label: speciesLabels['GRA'],
    value: 'GRA',
  },
]

const renderPlot = () => {
  let traces = []
  let fmoData =
    store.areaData['fireImpact'][fmoSelection.value][speciesSelection.value]
  let keyPrefixes = ['Low', 'Neutral', 'High']
  const symbols = {
    era: 'circle',
    ccsm: 'square',
    gfdl: 'diamond',
  }
  const colors = {
    era: {
      Low: '#999999',
      Neutral: '#666666',
      High: '#333333',
    },
    ccsm: {
      Low: '#9999ff',
      Neutral: '#6666ff',
      High: '#3333ff',
    },
    gfdl: {
      Low: '#ff9999',
      Neutral: '#ff6666',
      High: '#ff3333',
    },
  }

  // Store historical traces.
  for (let i = 0; i < keyPrefixes.length; i++) {
    let prefix = keyPrefixes[i]
    let meanKey = prefix + '_Score_AOI_Mean'
    let sdKey = prefix + '_Score_AOI_SD'
    let xOffset = (i - 1) * 0.1
    let trace = {
      type: 'scatter',
      mode: 'markers',
      name: 'ERA-Interim (' + prefix + ' Intensity)',
      x: [1 + xOffset, 2 + xOffset, 3 + xOffset],
      y: [fmoData['ccsm'][0][meanKey]],
      marker: {
        color: colors['era'][prefix],
        size: 7,
      },
    }
    if (fmoData['ccsm'][0][sdKey] != null) {
      trace['error_y'] = {
        type: 'data',
        array: [fmoData['ccsm'][0][sdKey]],
        visible: true,
      }
    }
    traces.push(trace)
  }
  let models = Object.keys(
    store.areaData['fireImpact'][fmoSelection.value][speciesSelection.value]
  )

  // Store projected traces.
  for (let i = 0; i < models.length; i++) {
    let model = models[i]
    for (let j = 0; j < keyPrefixes.length; j++) {
      let prefix = keyPrefixes[j]
      let meanKey = prefix + '_Score_AOI_Mean'
      let sdKey = prefix + '_Score_AOI_SD'
      let periods = Object.keys(
        store.areaData['fireImpact'][fmoSelection.value][
          speciesSelection.value
        ][model]
      )
      let traceValues = [null]
      let traceErrorBars = [null]
      for (let period = 1; period < periods.length; period++) {
        traceValues.push(fmoData[model][period][meanKey])
        traceErrorBars.push(fmoData[model][period][sdKey])
      }

      // Add lots of space between eras.
      let periodOffset = (j - 1) * 0.15

      // Add a little bit of space between models.
      let modelOffset = (i - 0.5) * 0.04

      let trace = {
        type: 'scatter',
        mode: 'markers',
        name: modelLabels[model] + ' (' + prefix + ' Intensity)',
        x: [1, 2 + periodOffset + modelOffset, 3 + periodOffset + modelOffset],
        y: traceValues,
        marker: {
          symbol: symbols[model],
          size: 7,
          color: colors[model][prefix],
        },
      }

      // Add error bars only if standard deviation values are available for
      // projected traces.
      if (traceErrorBars.slice(1).every(Number)) {
        trace['error_y'] = {
          type: 'data',
          array: traceErrorBars,
          visible: true,
        }
      }
      traces.push(trace)
    }
  }

  const { $Plotly } = useNuxtApp()

  // Create and populate chart with traces.
  $Plotly.newPlot(
    'chart',
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
          '<b>Riparian fire index</b><br />' +
          store.aoiName +
          '<br />' +
          fmoLabels[fmoSelection.value] +
          ', Species: ' +
          speciesLabels[speciesSelection.value],
      },
      xaxis: {
        tickvals: [0, 1, 2, 3],
        ticktext: ['', '2002-2018', '2038-2047', '2068-2077'],
        dtick: 1,
      },
      yaxis: {
        automargin: true,
        title: {
          text: 'Riparian Fire Index',
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
        filename: 'riparian_fire_index',
      },
    }
  )
}

watch(fmoSelection, async () => {
  renderPlot()
})

watch(speciesSelection, async () => {
  renderPlot()
})

onMounted(() => {
  renderPlot()

  // Fire resize event to trigger Plotly responsiveness.
  window.dispatchEvent(new Event('resize'))
})
</script>
