<template>
  <div id="library" class="columns p-6">
    <!-- Left-panel allows for filtering of games by player count, playtime, and tags -->
    <div class="column is-4">
      <h1 class="title has-text-white">Search</h1>
      <div class="columns">
        <div class="column">
          <label class="label">Players</label>
          <input type="number" class="input" placeholder="3" />
        </div>
        <div class="column">
          <label class="label">Max Playtime</label>
          <input type="number" class="input" placeholder="30" />
        </div>
      </div>
      <label class="label">Category</label>
      <span
        v-for="tag in ['party', 'word', 'coop', 'fast']"
        class="tag is-primary is-large mr-3 clickable"
      >
        {{ tag }}
      </span>
    </div>
    <!-- Right-panel shows the list of games -->
    <div class="column is-8">
      <GameCard
        class="m-4"
        v-for="ruleset in rulesets"
        :ruleset="ruleset"
        @click="navigateTo(ruleset.name)"
      />
    </div>
  </div>
</template>

<style>
.label {
  margin-top: 2rem;
  color: white;
}

/* Set the background to be full-height and blue */
#library {
  height: 100vh;
  background-color: #1e40af;
}
</style>

<script>
import { listRulesets } from '../firebase/rulesets'
import GameCard from './GameCard.vue'

export default {
  components: { GameCard },
  data() {
    return {
      rulesets: [],
    }
  },
  async created() {
    // Load rulesets from Firestore
    this.rulesets = await listRulesets()
  },
  methods: {
    navigateTo(rulesetId) {
      console.log(`Navigating to ${rulesetId}`)
      this.$router.push(`/${rulesetId}`)
    },
  },
}
</script>
