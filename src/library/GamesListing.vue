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

    <button class="button is-primary mt-4" @click="startGame">
      Play {{ ruleset.metadata.title }} in '{{ newGameName }}'
    </button>

    <div v-if="games.length > 0">
      <h1 class="title mt-6">Open Rooms</h1>

      <div v-for="game in games">
        <a href="#" @click="enterGame(game.name)"
          >{{ game.name }} - last played at {{ game.lastUpdateTime }}</a
        ><br />
      </div>
    </div>
  </BigColumn>
</template>

<style>
.background {
  background-color: #fafafa;
}
</style>

<script>
import { createGame, getRuleset, listActiveGames } from '../firebase/rulesets'
import BigColumn from '../components/BigColumn.vue'
import BulmaThumbnail from './BulmaThumbnail.vue'
import { randomWord } from '../words/lists'

export default {
  components: { BigColumn, BulmaThumbnail },
  data() {
    return {
      games: [],
      ruleset: { metadata: {} },
      newGameName: randomWord('nouns'),
    }
  },
  async created() {
    this.ruleset = await getRuleset(this.$route.params.rulesetId)

    this.games = await listActiveGames(this.ruleset.name)
  },
  methods: {
    async startGame() {
      await createGame(this.ruleset, this.newGameName)
      enterGame(this.newGameName)
    },
    enterGame(gameName) {
      this.$router.push(`/games/${this.ruleset.name}/${gameName}`)
    },
  },
}
</script>
