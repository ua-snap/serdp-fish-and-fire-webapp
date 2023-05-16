<template>
  <div class="container is-size-5">
    <section class="section">
      <h1 class="title">Fire Management Options (FMO)</h1>
      <p>
        Flammability simulations from the ALFRESCO model were used as inputs for
        the fish growth and riparian fire impact projections displayed in this
        tool. These ALFRESCO simulations were run using three different fire
        suppression scenarios, incorporating data from the
        <a href="https://fire.ak.blm.gov/"
          >Alaska Interagency Coordination Center (AICC)</a
        >.
      </p>
      <ul>
        <li>
          <b>FMO #1:</b> No fire suppression efforts in the past, present, or
          future.
        </li>
        <li>
          <b>FMO #2:</b> No fire suppression efforts pre-1950, then adds fire
          management options data from AICC to simulate fire suppression efforts
          from 1950 to 2100.
        </li>
        <li>
          <b>FMO #3:</b> No fire suppression efforts pre-1950, then adds fire
          management options data from AICC to simulate fire suppression efforts
          from 1950 to 2015. Then, from 2016 to 2100, a modified version of
          AICC's fire management options data is used that includes addition
          areas of fire suppression around Fort Wainwright, Fort Greely, and
          Eielson Air Force Base.
        </li>
      </ul>
      <p>
        For more information, refer to the GitHub repositories for the
        <a href="https://github.com/ua-snap/alfresco">ALFRESCO model</a> and
        <a href="https://github.com/ua-snap/alfresco_fmo">ALFRESCO FMO inputs</a
        >. The ALFRESCO data used as inputs for fish growth and riparian fire
        impacts are
        <a
          href="https://catalog.snap.uaf.edu/geonetwork/srv/eng/catalog.search#/metadata/3be7e974-df96-4eef-bb41-ee16f625124f"
          >available for download here</a
        >.
      </p>
      <NButton @click="router.back()" class="mt-5">Go Back</NButton>
    </section>
  </div>
</template>

<style lang="scss" scoped>
ul,
li {
  margin: 1rem;
}
li {
  list-style: disc;
}
</style>

<script setup lang="ts">
useHead({
  title: 'Fire Management Options — Fish & Fire in Interior Alaska',
})
import { NButton } from 'naive-ui'
import { useStore } from '~/stores/store'
const router = useRouter()
const store = useStore()
store.fetchAreaOptions()
</script>
