Vue.component('leaderboard', {
  data() {
    return {};
  },
  props: {
    history: Array,
    state: String,
    players: Array,
    total: Number,
  },
  computed: {
    tallyScores: function () {
      // tallyScores only counts rounds that have been pushed to history
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
              awardPointsToDecoyWriter(round, player, leaderBoard);
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
            awardPointsToDecoyWriter(round, player, leaderBoard);
          });
        }
      });
      // sort the leaderBoard highest score first, then return
      const sortedPlayerScores = Object.entries(leaderBoard).sort(
        (playerScore1, playerScore2) => playerScore2[1] - playerScore1[1]
      );
      sortedPlayerScores.some((playerScore) => {
        if (playerScore[1] >= this.total) {
          this.$emit('gameover', playerScore);
        }
        return playerScore[1] >= this.total;
      });
      return sortedPlayerScores;
    },
  },
  mounted() {},
  template: `
  <div v-if="state" class="box">
    <div class="fancy has-text-centered">
      <h1>Leaderboard</h1>
    </div>
    <br/>
    <template v-for="playerScore in tallyScores">
      <div class="has-text-centered" role="alert">
        <strong>{{ playerScore[0] }}</strong>: {{ playerScore[1] }} points
      </div>
    </template>
    <br/>
    <div class="fancy has-text-centered">
      <h1>Scoring Rules</h1>
    </div>
    <br/>
    <div class="has-text-centered">
      <p>If nobody or everybody guesses the correct word pair, the clue giver scores 0 and all others score 2 </p> <br/>
      <p>If some but not all players guess the correct word pair, the clue giver and the correct guessers each scores 3 </p> <br/>
      <p>Incorrect guesses each award 1 point to whoever threw the clever decoy pair that earned the guess </p> <br/>
      <p>Players take turns giving clues in order. The game ends when the first player reaches 30 points! </p>
    </div>
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

function awardPointsToDecoyWriter(round, player, leaderBoard) {
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
