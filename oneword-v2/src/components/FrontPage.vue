<template>
  <BigColumn class="background">
    <div>
      <div class="fancy big">Welcome!</div>
      This is an online game based on
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://amzn.to/2xV5lUm"
      >
        Just One
      </a>
      , a co-op word game for 3+ players.<br />
      In each of the 13 rounds, come up with a one-word hint for the
      guesser...<br />
      But beware: duplicate hints are discarded!<br />
    </div>
    <GamesList roomDirectory="/room/" />
    <Sponsors />
    <br /><br />
  </BigColumn>
</template>

<script>
import BigColumn from './BigColumn.vue'
import GamesList from './GamesList.vue'
import Sponsors from './Sponsors.vue'

export default {
  components: {
    BigColumn,
    GamesList,
    Sponsors,
  },
}
</script>
