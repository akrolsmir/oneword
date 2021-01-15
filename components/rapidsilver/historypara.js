Vue.component('history-segment', {
  props: {
    round: Object,
    scores: Object,
  },
  data: () => ({
    shownPlayer: String, // name
  }),
  computed: {
    players() {
      return Object.keys(this.round.responses).sort((a, b) => {
        if (a[0] === this.round.choice) {
          return 1;
        } else if (b[0] === this.round.choice) {
          return -1;
        }
        return this.scores[a[0]] - this.scores[b[0]];
      });
    },
  },
  template: `
  <div style="background-color: #f5f5f5; border-radius: 4px" class="py-4 px-5 my-4">
    <span class="is-size-4">{{ round.chooser }}&gt; {{ round.prompt }}</span>
    <b-carousel :autoplay="false" iconPack="fa">
      <b-carousel-item v-for="(player, i) in players " :key="i">
        <div>
          {{ player }}
          <span v-if="i==0">(canon)</span>
          &mdash;
          <span :title="round.responses[player].votes.join(', ')">
            {{ round.responses[player].votes.length }} votes (+{{ scores[player] }} pts)
          </span> 
        </div>
        <div style="height: 100px; overflow: auto">
          <history-paragraph :response='round.responses[player]' />
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
