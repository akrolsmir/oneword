<template>
  <div class="main pt-3 mb-2">
    <span class="px-5 is-size-5">
      {{ round.chooser }}&gt; {{ round.prompt }}
    </span>
    TODO Carousel goes here
    <BCarousel
      :autoplay="false"
      indicator-style="is-dots"
      indicator-position="is-top"
      iconPack="fa"
      style="min-height: initial"
    >
      <BCarouselItem
        v-for="(player, i) in players.filter((p) => round.responses[p])"
        :key="i"
        :style="{ backgroundColor: i == 0 ? 'default' : '#f9ced7' }"
        class="px-5 pb-3"
      >
        <div class="tile is-ancestor mt-4">
          <div class="tile is-parent">
            <div class="tile is-child is-10 pr-5">
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
      </BCarouselItem>
    </BCarousel>
  </div>
</template>
<script>
import HistorySection from './HistorySection.vue'
import BCarousel from './buefy/Carousel.vue'
import BCarouselItem from './buefy/CarouselItem.vue'

export default {
  components: {
    HistorySection,
    BCarousel,
    BCarouselItem,
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
  overflow: hidden;
}
</style>
