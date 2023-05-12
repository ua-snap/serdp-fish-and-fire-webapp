<template>
  <header>
    <div class="container">
      <h1 class="is-size-1 mt-5">SERDP Fish and Fire</h1>
    </div>
  </header>
  <hr />

  <slot />

  <hr class="mt-6" />

  <footer>
    <div class="container mb-6 is-size-5">
      <img src="~/assets/UAFLogo_A_black_horiz.svg" alt="UAF Logo" />
      <p>
        This tool was developed by the
        <a href="https://www.snap.uaf.edu/"
          >Scenarios Network for Alaska + Arctic Planning</a
        >
        at the
        <a href="https://uaf-iarc.org/">International Arctic Research Center</a
        >.
      </p>

      <p>
        Funding was provided by the U.S. Department of Defense
        <a href="https://www.serdp-estcp.org/"
          >Strategic Environmental Research and Development Program</a
        >.
      </p>

      <p>
        Please contact
        <a href="uaf-snap-data-tools@alaska.edu"
          >uaf-snap-data-tools@alaska.edu</a
        >
        if you have questions or would like to provide feedback for this tool.
        <a href="https://uaf-snap.org/web-tools/"
          >Visit the SNAP Climate + Weather Tools page</a
        >
        to see our full suite of interactive web tools.
      </p>

      <p>
        Data available through this tool are subject to the
        <a href="https://creativecommons.org/licenses/by/4.0/"
          >Creative Commons Attribution 4.0</a
        >
        license.
      </p>

      <p>
        Copyright &copy; {{ year }} University of Alaska Fairbanks. All rights
        reserved.
      </p>

      <p>
        UA is an AA/EO employer and educational institution and prohibits
        illegal discrimination against any individual.
        <a href="https://www.alaska.edu/nondiscrimination/"
          >Statement of Nondiscrimination</a
        >
        and
        <a
          href="https://www.alaska.edu/records/records/compliance/gdpr/ua-privacy-statement/"
          >Privacy Statement</a
        >.
      </p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  margin: auto 3rem;
  text-align: center;
}
img {
  width: 17rem;
}
</style>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
