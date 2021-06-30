<!-- Rules: https://www.scorpionmasque.com/sites/scorpionmasque.com/files/mw_rules_en_28sep2020.pdf -->

<template>
  <BigColumn>
    <!-- Header -->
    <div class="card m-2 p-4">
      Category: {{ room.card.category }}<br />
      <span @click="becomeSpy">Spy</span>: {{ room.spy }}<br />
      Agents: {{ agents.join(', ') }}<br />

      <div v-if="player.name === room.spy">
        The passcode is "{{ room.card.word }}"<br />
        <button class="button" @click="newRound">Next Round</button>
        <button class="button is-danger" @click="resetRoom">Reset game</button>
      </div>
    </div>

    <div class="columns">
      <div class="column" v-for="agent in room.players">
        <!-- Current Round -->
        <div class="card m-2 p-4">
          <template v-if="room.state === 'ASKING' && agent === player.name">
            Type your clue:<br />
            <input class="input" v-model="room.round.clues[agent]" />
            <Sketchpad />
          </template>
        </div>

        <!-- History -->
        <div class="card m-2 p-4" v-for="round in room.history">
          <template v-if="agent === room.spy">
            Correct: {{ round.correct }}
          </template>

          <template v-else>
            {{ agent }}'s clue:<br />
            <h2 class="subtitle">{{ round.clues[agent] }}</h2>
          </template>
        </div>
      </div>
    </div>
  </BigColumn>
</template>

<style scoped>
.background {
  background-color: rgb(201, 224, 178);
}
</style>

<script>
import { inject } from 'vue'
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
import Timer from '../components/Timer.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import Sketchpad from './Sketchpad.vue'
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
    Sketchpad,
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
  watch: {},
  computed: {
    agents() {
      return this.room.players.filter((name) => name !== this.room.spy)
    },
  },
  methods: {
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
  },
}
</script>
