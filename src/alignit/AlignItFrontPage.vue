<template>
  <BigColumn>
    <div>
      <h1 class="fancy big">Align It!</h1>
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
