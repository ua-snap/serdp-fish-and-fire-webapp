<template>
  <div class="container">
    <h1 class="title my-6">{{ store.aoiName }}</h1>
    <Map />
    <section class="section content">
      <BackButton class="mb-6" />
      <div class="is-size-5 content">
        <h1>About these model outputs</h1>
        <p>
          Data for the charts below have been averaged across the spatial extent
          of {{ store.aoiName }}.
        </p>

        <p>
          <em>
            Note: for large areas such as entire river basins, averaging future
            climate conditions and changes can mask important variation within
            the region.</em
          >
        </p>

        <p>
          Here, we show possible future conditions for
          {{ availableDataString }}. These simulations use different Global
          Circulation Models (GCMs) including the National Center for
          Atmospheric Research Community Climate System Model 4.0 (NCAR-CCSM4)
          and Geophysical Fluid Dynamics Laboratory Coupled Model 3 (GFDL-CM3).
          Possible future conditions are compared with a historical dataset
          (ERA-Interim Reanalysis), which uses reanalysis to combine historical
          observations with short-range weather forecasts to create consistent
          and comprehensive datasets of past weather and climate, filling gaps
          in the observational record.
        </p>
        <p>
          Results are based on Representative Concentration Pathway (RCP) 8.5, a
          future greenhouse gas emission scenario that represents a scenario
          similar to, or possibly higher than, current global emissions
          trajectories.
        </p>
        <p>
          Hydrology results are averaged by stream size class. Headwaters are
          streams with mean annual flows (MAF) &le; 1 m<sup>3</sup>/s, small
          tributaries MAF &le; 5 m<sup>3</sup>/s, large tributaries MAF &le; 25
          m<sup>3</sup>/s, and mainstem rivers MAF &gt; 25 m<sup>3</sup>/s.
          Stream temperature and fish growth data have been averaged by stream
          order: a positive whole number used in geomorphology and hydrology to
          indicate the level of branching in a river system. First order streams
          are headwaters, second to third order are generally small and large
          tributaries, and fourth order and above are generally mainstem rivers.
        </p>
        <p>
          Results include multiple models and scenarios, grouped by historic and
          two future periods (mid- and late century). Results also include:
        </p>

        <ul>
          <li v-if="store.areaData['fireImpact']">
            <a href="#fire-impact">Riparian fire index charts</a> by fire
            management option and by fish species
          </li>
          <li
            v-if="store.areaData['hydroStats'] && store.areaData['hydrograph']"
          >
            <a href="#hydro-stats">Hydrology charts</a> for each stream order
            present in the area of interest
          </li>
          <li v-if="store.areaData['streamTemp']">
            <a href="#stream-temp">Stream temperature charts</a> for each stream
            order present in the area of interest
          </li>
          <li v-if="store.areaData['fishGrowth']">
            <a href="#fish-growth">Fish growth charts</a> for each stream order
            present in the area of interest
          </li>
        </ul>
      </div>
    </section>
    <div class="charts">
      <div id="fire-impact" v-if="store.areaData['fireImpact']">
        <FireImpactCharts />
      </div>
      <div
        id="hydro-stats"
        v-if="store.areaData['hydroStats'] && store.areaData['hydrograph']"
      >
        <HydroCharts />
      </div>
      <div id="stream-temp" v-if="store.areaData['streamTemp']">
        <StreamTempCharts />
      </div>
      <div id="fish-growth" v-if="store.areaData['fishGrowth']">
        <FishGrowthCharts />
      </div>
      <BackButton />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content {
  @media (min-width: 1024px) {
    &.charts {
      padding-left: 0;
      padding-right: 0;
    }
  }
}
</style>

<script setup lang="ts">
useHead({
  title: 'Fish & Fire in Interior Alaska',
})
import { useStore } from '~/stores/store'
const store = useStore()
store.fetchResultData()

const availableDataString = computed(() => {
  let availableData = []
  if (store.areaData['fireImpact']) {
    availableData.push('riparian fire effects')
  }
  if (store.areaData['hydroStats'] && store.areaData['hydrograph']) {
    availableData.push('hydrology')
  }
  if (store.areaData['streamTemp']) {
    availableData.push('stream temperature')
  }
  if (store.areaData['fishGrowth']) {
    availableData.push('fish growth')
  }
  if (availableData.length > 2) {
    let allButLast = availableData.slice(0, availableData.length - 1).join(', ')
    return allButLast + ', and ' + availableData.at(-1)
  } else if (availableData.length == 2) {
    return availableData[0] + ' and ' + availableData[1]
  } else {
    return availableData[0]
  }
})
</script>
