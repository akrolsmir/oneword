Vue.component('leadershipboard', {
  data() {
    return {};
  },
  props: {
    history: Array,
    state: String,
    players: Array,
  },
  methods: {
    tallyPoints() {
      // Tallypoints only counts rounds that have been pushed to history
      const scoreBoard = {};
      //initiate scoreBoard at 0 for every player
      _.forEach(this.players, (player) => {
        scoreBoard[player] = 0;
      });
      // Each player's client computes point totals for everyone independently
      _.forEach(this.history, (round) => {
        // If all players found the clueGiver's image, all except clueGiver gets 2pts automatically
        if (_.every(_.values(round.votes), (guess) => guess === round.word)) {
          _.forEach(scoreBoard, function (_score, player) {
            if (player !== round.clueGiver) {
              scoreBoard[player] += 2;
            }
          });
        }
        // If some players found the clueGiver's image but not all, clueGiver gets 3 points
        else if (_.includes(_.values(round.votes), round.word)) {
          // But check if clueGiver is a current player. If not, set it.
          if (scoreBoard[round.clueGiver]) {
            scoreBoard[round.clueGiver] += 3;
          } else {
            scoreBoard[round.clueGiver] = 3;
          }
          // And then also award 3 pts to every guesser who guessed correctly
          _.forEach(scoreBoard, function (_score, player) {
            if (round.votes[player] === round.word) {
              scoreBoard[player] += 3;
            }
            // Incorrect guesses awards 1 point to whoever threw the decoy that earned the guess
            else {
              // invert makes the mapping [word -> player] from allWords
              const goodDecoyTosser = _.get(_.invert(round.allWords), round.votes[player]);
              if (goodDecoyTosser) {
                if (scoreBoard[goodDecoyTosser]) {
                  scoreBoard[goodDecoyTosser] += 1;
                } else {
                  scoreBoard[goodDecoyTosser] = 1;
                }
              }
            }
          });
        }
        // nobody guessed the word
        else {
          // ClueGiver gets 0 points but all others get 2pts automatically
          _.forEach(scoreBoard, function (_score, player) {
            if (player !== round.clueGiver) {
              scoreBoard[player] += 2;
              // also give a point to whoever threw the decoy earned this player's
              const goodDecoyTosser = _.get(_.invert(round.allWords), round.votes[player]);
              if (goodDecoyTosser) {
                if (scoreBoard[goodDecoyTosser]) {
                  scoreBoard[goodDecoyTosser] += 1;
                } else {
                  scoreBoard[goodDecoyTosser] = 1;
                }
              }
            }
          });
        }
      });
      //sort the scoreboard, highest score first.
      var result = _.reduceRight(
        _.invert(_.invert(scoreBoard)),
        function (current, val, key) {
          current[key] = parseInt(val);
          return current;
        },
        {}
      );
      return result;
    },
  },
  mounted() {},
  template: `
  <div v-if="state" class="box">
    <div class="fancy has-text-centered">
      <h1>Leadership Board</h1>
    </div>
    <br/>
    <template v-for="(points, player) in tallyPoints()">
      <div class="has-text-centered" role="alert"><strong>{{ player }}</strong>: {{ points }} points</div>
    </template>
  </div>
`,
});
