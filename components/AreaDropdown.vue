<template>
  <client-only>
    <NSelect
      v-model:value="selectedValue"
      v-if="!store.selectedArea"
      filterable
      :options="store.areaOptions"
      placeholder="Click or type to select an area of interest&hellip;"
      class="mb-5"
    />
  </client-only>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import { NSelect } from 'naive-ui'
const router = useRouter()
const store = useStore()

let selectedValue = ref(undefined)

watch(selectedValue, async value => {
  let hash = store.hashFromName(value)
  router.push({
    path: 'report/' + hash,
  })
})
</script>
