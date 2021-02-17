<template>
  <BigColumn>
    <div>
      You and your friends find yourself in a text adventure! Each turn, one of
      your friends will decide what their character does, then you and your
      friends will continue the story. <br />
      After that, you all vote for who wrote it the best - or in other words,
      you choose your friends' adventure!
    </div>
    <GamesList roomDirectory="/storytime/" />
    <Sponsors />
    <br /><br />
  </BigColumn>
</template>

<script>
import BigColumn from '../../components/BigColumn.vue'
import GamesList from '../../components/GamesList.vue'
import Sponsors from '../../components/Sponsors.vue'

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
  background-color: #d6c6a2;
  background-image: linear-gradient(
    to right,
    rgb(245, 216, 178),
    rgb(181, 181, 255)
  );
}
</style>
