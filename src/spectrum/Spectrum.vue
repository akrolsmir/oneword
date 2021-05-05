<template>
  <BigColumn :showPanes="true">
    <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template>

    <div class="fullscreen">
      <div v-if="room.state !== 'START'">
        <h2 class="title">{{ room.round.card.from }}</h2>
        <input
          type="range"
          orient="vertical"
          v-model="room.round.guess1"
          step="10"
        />
        <h2 class="title">{{ room.round.card.to }}</h2>
      </div>
      <h1 class="subtitle">State: {{ room.state }}</h1>
      <h1 class="subtitle">Players: {{ room.players }}</h1>

      <div v-if="room.state === 'PREVIEW'">
        Here are the two words on your spectrum! Ready to go?
        <!-- Show both areas but not the target -->
      </div>

      <div v-if="room.state === 'CLUE1'">
        <div v-if="player.name === room.round.cluer">
          You are trying to clue your team! <br />
          Target: {{ room.round.target }} <br />
          Clue:
          <input
            class="input"
            v-model="room.round.clue1"
            placeholder="Give a clue"
          />
        </div>
        <div v-else>Waiting for {{ room.round.cluer }} to give a clue...</div>
        <!-- Show the target & an entry box for the cluer -->
      </div>

      <div v-if="room.state === 'GUESS2'">
        <div v-if="player.name === room.round.cluer">
          Waiting for your team to interpret the clue...
        </div>
        <div v-else>
          Guess what {{ room.round.cluer }} meant by "{{ room.round.clue1 }}"
        </div>
        <!-- Show both areas but not the target -->
      </div>

      <div v-if="room.state === 'END'">
        Your team guessed {{ room.round.clue1 }}, and the target was
        {{ room.round.target }}
        <!-- Show the result -->
      </div>

      Controls:
      <button class="button" @click="nextStage">Next Stage</button>
      <button class="button" @click="resetRoom">Reset Room</button>
    </div>
  </BigColumn>
</template>

<style scoped>
.background {
  background-color: #e0e7ff;
}

.fullscreen {
  height: 100vh;
}

/* Vertical slider from https://stackoverflow.com/a/15935838 */
input[type='range'][orient='vertical'] {
  writing-mode: bt-lr; /* IE */
  -webkit-appearance: slider-vertical; /* WebKit */
  width: 8px;
  height: 40vh;
  padding: 0 5px;
}
</style>

<script>
import { inject } from 'vue'
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
import Timer from '../components/Timer.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import { useRoom } from '../composables/useRoom.js'
import {
  debounce,
  listIncludes,
  pickRandom,
  sanitize,
  orderedEntries,
  pickFromBag,
} from '../utils'
import { nouns } from '../words/parts-of-speech'

function makeNewRoom(name) {
  return {
    name,
    state: 'START', // or "PREVIEW", "CLUE1", "GUESS1", "CLUE2", "GUESS2", "END"
    people: {},
    round: {
      /** Example:
      card: {
        from: 'Mountain'
        to: 'Molehill'
      },
      target: 7, // from: 10 to 0, but only 9 to 1 are valid; 0 = shoot for moon
      cluer: 'Austin',
      clue1: 'My laundry pile'
      guess1: 4,
      clue2: 'Everest',
      guess2: 9,
      */
    },

    history: [],
    timers: {
      clue1: 90,
      guess1: 90,
      clue2: 30,
      guess2: 30,
    },
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
    // this.debouncedSubmitEntries = debounce(this.submitEntries, 300)
  },
  computed: {},
  methods: {
    sanitize,
    nextStage() {
      const propsToSave = ['state']

      switch (this.room.state) {
        case 'PREVIEW':
          this.room.state = 'CLUE1'
          break
        case 'CLUE1':
          this.room.state = 'GUESS2' // Note: Skips GUESS1 and CLUE2 for now
          break
        case 'GUESS1':
          // TODO: Should depend on the results. But assume always clue2 for now
          this.room.state = 'CLUE2'
          break
        case 'CLUE2':
          this.room.state = 'GUESS2'
          break
        case 'GUESS2':
          this.room.state = 'END'
          this.room.history.push(this.room.round)
          propsToSave.push('history')
          break
        case 'START':
        case 'END':
          this.room.state = 'PREVIEW'
          this.room.round = {
            // TODO: Actually randomly generate these each round
            card: {
              from: pickRandom(nouns),
              to: pickRandom(nouns),
            },
            target: Math.floor(Math.random() * 10), // Random from 0 to 9
            cluer: this.room.players[0], // TODO: randomly re-pick
          }
          propsToSave.push('round')
      }
      this.saveRoom(...propsToSave)
    },
  },
}
</script>
