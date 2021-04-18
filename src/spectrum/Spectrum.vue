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
      <h2>Mountain</h2>
      <input type="range" orient="vertical" />
      <h2>Molehill</h2>
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
  height: 60vh;
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

function makeNewRoom(name) {
  return {
    name,
    state: 'START', // or "PREVIEW", "SEERING", "GUESSING", "END"
    winningScore: 100,
    people: {},
    round: {
      /** Example:
      card: {
        from: 'Mountain'
        to: 'Molehill'
      },
      target: 42, // from: 100, to: 0
      seer: 'Austin',
      guesses: {
        'Alex': '30',
        'Sinclair': '
      }
      */
    },
    history: [],
    // timerLength: 90,
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
    toSeering() {
      this.room.state = 'SEERING'
      this.saveRoom('state')
    },
    toGuessing() {
      this.room.state = 'GUESSING'
      this.saveRoom('state')
    },
    toEnd() {
      this.room.state = 'END'
      this.room.history.push(this.room.round)
      this.saveRoom('state', 'history')
    },
    nextRound() {
      this.room.state = 'PREVIEW'

      this.room.round = {
        // TODO: Actually update these each round
        card: {
          from: 'Mountain',
          to: 'Molehill',
        },
        seer: this.players[0],
        guesses: {},
      }

      this.saveRoom('state', 'round')
    },
  },
}
</script>
