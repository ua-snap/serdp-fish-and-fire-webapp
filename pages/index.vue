<template>
  <div class="container">
    <div>
      <div v-show="store.selectedArea">
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
    <div v-show="store.selectedArea && store.areaData" class="section">
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
@media (min-width: 1024px) {
  .section {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>

<script setup lang="ts">
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
