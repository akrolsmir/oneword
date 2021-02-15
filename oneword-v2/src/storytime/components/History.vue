<template>
  <div class="main pt-3 mb-2">
    <span class="px-5 is-size-5">
      {{ round.chooser }}&gt; {{ round.prompt }}
    </span>
    <Carousel :items-to-show="1">
      <Slide
        v-for="(player, i) in players.filter((p) => round.responses[p])"
        :key="i"
        :style="{ backgroundColor: i == 0 ? 'default' : '#f9ced7' }"
        class="px-2 pb-3"
      >
        <div class="tile is-ancestor mt-4">
          <div class="tile is-parent">
            <div class="tile is-child is-10 pr-5 has-text-left">
              <HistorySection
                :response="round.responses[player]"
                class="spacy"
              />
            </div>
            <div class="tile is-child">
              <div>{{ player }}</div>
              <div>
                <!-- <Tooltip
                  :label="round.responses[player].votes.join(', ')"
                  position="is-left"
                >
                  {{ round.responses[player].votes.length }} votes
                </Tooltip> -->
              </div>
              <div>{{ round.responses[player].words.length }} words</div>
              <div>{{ scores[player] }} points</div>
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
  data: () => ({
    shownPlayer: String, // name
  }),
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
        .map((entry) => entry[0])
    },
  },
}
</script>
<style scoped>
.main {
  background-color: #ffffff42;
  border-radius: 8px;
  overflow: visible;
}

.carousel {
  overflow: visible;
}

.is-ancestor {
  max-width: 600px;
}
</style>
