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
      <p class="is-size-5 mb-5">Types of places include:</p>
      <ul class="list is-size-5">
        <li class="list-item">
          Alaska Department of Fish and Game (ADF&G) Game Management Units
        </li>
        <li class="list-item">
          Alaska Fire Service (AFS) Fire Management Units
        </li>
        <li class="list-item">Park and Conservation Units</li>
        <li class="list-item">Department of Defense (DOD) Lands</li>
        <li class="list-item">Hydrologic Units Codes (HUCs)</li>
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
import hash_map from '~/assets/hash_map.json'
import { useStore } from '~/stores/store'
const router = useRouter()
const store = useStore()

const select = name => {
  let hash = store.hashFromName(name)
  router.push({
    path: 'report/' + hash,
  })
}

const reset = () => {
  store.$patch({
    reset: true,
  })
}
</script>
