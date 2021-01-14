Vue.component('history', {
  props: {
    round: Object, // { history: Array, word: String }
  },
  computed: {
    prettyHistory() {
      let lettersRevealed = 1;
      let ph = [];
      if (this.round.word) {
        ph.push({ word: `${this.round.wordmaster} chose a word starting with ${this.round.word.charAt(0)}` });
      }
      for (const data of this.round.history) {
        if (data.event == 'ban') {
          const numClues = Object.keys(data.clues).length;
          const clues = Object.entries(data.clues)
            .map(([cluer, clue]) => `${cluer}: "${clue.hint}"`)
            .join(', ');
          ph.push({
            word: data.word,
            reason: 'banned',
            desc: numClues ? `${numClues} clues stopped` : '',
            title: clues,
          });
        } else if (data.event == 'miss') {
          const cluer = Object.keys(data.clues)[0];
          const clue = data.clues[cluer];
          ph.push(
            { word: clue.guess, reason: 'missed', desc: `${clue.guesser}'s guess` },
            { word: clue.word, reason: 'missed', desc: `${cluer}'s word`, title: `Hint, "${clue.hint}"` }
          );
        } else if (data.event == 'contact') {
          const cluer = Object.keys(data.clues)[0];
          const clue = data.clues[cluer];
          ph.push({
            word: clue.word,
            reason: 'contact',
            desc: `${clue.guesser} → ${cluer}`,
            title: `${clue.guesser} guessed ${cluer}'s hint, "${clue.hint}"`,
          });
        }
        if (data.event == 'contact' || data.event == 'nextLetter') {
          ++lettersRevealed;
          ph.push({ word: this.round.word.substr(0, lettersRevealed) + '...?' });
        }
      }
      ph.reverse();
      return ph;
    },
  },
  template: `
  <ul style="max-height: 300px; overflow-y: auto">
    <template v-for="row in prettyHistory">
      <history-row v-bind="row"/>
    </template>
  </ul>
  `,
});

Vue.component('history-row', {
  props: {
    word: String,
    reason: { type: String, default: '' },
    desc: { type: String, default: '' },
    title: { type: String, default: '' },
  },
  template: `
  <li class="history-elem" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden" :title="title">
    <span class="has-text-weight-semibold">{{ word }}</span>
    <span v-if="reason">&mdash; {{ reason }}</span>
    <span v-if="desc" class="is-italic has-text-grey-dark">({{ desc }})</span>
  </li>
  `,
});
