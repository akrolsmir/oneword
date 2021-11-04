<template>
  <BigColumn>
    <div>
      <h1>Quad Squad</h1>
      Cleverly categorize the world in less-than-obvious ways! Three rules:<br />
      <div class="content">
        <ul>
          <li>Name a thing.</li>
          <li>
            Everyone else decides where it goes on an ever-changing alignment
            chart.
          </li>
          <li>The more different answers you get, the more points.</li>
        </ul>
      </div>

      Designed by Chris & Suzanne Zinsli of
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://cardboardedison.com/"
        >Cardboard Edison</a
      >.<br />
    </div>
    <GamesList roomDirectory="/quadsquad/" gameName="QuadSquad" />
    <br /><br />
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import GamesList from '../components/GamesList.vue'
import Sponsors from '../components/Sponsors.vue'

export default {
  components: {
    BigColumn,
    GamesList,
    Sponsors,
  },
}
</script>
<style scoped>
@import url('https://use.typekit.net/aph6szs.css');

.background {
  background-color: #eeeeee;
}

@font-face {
  font-family: 'Grand Slang';
  src: url('/fonts/GrandSlang-Roman.woff2') format('woff2');
}

div {
  font-family: neue-haas-grotesk-display, sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

h1 {
  font-family: 'Grand Slang';
  font-size: 4rem;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.background {
  background-color: #e0e7ff;
}
</style>
