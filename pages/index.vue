<template>
  <div class="container">
    <section class="section introblurb">
      Changing precipitation, air temperature, and wildfire dynamics are driving
      changes in interior Alaska riverscapes. This tool uses climate data, plus
      observed and modeled freshwater process and biological data, to construct
      a variety of possible futures for interior Alaska aquatic ecosystems.
    </section>
    <div>
      <div class="columns">
        <div class="column is-half">
          <AreaDropdown />
          <IntersectingAreas />
        </div>
        <div class="column is-half">
          <Map />
        </div>
      </div>
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

onMounted(() => {
  Object.assign(store, {
    areaData: {},
    resultGeom: undefined,
    reset: true,
  })
})
</script>
