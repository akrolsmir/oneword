<template>
  <div v-if="state" class="box">
    <div class="fancy has-text-centered">
      <h1>Scoring Rules</h1>
    </div>
    <br />
    <div class="has-text-centered">
      <p>
        If nobody or everybody guesses the correct word pair, the clue giver
        scores 0 and all others score 2
      </p>
      <br />
      <p>
        If some but not all players guess the correct word pair, the clue giver
        and the correct guessers each scores 3
      </p>
      <br />
      <p>
        Incorrect guesses each award 1 point to whoever threw the clever decoy
        pair that earned the guess
      </p>
      <br />
      <p>
        Players take turns giving clues in order. The game ends when the first
        player reaches 30 points!
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: {
    state: String,
  },
}
</script>
