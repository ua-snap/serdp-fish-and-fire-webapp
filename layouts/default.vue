<template>
  <header>
    <div class="headerbanner">
      Alaska Cooperative Fish and Wildlife Research
      Unit&nbsp;&nbsp;|&nbsp;&nbsp;Freshwater Fish Ecology Lab
    </div>
    <div class="headertext">
      <h1>Fish and Fire<br />in Interior Alaska</h1>
    </div>
  </header>

  <slot />

  <hr class="mt-6 mb-0" />

  <div class="footer-wrapper">
    <footer>
      <div class="container mb-6 is-size-6">
        <img
          src="~/assets/UAFLogo_A_black_horiz.svg"
          alt="UAF Logo"
          class="mt-5 mb-3"
        />
        <p>
          Developed by the
          <a href="https://www.snap.uaf.edu/"
            >Scenarios Network for Alaska + Arctic Planning</a
          >
          at the University of Alaska Fairbanks
          <a href="https://uaf-iarc.org/"
            >International Arctic Research Center</a
          >.
          <br />
          Funding was provided by the U.S. Department of Defense
          <a href="https://www.serdp-estcp.org/"
            >Strategic Environmental Research and Development Program</a
          >.
        </p>

        <p>
          Data available through this tool are subject to the
          <a href="https://creativecommons.org/licenses/by/4.0/"
            >Creative Commons Attribution 4.0</a
          >
          license.
          <br />
          Please contact
          <a href="uaf-snap-data-tools@alaska.edu"
            >uaf-snap-data-tools@alaska.edu</a
          >
          with questions or comments.
          <br />
          <a href="https://uaf-snap.org/web-tools/">Visit the SNAP website</a>
          to see all of our climate tools.
        </p>

        <p>
          UA is committed to providing accessible websites.
          <a href="https://www.alaska.edu/webaccessibility/"
            >Learn more about UA&rsquo;s notice of web accessibility</a
          >.
          <br />
          If we can help you access this website&rsquo;s content,
          <a href="mailto:uaf-snap-data-tools@alaska.edu"
            >please email us at uaf-snap-data-tools@alaska.edu</a
          >.
        </p>

        <p>
          Copyright &copy; {{ year }} University of Alaska Fairbanks. All rights
          reserved.
          <br />
          The <a href="https://www.alaska.edu/"> University of Alaska</a> is an
          Equal Opportunity/Equal Access Employer and Educational institution.
          The University is committed to a
          <a href="https://www.alaska.edu/nondiscrimination/">policy of non-discrimination</a>
          against individuals on the basis of any legally protected status.
        </p>

        <p class="mb-0">Photo credit: Jeff Falke</p>
      </div>
    </footer>
    <div class="footerbar">&nbsp;</div>
  </div>
</template>

<style lang="scss" scoped>
footer {
  margin: auto 3rem;
  text-align: center;
}
img {
  width: 17rem;
}

header {
  background-image: url('~/assets/stream-fire-boreal_falke_cropped.jpg');
  height: 300px;
  .headertext {
    display: flex;
    justify-content: left;
    align-items: center;
    height: calc(300px - 2rem);
    padding-left: 2rem;
    h1 {
      font-family: 'Roboto Slab';
      color: white;
      font-size: 4.45rem;
      font-weight: 800;
      line-height: 1;
      text-shadow: 0.3rem 0.3rem 0.4rem rgba(0, 0, 0, 0.8);
    }
  }

  .headerbanner {
    text-align: center;
    background-color: #95a739;
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    padding: 0.5rem;
    letter-spacing: 0.25rem;
  }
}
.footer-wrapper {
  background-color: #f9faf9;
  a {
    color: #1863ff;
  }
}
.footerbar {
  background-color: #95a739;
}
</style>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
