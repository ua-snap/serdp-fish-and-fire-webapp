<template>
  <div class="content">
    <p v-if="store.matchedAreaNames.length == 0" class="mb-5">
      Click the map within the highlighted region to find areas of interest.
    </p>
    <p v-if="store.matchedAreaNames.length > 0">
      Found {{ store.matchedAreaNames.length }} matching areas for [{{
        store.point.lat
      }}, {{ store.point.lng }}]:
    </p>
    <ul class="list">
      <li v-for="areaName in store.matchedAreaNames" class="list-item">
        <a @click="select(areaName)">{{ areaName }}</a>
      </li>
    </ul>
    <NButton
      @click="reset()"
      class="mt-3"
      type="primary"
      v-if="store.matchedAreaNames.length > 0"
      >Go back, start over</NButton
    >
  </div>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
const store = useStore()

const select = name => {
  store.$patch({
    selected: name,
  })
}

const reset = () => {
  store.$patch({
    reset: true,
  })
}
</script>
