<template>
  <div>
    <h1>And that's a wrap!</h1>
    <h1 class="mb-3">
      While you're here, check out two of our new games
      <a href="/storytime"> <strong> Storytime </strong> </a> and
      <a href="/pairwise"> <strong> Pairwise </strong> </a>!
    </h1>

    <canvas id="fireworks" style="width: 100%"></canvas>

    <h2>Final score: {{ score }} correct / {{ roundsInGame }} rounds</h2>
    ({{ MESSAGES[score] }})<br />
    <br />
    <template v-if="supporter">
      Hope you had fun, {{ name }}! This is all made possible by supporters like
      you 😍<br />
    </template>
    <template v-else>
      If you enjoyed One Word, consider becoming a supporter!<br />
      You can earn nice perks like private rooms, while helping cover our server
      costs.<br />
      <br />
      <a
        href="./supporter"
        @click.prevent="referSupporter('game_end')"
        class="button is-warning"
        >Become a supporter!</a
      ><br />
      <br />
    </template>
    <a href="#" @click.prevent="continuePlaying"
      >(Not done playing? Alright, click here to continue.)</a
    >
  </div>
</template>

<script>
import { referSupporter } from '../firebase/network.js'
import { startFireworks } from './fireworks.js'

const MESSAGES = {
  0: 'You do understand this is supposed to be a COOPERATIVE game, right?',
  1: "At least you can't do much worse next time!",
  2: 'Uh... Were you even trying?',
  3: "Here's a tip: try not colliding so much.",
  4: "Well, it's not the worst result I've ever seen...",
  5: "Alright, now that you've warmed up, are you ready to play for real?",
  6: 'Respectable attempt. Want to try again?',
  7: "Okay... At least it's a lucky number?",
  8: "Not bad! Now we're getting somewhere.",
  9: 'Pretty good job -- but can you make it to double digits?',
  10: 'Huh, color me impressed. Was it a fluke?',
  11: 'You really dialed it to the next level. Try a harder category next time!',
  12: 'You all must be cheating somehow, I just know it...',
  13: "Wow, that's hall of fame material right there. I am in awe.",
}

export default {
  emits: ['continue-game'],
  data() {
    return {
      MESSAGES,
    }
  },
  props: {
    score: Number,
    roundsInGame: [Number, String],
    supporter: Boolean,
    name: String,
  },
  methods: {
    continuePlaying() {
      this.$emit('continue-game')
    },
    referSupporter,
  },
  mounted() {
    // const canvasWidth = document.getElementById('#fireworks').parentElement
    // .clientWidth
    startFireworks(this.score)
  },
}
</script>
