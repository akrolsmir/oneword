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
    <h2 class="subtitle">{{ instructions }}</h2>
    <template v-if="room.state === 'ASKING' && playerRole === 'AGENT'">
      <button
        v-if="room.round.defuses[player.name]"
        class="button is-info is-small"
        @click="defusePassword(false)"
      >
        Give a clue instead
      </button>
      <button
        v-else
        class="button is-danger is-small"
        @click="defusePassword(true)"
      >
        Guess the password instead
      </button>
      <br /><br />
    </template>

    <!-- Hm... maybe should still be columns.
    Agents can see what everyone is writing
    And so can the agent
    Rules of Online Board Games:
    - Share as much board state as possible
    - Keep people unblocked to keep them engaged
    - Downtime is the enemy
     -->

    <!-- Current Round -->
    <div class="columns">
      <div class="column" v-for="agent in agents">
        <div class="card p-4" :class="{ defuse: room.round.defuses[agent] }">
          <template v-if="room.state === 'ASKING'">
            <!-- TODO: suggest a random adjective -->
            <input
              v-if="agent === player.name"
              class="input"
              placeholder="Write a clue"
              v-model="player.clue"
              @input="debouncedSubmitClue"
            />
            <h2 v-else class="subtitle">
              {{ room.round.clues[agent] || '...' }}
            </h2>
          </template>
          <template v-else>
            <h2 class="subtitle">{{ room.round.clues[agent] || '🤷' }}</h2>
          </template>
          <span class="is-size-7">{{
            agent + (room.round.defuses[agent] ? ' - Password Guess!' : '')
          }}</span>
        </div>
      </div>
      <div class="column">
        <div
          class="card p-4 has-background-grey-dark has-text-grey-light"
          v-if="room.state === 'GUIDING'"
        >
          <template v-if="player.name === room.spy">
            <h2 class="subtitle">
              {{ '👍'.repeat(room.round.correct) || '❌' }}
            </h2>
            <button class="button is-small" @click="lessCorrect">➖</button>
            <button class="button is-small" @click="moreCorrect">➕</button>
            <button class="button is-small" @click="newRound">Submit</button>
          </template>
          <template v-else> Waiting for the spy to answer... </template>
        </div>
      </div>
    </div>

    <!-- Dummy div to prevent layout from shifting when Timer appears -->
    <div style="height: 24px" v-if="room.state === 'GUIDING'"></div>
    <Timer
      style="margin: 0 auto"
      class="timer mb-4"
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
          <div class="card p-4" :class="{ defuse: round.defuses[agent] }">
            <h2 class="subtitle">{{ round.clues[agent] || '🤷' }}</h2>
            <span class="is-size-7">{{
              agent + (round.defuses[agent] ? ' - Password Guess!' : '')
            }}</span>
          </div>
        </div>
        <div class="column">
          <div class="card p-4 has-background-grey-dark has-text-grey-light">
            <h2 class="subtitle">
              {{ '👍'.repeat(round.correct) || '❌' }}
            </h2>
            <span class="is-size-7">{{ room.spy }}</span>
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

.defuse {
  box-shadow: 0 0 8px 5px tomato;
}
</style>

<script>
/*
TODOs to MVP
- Batch of words to play with

Then:
- Spy ability to mark one card as correct?
- Grade passwords automatically
- Consistent theming
- Support 2 clues when exactly 2 agents
- Writing the answer in clue should lose the game
- Support hovering over cards, and then marking them right/wrong
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
    playerRole() {
      return this.room.spy === this.player.name ? 'SPY' : 'AGENT'
    },
    instructions() {
      const rules = {
        AGENT: {
          ASKING: 'Ask your spy about a clue!',
          GUIDING: 'Your spy is deciding how many are right...',
        },
        SPY: {
          ASKING: 'Your agents are submitting their clues...',
          GUIDING: 'Give 1 thumb up for each correct clue!',
        },
      }
      return rules[this.playerRole][this.room.state]
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
    defusePassword(value) {
      this.room.round.defuses[this.player.name] = value
      this.saveRoom(`round.defuses.${this.player.name}`)
    },
  },
}
</script>
