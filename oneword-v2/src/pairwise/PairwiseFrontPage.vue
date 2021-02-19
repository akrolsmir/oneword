<template>
  <BigColumn>
    <div>
      <div class="fancy big">Welcome to Pairwise!</div>
      This is an online word game inspired by
      <strong
        ><a
          target="_blank"
          rel="noopener noreferrer"
          href="https://amazon.com/dp/2914849656"
          >Dixit</a
        ></strong
      >, originally a picture-based board game. <br />
      Write a clue, trick your friends, find the pair! <br />
      But beware: If your clue is either too obvious or too off the wall, your
      friends will get ahead!<br />
    </div>
    <GamesList roomDirectory="/storytime/" />
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
  background-color: #fcd6d8;
}
</style>
