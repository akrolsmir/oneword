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
      <!-- <div v-if="room.state !== 'START'">
        <h2 class="title">{{ room.round.card.from }}</h2>
        <input
          type="range"
          orient="vertical"
          v-model="room.round.guess1"
          step="10"
        />
        <h2 class="title">{{ room.round.card.to }}</h2>
      </div> -->
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
      inputs: {{ testInputs }}<br />
      peek: {{ peek }}
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
  setIn,
  getIn,
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
    state: 'CLUEING', // or "GUESSING", or "DONE"
    people: {},
    round: {
      /** Example:
      word: 'aardvark',
      roles: {
        Austin: 'CLUER',
        Alex: 'CLUER',
        Sinclair: 'GUESSER',
      }
      inputs: {
        CLUEING: {
          Austin: {
            'Enter your clue': 'arthur',
            'Submit clue!': true,
          }
          Alex: {...}
        },
        GUESSING: {
          Sinclair: { 'Enter your guess': 'aardvark', 'Submit guess': true }
        }
        DONE: {
          Austin: { 'Next stage': true }
        }
      }
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

function onJoin(room, player) {
  // TODO: Handle role assignment in config
  room.people[player.name].role = 'CLUER'
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
    const roomHelpers = useRoom(user, makeNewRoom, onJoin)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  created() {
    // this.debouncedSubmitEntries = debounce(this.submitEntries, 300)
  },
  data() {
    return {
      stages: ['CLUEING', 'GUESSING', 'DONE'],
      views: {
        CLUEING: {
          CLUER: [
            { type: 'TEXT_INPUT', label: 'Enter your clue' },
            { type: 'BUTTON', label: 'Submit clue!' },
            { type: 'BREAK' },
            { type: 'BUTTON', label: 'Skip' },
            { type: 'TEXT', label: `You typed in: [[Enter your clue]]` },
          ],
          GUESSER: [{ type: 'TEXT', label: 'Waiting for clues...' }],
          // TODO: Remove collisions
          // Or: coupld be computed check in the next entry
          /*
              Unresolved:
              - What is the structure of inputs object?
              - What is the query language for inputs?
              - How can we store code to be executed with the Vue this context?
                - Eval with `this`?
                - Or maybe just pass Vue object into the eval'd code
              - How does the computed vue function run here?
                - Option 1: Callback on certain events
                - Option 2: Vue-like computed dependency hook? Is this the same or different?
                - Option 3: Every clock tick? Or 30ms delay? Game render-engine style

              */
          /*           rules: () => {
            if (inputs('CLUEING.@CLUER').every()) {
              this.room.round.state = 'GUESSING'
            }
          },
    */
        },
        GUESSING: {
          CLUER: [{ type: 'TEXT', label: 'Waiting for GUESSER to guess...' }],
          GUESSER: [
            { type: 'TEXT_INPUT', label: 'Enter your guess' },
            { type: 'BUTTON', label: 'Submit guess!' },
          ],
          /* rules: () => {
            if (inputs('GUESSING.@GUESSER').every()) {
              this.room.round.state = 'DONE'
              // TODO: Check for correct
            }
          }, */
        },
        DONE: {
          CLUER: [
            { type: 'TEXT', label: 'CLUER, you are now done.' },
            { type: 'BUTTON', label: 'Next round' },
          ],
          GUESSER: [
            { type: 'TEXT', label: 'GUESSER, you are now done.' },
            { type: 'BUTTON', label: 'Next round' },
          ],
          /* rules: () => {
            if (inputs('DONE.@GUESSER', 'DONE.@CLUER').every()) {
              this.room.round.state = 'CLUEING'
              // TODO: Generate new word
            }
          }, */
        },
      },
      round: {
        inputs: {},
      },
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
      /*
      Pseudocode for One Word game logic:
      CLUEING:
        Show input
        Show submit button
        WHEN all cluers submitted, then state = GUESSING
          - Run on client side
            - Idempotent
      GUESSING:
        Show unique words ***
        Show input
        Show submit button
        WHEN guesser submitted, then state = DONE
      DONE:
        Show success or failure
        show next button
        WHEN next clicked, then state = CLUEING
      */
    }
  },
  computed: {
    testElements() {
      // const role = this.room.people[this.player.name].role;
      const role = 'CLUER'
      return this.views[this.room.state][role]
    },
    testInputs() {
      const path = `round.inputs.${this.room.state}.${this.player.name}`
      if (!getIn(this.room, path)) {
        setIn(this.room, path, {})
      }
      return getIn(this.room, path)
    },
    peek() {
      return this.inputs('CLUEING.@CLUER.Submit clue!')
    },
  },
  methods: {
    sanitize,
    inputs(query) {
      // Expand query strings by replacing `@ROLE` with the actual roles
      // E.g. 'CLUEING.@CLUER' => ['CLUEING.Austin', 'CLUEING.Alex'] => ['cat', 'dog']
      const parts = query.split('\.').map(this.lookup)
      console.log('parts', parts)
      return powerset(parts).map((array) =>
        getIn(this.room, `round.inputs.${array.join('.')}`)
      )
      // TODO: TEST
      // TODO: use getIn to extract actual input
    },
    lookup(part) {
      if (part.startsWith('@')) {
        // Return all players with this role
        const role = part.slice(1)
        return Object.entries(this.room.people)
          .map(([name, entry]) => (entry.role === role ? name : ''))
          .filter(Boolean)
      }
      // Not @ROLE syntax, so just return the original string wrapped in an array
      return [part]
      // TODO: TEST
    },
  },
}

// Return a linear array of every possible combination
// E.g. [[1], [2, 3], [4, 5]] => [[1, 2, 4], [1, 3, 4], [1, 2, 5], [1, 3, 5]]
// TODO: encapsulate with unit tests: https://dev.to/vuesomedev/add-testing-to-vite-4b75
function powerset(parts) {
  if (parts.length == 0) {
    return [[]]
  }
  const first = parts[0]
  const rest = powerset(parts.slice(1))
  return first.flatMap((f) => rest.map((r) => [f].concat(r)))
}
</script>
