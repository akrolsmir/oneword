<template>
  <BigColumn>
    <div>
      <h1 class="fancy big">Sketchmatch</h1>
      Sketch out your clues, and find the hidden match! Inspired by
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://amzn.to/3cQ3gdr"
        >Subtext</a
      >, a drawing deduction game for 4-8 players.<br />
    </div>
    <GamesList roomDirectory="/sketchmatch/" />
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
