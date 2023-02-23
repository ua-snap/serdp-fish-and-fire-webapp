<template>
  <NButton @click="select(undefined)">Go Back</NButton>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
const store = useStore()
function select() {
  store.$patch({ selected: this.selected })
}
</script>
