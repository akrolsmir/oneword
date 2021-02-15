<template>
  <div>
    You and your friends find yourself in a text adventure! Each turn, one of
    your friends will decide what their character does, then you and your
    friends will continue the story. <br />
    After that, you all vote for who wrote it the best - or in other words, you
    choose your friends' adventure!
  </div>
  <GamesList roomDirectory="/storytime/room/" />
  <Sponsors />
  <br /><br />
</template>

<script>
import GamesList from '../../components/GamesList.vue'
import Sponsors from '../../components/Sponsors.vue'

export default {
  components: {
    GamesList,
    Sponsors,
  },
}
</script>
