<template>
  <div>
    <h1>{{ $t('onewordGameEnd.wrapUp') }}</h1>
    <h1 class="mb-3">
      {{ $t('onewordGameEnd.wrapUpText') }}
      <a href="/storytime"> <strong> Storytime </strong> </a
      >{{ $t('onewordGameEnd.and') }}
      <a href="/pairwise"> <strong> Pairwise </strong> </a
      >{{ $t('onewordGameEnd.escalation') }}
    </h1>

    <canvas id="fireworks" style="width: 100%"></canvas>

    <h2>
      {{
        $t('onewordGameEnd.finalScoreText', {
          score: score,
          round: roundsInGame,
        })
      }}
    </h2>
    ({{ $t(MESSAGES[score]) }})<br />
    <br />
    <template v-if="supporter">
      {{ $t('onewordGameEnd.textForSupporters', { name: name }) }}<br />
    </template>
    <template v-else>
      {{ $t('onewordGameEnd.textForSellingSupporter') }}<br />
      {{ $t('onewordGameEnd.textForSupporterPrivilege') }}<br />
      <br />
      <a
        href="./supporter"
        @click.prevent="referSupporter('game_end')"
        class="button is-warning"
        >{{ $t('onewordGameEnd.becomeSupporter') }}</a
      ><br />
      <br />
    </template>
    <a href="#" @click.prevent="continuePlaying">{{
      $t('onewordGameEnd.continuePlaying')
    }}</a>
  </div>
</template>

<script>
import { referSupporter } from '../firebase/network.js'
import { startFireworks } from './fireworks.js'

const MESSAGES = {
  0: 'onewordGameEnd.message0',
  1: 'onewordGameEnd.message1',
  2: 'onewordGameEnd.message2',
  3: 'onewordGameEnd.message3',
  4: 'onewordGameEnd.message4',
  5: 'onewordGameEnd.message5',
  6: 'onewordGameEnd.message6',
  7: 'onewordGameEnd.message7',
  8: 'onewordGameEnd.message8',
  9: 'onewordGameEnd.message9',
  10: 'onewordGameEnd.message10',
  11: 'onewordGameEnd.message11',
  12: 'onewordGameEnd.message12',
  13: 'onewordGameEnd.message13',
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
    // Game ended, time to survey!
    UserLeap('track', 'GAME_OVER')
  },
}
</script>
