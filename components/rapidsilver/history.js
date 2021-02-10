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
  methods: {
    prettyPointBreakdown(response, win = false) {
      return `${response.words.length ? `(${response.words.length} words + 5)` : '5 points/vote'} × ${
        response.votes.length
      } votes${win ? ' + 5 for best writing' : ''}`;
    },
  },
  template: `
  <div style="background-color: white;" class="py-3 px-5 mb-1">
    <span class="is-size-5">{{ round.chooser }}&gt; {{ round.prompt }}</span>
    <b-carousel :autoplay="false" :indicator-inside="false" indicator-style="is-dots" iconPack="fa">
      <b-carousel-item v-for="(player, i) in players " :key="i" :style="{ backgroundColor: i==0 ? 'default' : '#f9ced7', borderRadius: '4px' }">
        <div style="height: 6rem; overflow: auto">
          <history-paragraph :response='round.responses[player]' />
        </div>  
        <div>
          {{ player }}
          &mdash;
          <b-tooltip :label="round.responses[player].votes.join(', ')" position="is-bottom">
            {{ round.responses[player].votes.length }} votes
          </b-tooltip>
          <b-tooltip :label="prettyPointBreakdown(round.responses[player], i==0)" position="is-bottom">
            (+{{ scores[player] }} points)
          </b-tooltip>
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
