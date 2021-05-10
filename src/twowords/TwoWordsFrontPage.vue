<template>
  <BigColumn>
    <div>
      Two Words -- Like One Word, but submit two clues for two words!<br />
      A demo of One Word's Game Engine<br />
    </div>
    <GamesList roomDirectory="/twowords/" />
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
