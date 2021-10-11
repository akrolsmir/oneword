<template>
  <BigColumn>
    <div>
      <h1 class="fancy big">Align It!</h1>
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
    <GamesList roomDirectory="/alignit/" gameName="AlignIt" />
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
.background {
  background-color: #e0e7ff;
}
</style>
