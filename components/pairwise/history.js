Vue.component('pointhistory', {
  data() {
    return {};
  },
  props: {
    history: Array,
    state: String,
    players: Array,
  },
  computed: {
    tallyScores: function () {
      const scoreHistory = [];

      // // tallyScores only counts rounds that have been pushed to history
      // const leaderBoard = {};
      // //initiate leaderBoard at 0 for every current player
      // this.players.forEach((player) => {
      //   leaderBoard[player] = 0;
      // });
      // Each player's client computes point totals for everyone independently
      this.history.forEach((round) => {
        const pointsThisRound = [];
        // If all players found the clueGiver's phrase
        if (Object.values(round.votes).every((guess) => guess === round.word)) {
          // all players from that round who are still in the room
          pointsThisRound.push('Everyone guessed ' + round.clueGiver + `'s clue correctly`);
          this.players.forEach((player) => {
            // EXCEPT clueGiver gets 2pts automatically
            if (player !== round.clueGiver && round.votes[player]) {
              // player entry is guaranteed to exist, b/c forEach is against leaderboard
              pointsThisRound.push(player + ' scores 2 free points');
            }
          });
          pointsThisRound.push('and ' + round.clueGiver + ' gets no points :c');
        }
        // If some players found the clueGiver's word combo but not all, clueGiver gets 3 points
        else if (Object.values(round.votes).includes(round.word)) {
          // And then also award 3 pts to every guesser still in the game who guessed correctly
          this.players.forEach((player) => {
            // Note that clueGiver does not vote
            if (round.votes[player] === round.word) {
              pointsThisRound.push(player + ` guessed correctly! +3 points!`);
            }
            // Incorrect guesses awards 1 point to whoever threw the decoy that earned the guess
            else {
              awardPointsToDecoyWriter(round, player, this.players, pointsThisRound);
            }
          });
          // But only if clueGiver is among the current players.
          if (Number.isInteger(this.players.includes(round.clueGiver))) {
            pointsThisRound.push('And ' + round.clueGiver + ' gets 3 points!');
          }
        }
        // nobody guessed the word
        else {
          pointsThisRound.push('Nobody guess correctly! So ' + round.clueGiver + ' gets 0 points :c');
          // ClueGiver gets 0 points but all other players of that round get 2pts automatically
          this.players.forEach((player) => {
            // player only gets points if they voted that round.
            if (round.votes[player]) {
              pointsThisRound.push(player + ' scores 2 free points');
            }
            awardPointsToDecoyWriter(round, player, this.players, pointsThisRound);
          });
        }
        scoreHistory.push(pointsThisRound);
      });
      return scoreHistory;
    },
  },
  mounted() {},
  template: `
  <div v-if="state" class="box">
    <div class="fancy has-text-centered">
      <h1>Points History</h1>
    </div>
    <br/>
    <template v-for="(pointsThisRound, index) in tallyScores">
      <div class="has-text-centered">
        <strong>Round {{index + 1}}</strong>
      </div>
      <br/>
      <div v-for="points in pointsThisRound">
        <div class="has-text-centered"> {{ points }} </div>
        <br>
      </div>
      <br/>
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

function awardPointsToDecoyWriter(round, player, players, pointsThisRound) {
  // Invert makes the mapping {word -> player} from allWords
  const wordToPlayer = invert(round.allWords);
  const playersVote = round.votes[player];
  if (playersVote && wordToPlayer[playersVote]) {
    // also give a point to whoever threw the decoy earned this player's guess
    const goodDecoyTosser = wordToPlayer[playersVote];
    if (players.includes(goodDecoyTosser)) {
      // check goodDecoyTosser exists, they might have left the game.
      pointsThisRound.push(player + ` guessed '` + playersVote + `', so +1 for ` + goodDecoyTosser);
    }
  }
}
