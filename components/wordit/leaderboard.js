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
      //initiate leaderBoard at 0 for every player
      _.forEach(this.players, (player) => {
        leaderBoard[player] = 0;
      });
      // Each player's client computes point totals for everyone independently
      _.forEach(this.history, (round) => {
        // If all players found the clueGiver's image
        if (_.every(_.values(round.votes), (guess) => guess === round.word)) {
          // all players from that round who are still in the room
          _.forEach(leaderBoard, function (_score, player) {
            // EXCEPT clueGiver gets 2pts automatically
            if (player !== round.clueGiver && round.votes[player]) {
              // player entry is guaranteed to exist, b/c forEach is against leaderboard
              leaderBoard[player] += 2;
            }
          });
        }
        // If some players found the clueGiver's word combo but not all, clueGiver gets 3 points
        else if (_.includes(_.values(round.votes), round.word)) {
          // But only if clueGiver is among the current players.
          if (Number.isInteger(leaderBoard[round.clueGiver])) {
            leaderBoard[round.clueGiver] += 3;
          }
          // And then also award 3 pts to every guesser still in the game who guessed correctly
          _.forEach(leaderBoard, function (_score, player) {
            // Note that clueGiver does not vote
            if (round.votes[player] === round.word) {
              leaderBoard[player] += 3;
            }
            // Incorrect guesses awards 1 point to whoever threw the decoy that earned the guess
            else {
              // _.invert makes the mapping {word -> player} from allWords
              const goodDecoyTosser = _.get(_.invert(round.allWords), round.votes[player]);
              // check goodDecoyTosser exists. It'll be null when player is clueGiver
              if (goodDecoyTosser && leaderBoard[goodDecoyTosser]) {
                if (leaderBoard[goodDecoyTosser]) {
                  leaderBoard[goodDecoyTosser] += 1;
                }
              }
            }
          });
        }
        // nobody guessed the word
        else {
          // ClueGiver gets 0 points but all others of that round get 2pts automatically
          _.forEach(leaderBoard, function (_score, player) {
            // player only gets points if they voted that round.
            if (round.votes[player]) {
              leaderBoard[player] += 2;
            }
            // also give a point to whoever threw the decoy earned this player's guess
            const goodDecoyTosser = _.get(_.invert(round.allWords), round.votes[player]);
            // check goodDecoyTosser exists, they might have left the game.
            if (goodDecoyTosser && leaderBoard[goodDecoyTosser]) {
              leaderBoard[goodDecoyTosser] += 1;
            }
          });
        }
      });
      //sort the leaderBoard highest score first; inefficient sort since index not numeric.
      const result = {};
      for (var i = 0; i < this.players.length; i++) {
        // Find the top scorer and delete from leaderBoard
        var topPlayer;
        var topScore;
        _.forEach(leaderBoard, function (score, player) {
          if (!topScore || score >= topScore) {
            topScore = score;
            topPlayer = player;
          }
        });
        result[topPlayer] = topScore;
        delete leaderBoard[topPlayer];
      }
      console.log(result);
      return result;
    },
  },
  mounted() {},
  template: `
  <div v-if="state" class="box">
    <div class="fancy has-text-centered">
      <h1>Leaderboard</h1>
    </div>
    <br/>
    <template v-for="(points, player) in tallyPoints">
      <div class="has-text-centered" role="alert"><strong>{{ player }}</strong>: {{ points }} points</div>
    </template>
  </div>
`,
});
