<template>
  <NButton @click="select(undefined)">Go Back</NButton>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
</script>

<script lang="ts">
export default {
  methods: {
    select(name) {
      this.selected = name
      const store = useStore()
      store.$patch({
        selected: this.selected,
      })
    },
  },
}
</script>
