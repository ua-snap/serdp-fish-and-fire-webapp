<template>
  <div class="container">
    <div>
      <div v-show="store.selectedArea">
        <NH1>{{ store.selectedArea }}</NH1>
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
          <Chart v-if="store.selectedArea" />
        </div>
      </div>
    </div>
    <div v-show="store.selectedArea">
      <ResultsTable />
      <BackButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
const store = useStore()
store.fetchAreaOptions()
</script>
