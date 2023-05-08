<template>
  <div class="container">
    <section v-show="!store.selectedArea" class="is-size-5 mb-6">
      Precipitation, warming air temperatures, and changing wildfire dynamics
      are driving changes to riverscapes in interior Alaska. This tool uses
      climate data and observed and modeled freshwater process and biological
      data to construct a variety of possible futures for interior Alaska boreal
      aquatic ecosystems.
    </section>
    <div>
      <div>
        <h1 class="title mb-5">{{ store.selectedArea }}</h1>
      </div>
      <div class="columns">
        <div class="column" :class="store.selectedArea ? 'is-full' : 'is-half'">
          <Map />
        </div>
        <div class="column is-half" v-show="!store.selectedArea">
          <div v-show="!store.selectedArea">
            <AreaDropdown />
            <IntersectingAreas />
          </div>
        </div>
      </div>
    </div>
    <section v-show="store.selectedArea" class="section content">
      <div class="is-size-5">
        <h1 class="title">Introduction</h1>
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
          The sections below show output from different scientific simulations
          of possible future conditions for fish growth, stream temperature,
          riparian fire effects, and hydrology. These simulations use different
          Global Climate Models (GCMs) &mdash; climate models &mdash; such as
          the National Center for Atmospheric Research Community Climate System
          Model 4.0 (NCAR CCSM4).
        </p>

        <p>
          Our results are based on the Representative Concentration Pathway 8.5
          which is a future greenhouse gas emission scenario. The RCP 8.5
          represents a scenario similar to, or possibly higher than, current
          global emissions trajectories.
        </p>

        <p>
          Some of these data have been averaged by
          <strong>stream order</strong>. The stream order is a positive whole
          number used in geomorphology and hydrology to indicate the level of
          branching in a river system, where first order streams are headwaters,
          second to third order are generally tributaries, and fourth order and
          above are generally main stem rivers.
        </p>

        <p>Where available, results include:</p>

        <ul>
          <li>
            Fish growth charts with multiple models and scenarios, grouped by
            historic and two future periods (mid/late century) for each stream
            order present in the area of interest
          </li>

          <li>
            Riparian fire impacts charts with multiple models and scenarios,
            grouped by historic and two future periods (mid/late century), by
            fire management option, and by fish species
          </li>

          <li>
            Stream temperature charts with multiple models and scenarios,
            grouped by historic and two future periods (mid/late century) for
            each stream order present in the area of interest
          </li>

          <li>
            Hydrology charts with multiple models and scenarios, grouped by
            historic and two future periods (mid/late century) for each stream
            order present in the area of interest
          </li>
        </ul>
      </div>
    </section>
    <div v-show="store.selectedArea" class="charts">
      <FishGrowthCharts
        v-if="store.selectedArea && store.hasArea('fishGrowth')"
      />
      <FireImpactCharts
        v-if="store.selectedArea && store.hasArea('fireImpact')"
      />
      <HydroCharts
        v-if="
          store.selectedArea &&
          store.hasArea('hydroStats') &&
          store.hasArea('hydrograph')
        "
      />
      <StreamTempCharts
        v-if="store.selectedArea && store.hasArea('streamTemp')"
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
li {
  margin-bottom: 1rem;
}
</style>

<script setup lang="ts">
useHead({
  title: 'SERDP Fish and Fire',
})
import { useStore } from '~/stores/store'
const store = useStore()
store.fetchAreaOptions()
</script>
