<template>
  <div class="content pr-4">
    <div v-if="store.matchedAreaNames.length == 0">
      <p class="is-size-5 mb-5">Find a place of interest:</p>
      <ul class="list is-size-5">
        <li class="list-item">
          Click the map within the highlighted region, <em>or&hellip;</em>
        </li>
        <li class="list-item">
          Start typing a name in the box above, <em>or&hellip;</em>
        </li>
        <li class="list-item">
          Click to choose from the 300+ place names in the box above
        </li>
      </ul>
    </div>
    <h5 class="title is-5" v-if="store.matchedAreaNames.length > 0">
      Found {{ store.matchedAreaNames.length }} matching areas for
      {{ store.point.lat }}&deg;N, {{ store.point.lng }}&deg;W
    </h5>
    <ul class="list is-size-5">
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
