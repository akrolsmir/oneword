<template>
  <BigColumn>
    <h1 class="title">{{ ruleset.metadata.title }}</h1>

    <div class="columns">
      <div class="column">
        <BulmaThumbnail :imageUrl="ruleset.metadata.thumbnail" />
      </div>
      <div class="column">
        <p>{{ ruleset.metadata.description }}</p>
      </div>
    </div>

    <button class="button is-primary mt-4">
      Play {{ ruleset.metadata.title }}
    </button>

    <div v-if="games.length > 0">
      <h1 class="title mt-6">Open Rooms</h1>

      <p v-for="game in games">game.name</p>
    </div>
  </BigColumn>
</template>

<style>
.background {
  background-color: #fafafa;
}
</style>

<script>
import { getRuleset, listActiveGames } from '../firebase/rulesets'
import BigColumn from '../components/BigColumn.vue'
import BulmaThumbnail from './BulmaThumbnail.vue'

export default {
  components: { BigColumn, BulmaThumbnail },
  data() {
    return {
      games: [],
      ruleset: { metadata: {} },
    }
  },
  async created() {
    this.ruleset = await getRuleset(this.$route.params.rulesetId)

    this.games = await listActiveGames(this.ruleset.name)
  },
}
</script>
