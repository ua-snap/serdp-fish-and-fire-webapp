<template>
  <client-only>
    <NSelect
      v-model:value="selectedValue"
      v-if="!store.selectedArea"
      filterable
      :options="store.areaOptions"
      placeholder="Select an area of interest"
      class="mb-5"
    />
  </client-only>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import { NSelect } from 'naive-ui'
const store = useStore()

let selectedValue = ref(undefined)

const selectedArea = computed(() => store.selectedArea)

const select = name => {
  store.$patch({
    selected: name,
  })
}

watch(selectedValue, async value => {
  store.$patch({
    selected: value,
  })
  if (selectedArea.value) {
    store.fetchResultGeom()
  }
})

watch(selectedArea, async value => {
  selectedValue.value = value
})
</script>
