<template>
  <BigColumn>
    <div>
      <h1 class="fancy big">Insider</h1>
      Welcome to Insider! This game is like 20 Questions, but with a secret spy
      who knows the answer. Try to find the answer, then find out who the spy
      is!
      <GamesList roomDirectory="/insider/" gameName="Insider" />
      <br /><br />
    </div>
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
