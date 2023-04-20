<template>
  <div class="container">
    <div>
      <div v-show="store.selectedArea">
        <h1 class="title mb-5">{{ store.selectedArea }}</h1>
      </div>
      <div class="columns mb-5">
        <div class="column is-half">
          <Map />
        </div>
        <div class="column is-half">
          <div v-show="!store.selectedArea">
            <AreaDropdown />
            <IntersectingAreas />
          </div>
        </div>
      </div>
    </div>
    <div v-show="store.selectedArea">
      <hr />
      <FishGrowthCharts
        v-if="store.selectedArea && store.hasArea('fishGrowth')"
      />
      <hr />
      <FireImpactCharts
        v-if="store.selectedArea && store.hasArea('fireImpact')"
      />
      <hr />
      <HydroCharts
        v-if="
          store.selectedArea &&
          store.hasArea('hydroStats') &&
          store.hasArea('hydrograph')
        "
      />
      <hr />
      <StreamTempCharts
        v-if="store.selectedArea && store.hasArea('streamTemp')"
      />
      <BackButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
const store = useStore()
store.fetchAreaOptions()
</script>
