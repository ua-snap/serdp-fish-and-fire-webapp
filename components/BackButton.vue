<template>
  <NButton type="info" @click="router.push({ name: 'index' })"
    >Go back, pick another place&hellip;</NButton
  >
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
const router = useRouter()
</script>
