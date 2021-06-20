<!-- Rules: https://www.scorpionmasque.com/sites/scorpionmasque.com/files/mw_rules_en_28sep2020.pdf -->

<template>
  <BigColumn :showPanes="true">
    <!-- Chatbox temporarily broken due to $i18n missing -->
    <!-- <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template> -->

    <!-- Heading -->
    <div class="card p-4 mb-4">
      Category: {{ room.card.category }}<br />
      <span @click="becomeSpy">Spy</span>: {{ room.spy }}<br />
      Agents: {{ agents.join(', ') }}<br />

      <div v-if="player.name === room.spy">
        The passcode is "{{ room.card.word }}"<br />
        <button class="button" @click="newRound">Next Round</button>
        <button class="button" @click="toGuiding">To Guiding</button>
        <button class="button is-danger" @click="resetRoom">Reset game</button>
      </div>
    </div>

    <h2 class="title">Round {{ room.history.length + 1 }}, {{ room.state }}</h2>

    <!-- Current Round -->
    <div class="columns">
      <div class="column" v-for="agent in agents">
        <div class="card p-4">
          <template v-if="room.state === 'ASKING' && agent === player.name">
            Type your clue:<br />
            <input
              class="input"
              v-model="player.clue"
              @input="debouncedSubmitClue"
            />
          </template>
        </div>
      </div>
      <div class="column">
        <div class="card p-4 has-background-grey-dark has-text-grey-light">
          <template v-if="room.state === 'GUIDING' && player.name === room.spy">
            {{ '👍'.repeat(room.round.correct) || '❌' }}
            <br />
            <button class="button is-small" @click="lessCorrect">➖</button>
            <button class="button is-small" @click="moreCorrect">➕</button>
            <button class="button is-small" @click="newRound">Submit</button>
          </template>
        </div>
      </div>
    </div>

    <!-- Dummy div to prevent layout from shifting when Timer appears -->
    <div style="height: 24px" v-if="room.state === 'GUIDING'"></div>
    <Timer
      style="margin: 0 auto"
      class="timer mb-2"
      ref="timer"
      :length="room.timerLength"
      :on-finish="toGuiding"
      v-if="room.state === 'ASKING' && room.timerLength > 0"
      :key="room.round.state"
    ></Timer>

    <!-- Note: Would be cool to see a countdown to the 7th word -->
    <!-- History rows -->
    <div v-for="round in room.history.slice().reverse()">
      <div class="columns">
        <div class="column" v-for="agent in agents">
          <div class="card p-4">
            {{ agent }}'s clue:<br />
            <h2 class="subtitle">{{ round.clues[agent] }}</h2>
          </div>
        </div>
        <div class="column">
          <div class="card p-4 has-background-grey-dark has-text-grey-light">
            {{ '👍'.repeat(round.correct) || '❌' }}
          </div>
        </div>
      </div>
    </div>
  </BigColumn>
</template>

<style scoped>
.background {
  background-color: #ffece0;
}
</style>

<script>
/*
TODOs to MVP
- Agent ability to guess the password instead
- 90 sec timer

Then:
- Consistent theming
- Support 2 clues when exactly 2 agents
- Mobile gameplay?
*/

import { inject } from 'vue'
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
import Timer from '../components/Timer.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import { narrowCards, allCards } from './cards.js'
import { useRoom } from '../composables/useRoom.js'
import {
  debounce,
  listIncludes,
  pickRandom,
  sanitize,
  orderedEntries,
  pickFromBag,
} from '../utils'

function makeNewRoom(name) {
  return {
    name,
    state: 'ASKING', // "START", "ASKING", "GUIDING",
    rounds: 7,
    people: {
      // TODO: Roles: 1 x SPY, N x AGENT
    },
    spy: 'Caustic',
    card: {
      category: 'Animal',
      word: 'tiger',
    },
    round: {
      /** Example: */
      clues: {
        Austin: 'lion',
        Boston: 'fuzzy',
      },
      defuses: {
        Austin: true,
      },
      correct: 1,
      highlight: 'Boston',
    },
    /*
      player: {
        clue, // TODO: should this be directly on ROOM, or a PLAYER copy?
      }
    */
    history: [],
    invalidEntries: {},
    timerLength: 90,
    public: true,
    lastUpdateTime: Date.now(),
  }
}

export default {
  components: {
    BigColumn,
    Chatbox,
    Timer,
    Nametag,
    ShareLink,
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  created() {
    this.debouncedSubmitClue = debounce(this.submitClue, 300)
  },
  data() {},
  watch: {
    'room.state'(state) {
      // Reset past entries when the round moves forward.
      if (state === 'GUIDING') {
        this.player.clue = ''
      }
    },
  },
  computed: {
    agents() {
      return this.room.players.filter((name) => name !== this.room.spy)
    },
  },
  methods: {
    toGuiding() {
      this.room.state = 'GUIDING'
      this.saveRoom('state')
    },
    newRound() {
      this.room.history.push(this.room.round)
      this.room.round = {
        clues: {},
        defuses: {},
        correct: 0,
      }
      this.room.state = 'ASKING'
      this.saveRoom('state', 'history', 'round')
    },
    submitClue() {
      this.room.round.clues[this.player.name] = this.player.clue
      this.saveRoom(`round.clues.${this.player.name}`)
    },
    becomeSpy() {
      this.room.spy = this.player.name
      this.saveRoom('spy')
    },
    moreCorrect() {
      this.room.round.correct = Math.min(
        this.room.round.correct + 1,
        this.agents.length
      )
      this.saveRoom('room')
    },
    lessCorrect() {
      this.room.round.correct = Math.max(0, this.room.round.correct - 1)
      this.saveRoom('room')
    },
  },
}
</script>
