<template>
  <div class="content">
    <p class="is-size-5 mb-5">
      Use the dropdown above to browse, or type a name to search from over 300
      places. Alternatively, click the map within the highlighted region to find
      areas of interest.
    </p>
    <ul class="list">
      <li v-for="areaName in store.matchedAreaNames" class="list-item">
        <a @click="select(areaName)">{{ areaName }}</a>
      </li>
    </ul>
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
