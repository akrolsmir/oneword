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
  <div style="background-color: #f5f5f5;" class="py-3 px-5 mb-1">
    <span class="is-size-5">{{ round.chooser }}&gt; {{ round.prompt }}</span>
    <b-carousel :autoplay="false" :indicator-inside="false" indicator-style="is-dots" iconPack="fa">
      <b-carousel-item v-for="(player, i) in players " :key="i" :style="{ backgroundColor: i==0 ? 'default' : '#f9ced7', borderRadius: '4px' }">
        <div style="height: 6rem; overflow: auto">
          <history-paragraph :response='round.responses[player]' />
        </div>  
        <div>
          {{ player }}
          &mdash;
          <span :title="round.responses[player].votes.join(', ')">
            {{ round.responses[player].votes.length }} votes (+{{ scores[player] }} pts)
          </span> 
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
      (a, b) => this.response.story.indexOf(a) - this.response.story.indexOf(b)
    );
    for (const word of words) {
      const i = rest.indexOf(word);
      elements.push(rest.substring(0, i), createElement('span', { class: { 'has-text-weight-semibold': true } }, word));
      rest = rest.substring(i + word.length);
    }
    elements.push(rest);
    return createElement('p', elements);
  },
});
