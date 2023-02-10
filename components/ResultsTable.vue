<template>
  <NTable :bordered="false" :single-line="false" class="my-5">
    <thead>
      <tr>
        <th>Field</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(value, key) in store.tableData">
        <td>{{ key }}</td>
        <td>{{ value }}</td>
      </tr>
    </tbody>
  </NTable>
</template>

<script setup lang="ts">
import { useStore } from '~/stores/store'
const store = useStore()
</script>
