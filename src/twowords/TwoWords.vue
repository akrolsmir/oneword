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
      <ElementList :elements="testElements" :inputs="testInputs" />
      inputs: {{ testInputs }}
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
import ElementList from './components/ElementList.vue'
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

/**
 * metadata: {...}
 *
 * rules: {
 *   goal: {
 *     type: 'COLLAB' // or 'COMPETE' or 'TEAM'
 *     end: 'POINTS' // or 'ROUNDS'
 *     target: 30 // or 13 rounds
 *   },
 *   stages: ["PREVIEW", "CLUE1", "GUESS1", "CLUE2", "GUESS2", "END"],
 *   roles: {
 *      CLUER: '1'
 *      GUESSER: 'N'
 *      // TODO: different role assignments per player count, ala Avalon
 *   },
 *   nextRole: () => { JS code...}
 *   views: {
 *     CLUE1: {
 *       CLUER: { cluerView... }
 *       GUESSER: { guesserView... }
 *     }
 *     ...
 *     transition: () => { JS code... }
 *   }
 *   scoring: (player, history) => {
 *     for (round in history) => {
 *       round.inputs.CLUE1.CLUER == round.inputs.GUESS1.GUESSER
 *   or  round.inputs.CLUE1[player] == round.inputs.GUESS1
 *     }
 *   }
 * }
 *
 * // This is basically Streamlit
 * view: [
 *   // outputs...
 *   {
 *     type: TEXT
 *     content: "Hello {{ player }}. You are cluing for {{ word }}"
 *   }
 *   // inputs...
 *   {
 *     type: TEXT_INPUT,
 *     label: 'Submit your clue',
 *   }
 *   {
 *     type: BUTTON,
 *     label: 'Submit'
 *   }
 *   // Could combine into "SUBMIT_TEXT_INPUT" primitive
 * ]
 *
 */

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
    ElementList,
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
  data() {
    return {
      testElements: [
        { type: 'TEXT_INPUT', label: 'Type type type' },
        {
          type: 'BUTTON',
          label: 'Submit button!',
        },
        { type: 'BREAK' },
        {
          type: 'BUTTON',
          label: 'Or clear, maybe?',
        },
        {
          type: 'TEXT',
          label: `You typed in: [[Type type type]]`,
        },
      ],
      testInputs: {},
      // rules: {
      //   goal: {
      //     type: 'COLLAB',
      //     end: 'ROUNDS',
      //     target: 13,
      //   },
      //   stages: ['CLUEING', 'GUESSING', 'DONE'],
      //   roles: {
      //     CLUER: 1,
      //     GUESSER: 'REST',
      //   },
      // },
      // transitions: {
      //   DONE: () => {
      //     // TODO: Generate new word, move random player
      //     // Serializing functions:
      //     // https://stackoverflow.com/questions/7395686/how-can-i-serialize-a-function-in-javascript/51123745#51123745
      //     // or Eval: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
      //   },
      // },
    }
  },
  computed: {},
  methods: {
    sanitize,
  },
}
</script>
