<template>
  <div class="content pr-4">
    <p class="is-size-5 mb-5">Find a place of interest:</p>
    <ul class="is-size-5">
      <li>Click the map within the highlighted region, <em>or&hellip;</em></li>
      <li>Start typing a name in the box above, <em>or&hellip;</em></li>
      <li>Click to choose from the 300+ place names in the box above</li>
    </ul>
    <div v-if="store.matchedAreaNames.length" class="mb-5">
      <p class="is-size-5 mb-5">Places found:</p>
      <ul class="list is-size-5">
        <li v-for="areaName in store.matchedAreaNames" class="list-item">
          <a @click="select(areaName)">{{ areaName }}</a>
        </li>
      </ul>
    </div>
    <NButton
      @click="reset()"
      class="mt-3"
      v-if="store.matchedAreaNames.length > 0"
      >Reset</NButton
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
