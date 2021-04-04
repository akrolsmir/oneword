<template>
  <BigColumn>
    <div>
      <div class="columns">
        <div class="column"><img src="/images/asplos-2021.png" /><br /></div>
        <div class="column">
          <div class="fancy big">Welcome!</div>
          This is an online game based on
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://amzn.to/2xV5lUm"
          >
            Just One</a
          >, a co-op word game for 3+ players.<br /><br />
          In each of the 13 rounds, come up with a one-word hint for the
          guesser...<br /><br />
          But beware: duplicate hints are discarded!<br /><br />
        </div>
      </div>
    </div>
    <GamesList roomDirectory="/asplos-2021/" />
    <br /><br />
  </BigColumn>
</template>

<script>
import BigColumn from '/src/components/BigColumn.vue'
import GamesList from '/src/components/GamesList.vue'
import Sponsors from '/src/components/Sponsors.vue'

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
  background-color: #fee2e2;
}
</style>
