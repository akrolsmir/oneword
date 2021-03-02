<template>
  <BigColumn>
    <div>
      <h1 class="fancy big">Listography</h1>
      In one minute, come up with the perfect list for a category & mode:<br />
      <i>Forgotten Four</i> — Find four examples that nobody else will pick<br />
      <i>Threefold</i> — Think of the three most popular answers<br />
      <i>One on One</i> — Match *exactly* one other player<br /><br />
      Inspired by Listography, a party game for 3+ players.<br />
    </div>
    <GamesList roomDirectory="/list/" />
    <Sponsors />
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
  background-color: #fce7f3;
}
</style>
