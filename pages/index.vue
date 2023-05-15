<template>
  <div class="container">
    <section v-show="!store.selectedArea" class="section introblurb">
      Changing precipitation, air temperature, and wildfire dynamics are driving
      changes in interior Alaska riverscapes. This tool uses climate data, plus
      observed and modeled freshwater process and biological data, to construct
      a variety of possible futures for interior Alaska aquatic ecosystems.
    </section>
    <section class="section">
      <div>
        <h1 class="title mb-5">{{ store.selectedArea }}</h1>
      </div>
      <div class="columns">
        <div class="column is-half" v-show="!store.selectedArea">
          <div v-show="!store.selectedArea">
            <AreaDropdown />
            <IntersectingAreas />
          </div>
        </div>
        <div class="column" :class="store.selectedArea ? 'is-full' : 'is-half'">
          <Map />
        </div>
      </div>
    </section>
    <section v-show="store.selectedArea" class="section">
      <BackButton class="mb-6" />
      <div class="is-size-5 content">
        <h3 class="is-3 title">About these model outputs</h3>
        <p>
          Data for the charts below have been averaged across the spatial extent
          of {{ store.selectedArea }}.
        </p>
        <p>
          Note: for large areas such as entire river basins, averaging future
          climate conditions and changes can mask important variation within the
          region.
        </p>
        <p>
          Here, we show show possible future conditions for fish growth, stream
          temperature, riparian fire effects, and hydrology. These simulations
          use different Global Circulation Models (GCMs)&mdash;such as the
          National Center for Atmospheric Research Community Climate System
          Model 4.0 (NCAR CCSM4).
        </p>
        <p>
          Results are based on Representative Concentration Pathway (RCP) 8.5, a
          future greenhouse gas emission scenario that represents a scenario
          similar to, or possibly higher than, current global emissions
          trajectories.
        </p>
        <p>
          Some data have been averaged by <strong>stream order</strong>: a
          positive whole number used in geomorphology and hydrology to indicate
          the level of branching in a river system. First order streams are
          headwaters, second to third order are generally tributaries, and
          fourth order and above are generally main stem rivers.
        </p>
        <p>
          Results include multiple models and scenarios, grouped by historic and
          two future periods (mid&ndash; and late&ndash;century). Where
          available, results also include:
        </p>
        <ul>
          <li>
            <strong>Fish growth charts</strong> for each stream order present in
            the area of interest
          </li>
          <li>
            <strong>Riparian fire impact charts</strong> by fire management
            option and by fish species
          </li>
          <li>
            <strong>Stream temperature charts</strong> for each stream order
            present in the area of interest
          </li>
          <li>
            <strong>Hydrology charts</strong> for each stream order present in
            the area of interest
          </li>
        </ul>
      </div>
    </section>
    <div class="charts">
      <FishGrowthCharts
        v-if="store.selectedArea && store.areaData['fishGrowth']"
      />
      <FireImpactCharts
        v-if="store.selectedArea && store.areaData['fireImpact']"
      />
      <HydroCharts
        v-if="
          store.selectedArea &&
          store.areaData['hydroStats'] &&
          store.areaData['hydrograph']
        "
      />
      <StreamTempCharts
        v-if="store.selectedArea && store.areaData['streamTemp']"
      />
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

.introblurb {
  margin: 3rem;
  font-size: 1.5rem;
}

</style>

<script setup lang="ts">
useHead({
  title: 'Fish and Fire in Interior Alaska',
})
import { useStore } from '~/stores/store'
const store = useStore()
store.fetchAreaOptions()

const selectedArea = computed(() => store.selectedArea)

watch(selectedArea, async () => {
  if (selectedArea.value != undefined) {
    store.fetchResultData()
  } else {
    Object.assign(store, {
      areaData: {},
    })
  }
})
</script>
