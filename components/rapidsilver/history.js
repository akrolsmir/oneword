Vue.component('history-segment', {
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
          (a, b) =>
            this.scores[b[0]] - this.scores[a[0]] ||
            b[1].words.length - a[1].words.length ||
            a[1].story.length - b[1].story.length
        )
        .map((entry) => entry[0]);
    },
  },
  template: `
  <div style="background-color: white; border-radius: 8px; overflow: hidden" class="pt-3 mb-2">
    <span class="px-5 is-size-5">{{ round.chooser }}&gt; {{ round.prompt }}</span>
    <b-carousel :autoplay="false" indicator-style="is-dots" indicator-position="is-top" iconPack="fa" style="min-height: initial">
      <b-carousel-item
        v-for="(player, i) in players " :key="i"
        :style="{ backgroundColor: i==0 ? 'default' : '#f9ced7' }"
        class="px-5 pb-3"
      >
      <div class="tile is-ancestor mt-4">
        <div class="tile is-parent">
          <div class="tile is-child is-10 pr-5">
            <history-paragraph :response='round.responses[player]' style="white-space: pre-wrap"/>
          </div>
          <div class="tile is-child">
            <div>{{ player }}</div>
            <div>
              <b-tooltip :label="round.responses[player].votes.join(', ')" position="is-left">
                {{ round.responses[player].votes.length }} votes
              </b-tooltip>
            </div>
            <div>{{ round.responses[player].words.length}} words</div>
            <div>{{ scores[player] }} points</div>
          </div>
        </div>
      </div>
      </b-carousel-item>
    </b-carousel>
  </div>
  `,
});

Vue.component('history-paragraph', {
  props: {
    response: {
      type: Object, // { story: String, words: Array }
    },
  },
  render(createElement) {
    let elements = [];
    let rest = this.response.story;
    const words = [...new Set(this.response.words)].sort(
      (a, b) => this.response.story.toLowerCase().indexOf(a) - this.response.story.toLowerCase().indexOf(b)
    );
    for (const word of words) {
      const i = rest.toLowerCase().indexOf(word);
      elements.push(
        rest.substring(0, i),
        createElement('span', { class: { 'has-text-weight-semibold': true } }, rest.substring(i, i + word.length))
      );
      rest = rest.substring(i + word.length);
    }
    elements.push(rest);
    return createElement('p', elements);
  },
});
