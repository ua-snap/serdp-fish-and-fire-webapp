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
          Here, we show possible future conditions for riparian fire effects,
          hydrology, stream temperature, and fish growth. These simulations use
          different Global Circulation Models (GCMs)&mdash;such as the National
          Center for Atmospheric Research Community Climate System Model 4.0
          (NCAR CCSM4).
        </p>
        <p>
          Results are based on Representative Concentration Pathway (RCP) 8.5, a
          future greenhouse gas emission scenario that represents a scenario
          similar to, or possibly higher than, current global emissions
          trajectories.
        </p>
        <p>
          Some data have been averaged by stream order: a positive whole number
          used in geomorphology and hydrology to indicate the level of branching
          in a river system. First order streams are headwaters, second to third
          order are generally tributaries, and fourth order and above are
          generally main stem rivers.
        </p>
        <p>
          Results include multiple models and scenarios, grouped by historic and
          two future periods (mid- and late century). Where available, results
          also include:
        </p>

        <ul>
          <li>
            <strong>Riparian fire impact charts</strong> by fire management
            option and by fish species
          </li>
          <li>
            <strong>Hydrology charts</strong> for each stream order present in
            the area of interest
          </li>
          <li>
            <strong>Stream temperature charts</strong> for each stream order
            present in the area of interest
          </li>
          <li>
            <strong>Fish growth charts</strong> for each stream order present in
            the area of interest
          </li>
        </ul>
      </div>
    </section>
    <div class="charts">
      <FireImpactCharts v-if="store.areaData['fireImpact']" />
      <HydroCharts
        v-if="store.areaData['hydroStats'] && store.areaData['hydrograph']"
      />
      <StreamTempCharts v-if="store.areaData['streamTemp']" />
      <FishGrowthCharts v-if="store.areaData['fishGrowth']" />
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
</script>
