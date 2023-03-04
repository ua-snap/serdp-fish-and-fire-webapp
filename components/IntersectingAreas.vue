<template>
  <div class="content">
    <p class="mb-5">Click the map to find areas of interest.</p>
    <ul class="list">
      <li v-for="areaName in store.matchedAreaNames" class="list-item">
        <a @click="select(areaName)">{{ areaName }}</a>
      </li>
    </ul>
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
</script>
