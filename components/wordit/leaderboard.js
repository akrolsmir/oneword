Vue.component('leaderboard', {
  data() {
    return {};
  },
  props: {
    history: Array,
    state: String,
    players: Array,
  },
  computed: {
    tallyPoints: function () {
      // Tallypoints only counts rounds that have been pushed to history
      const leaderBoard = {};
      //initiate leaderBoard at 0 for every current player
      this.players.forEach((player) => {
        leaderBoard[player] = 0;
      });
      // Each player's client computes point totals for everyone independently
      this.history.forEach((round) => {
        // If all players found the clueGiver's phrase
        if (Object.values(round.votes).every((guess) => guess === round.word)) {
          // all players from that round who are still in the room
          Object.keys(leaderBoard).forEach((player) => {
            // EXCEPT clueGiver gets 2pts automatically
            if (player !== round.clueGiver && round.votes[player]) {
              // player entry is guaranteed to exist, b/c forEach is against leaderboard
              leaderBoard[player] += 2;
            }
          });
        }
        // If some players found the clueGiver's word combo but not all, clueGiver gets 3 points
        else if (Object.values(round.votes).includes(round.word)) {
          // But only if clueGiver is among the current players.
          if (Number.isInteger(leaderBoard[round.clueGiver])) {
            leaderBoard[round.clueGiver] += 3;
          }
          // And then also award 3 pts to every guesser still in the game who guessed correctly
          Object.keys(leaderBoard).forEach((player) => {
            // Note that clueGiver does not vote
            if (round.votes[player] === round.word) {
              leaderBoard[player] += 3;
            }
            // Incorrect guesses awards 1 point to whoever threw the decoy that earned the guess
            else {
              // Invert makes the mapping {word -> player} from allWords
              const wordToPlayer = invert(round.allWords);
              const playersVote = round.votes[player];
              if (playersVote && wordToPlayer[playersVote]) {
                // also give a point to whoever threw the decoy earned this player's guess
                const goodDecoyTosser = wordToPlayer[playersVote];
                if (leaderBoard[goodDecoyTosser]) {
                  // check goodDecoyTosser exists, they might have left the game.
                  leaderBoard[goodDecoyTosser] += 1;
                }
              }
            }
          });
        }
        // nobody guessed the word
        else {
          // ClueGiver gets 0 points but all other players of that round get 2pts automatically
          Object.keys(leaderBoard).forEach((player) => {
            // player only gets points if they voted that round.
            if (round.votes[player]) {
              leaderBoard[player] += 2;
            }
            // Invert makes the mapping {word -> player} from allWords
            const wordToPlayer = invert(round.allWords);
            const playersVote = round.votes[player];
            if (playersVote && wordToPlayer[playersVote]) {
              // also give a point to whoever threw the decoy earned this player's guess
              const goodDecoyTosser = wordToPlayer[playersVote];
              if (leaderBoard[goodDecoyTosser]) {
                // check goodDecoyTosser exists, they might have left the game.
                leaderBoard[goodDecoyTosser] += 1;
              }
            }
          });
        }
      });
      // sort the leaderBoard highest score first
      return Object.entries(leaderBoard).sort(([_p1, s1], [_p2, s2]) => s2 - s1);
    },
  },
  mounted() {},
  template: `
  <div v-if="state" class="box">
    <div class="fancy has-text-centered">
      <h1>Leaderboard</h1>
    </div>
    <br/>
    <template v-for="(playerpoints, _index) in tallyPoints">
      <div class="has-text-centered" role="alert">
        <strong>{{ playerpoints[0] }}</strong>: {{ playerpoints[1] }} points
      </div>
    </template>
  </div>
`,
});

function invert(obj) {
  let inverted_obj = {};
  Object.keys(obj).forEach((key) => {
    inverted_obj[obj[key]] = key;
  });
  return inverted_obj;
}
