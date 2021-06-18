<template>
  <BigColumn>
    <div>
      <h1 class="fancy big">Wordmine</h1>
      You have 7 rounds to defuse the word mine!<br />
      <ul>
        <li>Each round, each player submits one hint</li>
        <li>You have 90 seconds to coordinate your team!</li>
        <li>Your team spy then indicates how many hints are correct</li>
        <li>The entire team has 3 chances to defuse!</li>
      </ul>
      Inspired by
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://amzn.to/3cQ3gdr"
        >Master Word</a
      >, a cooperative word game for 3-5 players.<br />
    </div>
    <GamesList roomDirectory="/listorama/" />
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
