<template>
  <div class="main pt-3 mb-2">
    <div class="px-5 is-size-5">{{ round.chooser }}&gt; {{ round.prompt }}</div>
    <Carousel :items-to-show="1" wrap-around>
      <Slide
        v-for="(player, i) in players"
        :key="i"
        :style="{ backgroundColor: i == 0 ? 'default' : '#00000010' }"
      >
        <div class="tile is-ancestor px-5 py-1">
          <div class="tile is-parent">
            <div class="tile is-child is-10 pr-5 has-text-left">
              <HistorySection
                :response="round.responses[player]"
                class="spacy"
              />
            </div>
            <div class="tile is-child">
              <div>{{ player }}</div>
              <div
                v-tippy="{ content: round.responses[player].votes.join(', ') }"
              >
                {{ round.responses[player].votes.length }} votes
              </div>
              <div>{{ round.responses[player].words.length }} words</div>
              <div v-tippy="{ content: explainScore(round, player, i) }">
                {{ scores[player] }} points
              </div>
            </div>
          </div>
        </div>
      </Slide>

      <template #addons>
        <Navigation />
        <Pagination />
      </template>
    </Carousel>
  </div>
</template>
<script>
import HistorySection from './HistorySection.vue'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'

export default {
  components: {
    HistorySection,
    Carousel,
    Slide,
    Pagination,
    Navigation,
  },
  props: {
    round: Object,
    scores: Object,
  },
  computed: {
    // list of players sorted by score, bonus words, then brevity (highest first)
    players() {
      return Object.entries(this.round.responses)
        .sort(
          ([player1, response1], [player2, response2]) =>
            this.scores[player2] - this.scores[player1] ||
            response2.words.length - response1.words.length ||
            response1.story.length - response2.story.length
        )
        .map(([player, _]) => player)
    },
  },
  methods: {
    explainScore,
  },
}

function explainScore(round, player, i) {
  const votes = round.responses[player].votes.length
  const words = round.responses[player].words.length
  return `${votes} votes × (5 + ${words} words) + ${words} words`
}
</script>
<style scoped>
.main {
  background-color: #ffffff42;
  border-radius: 8px;
}

.spacy {
  white-space: pre-wrap;
}
</style>
