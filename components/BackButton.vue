<template>
  <NButton @click="select(undefined)">Go Back</NButton>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import { NButton } from 'naive-ui'
const store = useStore()

const select = name => {
  store.$patch({
    selected: name,
  })
}
</script>
