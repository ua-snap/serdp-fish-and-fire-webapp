<template>
  <NButton @click="router.push({ name: 'index' })">Go Back</NButton>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
import { NButton } from 'naive-ui'
const router = useRouter()
const store = useStore()
</script>
