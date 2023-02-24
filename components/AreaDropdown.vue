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
const store = useStore()
</script>

<script lang="ts">
export default {
  data() {
    return {
      selectedValue: undefined,
    }
  },
  computed: {
    selectedArea() {
      const store = useStore()
      return store.selectedArea
    },
  },
  methods: {
    select(name) {
      this.selectedValue = name
      const store = useStore()
      store.$patch({
        selected: this.selected,
      })
    },
  },
  watch: {
    selectedValue: function (value) {
      const store = useStore()
      store.$patch({
        selected: value,
      })
      if (this.selectedArea) {
        store.fetchResultGeom()
      }
    },
    selectedArea: function (value) {
      this.selectedValue = value
    },
  },
}
</script>
