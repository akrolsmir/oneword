<template>
  <BigColumn :showPanes="true">
    <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template>

    <div>
      <label class="checkbox mb-4">
        <input type="checkbox" v-model="showEditor" />
        Show Editor</label
      >

      <div id="game" v-if="!showEditor">
        <h1 class="title">Game</h1>
        <h2 class="subtitle">State: {{ room.state }}</h2>
        <h2 class="subtitle">Players: {{ room.players }}</h2>

        Controls:
        <button class="button" @click="nextStage">Next Stage</button>
        <button class="button" @click="resetRoom">Reset Room</button>
        <br /><br />
        <div class="box">
          <ElementList
            :elements="gameElements"
            :inputs="gameInputs"
            :push-changes="pushChanges"
          />
        </div>
        inputs: {{ gameInputs }}<br />
        <div style="white-space: pre-wrap">
          peek: {{ JSON.stringify(peek, null, 2) }}
        </div>
      </div>

      <div v-show="showEditor" id="editor">
        <h1 class="title">Editor</h1>

        <span class="subtitle">Game Preview</span>
        <div class="box">
          <ElementList
            :elements="editorElements"
            :inputs="editorInputs"
            :push-changes="() => {}"
          />
        </div>

        <label class="subtitle">Player Name</label>
        <input class="input mb-4" v-model="editor.player.name" />

        <div class="select is-multiple mr-4">
          <label class="subtitle">State</label>
          <select v-model="editor.state" multiple>
            <option v-for="state in rules.states" :key="state">
              {{ state }}
            </option>
          </select>
        </div>

        <div class="select is-multiple">
          <label class="subtitle">Role</label>
          <select v-model="editor.role" multiple>
            <option v-for="role in Object.keys(rules.roles)" :key="role">
              {{ role }}
            </option>
          </select>
        </div>
        <br />
        <br />
        <label class="subtitle"
          >View for {{ editor.state }}.{{ editor.role }}</label
        >
        <prism-editor
          class="my-editor"
          v-model="editorViewCode"
          :highlight="highlighter"
          line-numbers
          readonly
        ></prism-editor>
        <br />
        <label class="subtitle">Rules for {{ editor.state }}</label>
        <prism-editor
          class="my-editor"
          v-model="rules.code[editor.state]"
          :highlight="highlighter"
          line-numbers
          readonly
        ></prism-editor>
      </div>
    </div>
  </BigColumn>
</template>

<style scoped>
.background {
  background-color: #e0e7ff;
}

/* required class for vue-prism-editor */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #ffffff;
  color: #2d2d2d;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>

<script>
// import Prism Editor
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css' // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/themes/prism-tomorrow.css' // import syntax highlighting styles

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
  room.people[player.name].role = player.name === 'Austin' ? 'GUESSER' : 'CLUER'
}

export default {
  components: {
    BigColumn,
    Chatbox,
    Timer,
    Nametag,
    ShareLink,
    ElementList,
    PrismEditor,
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
            { type: 'BREAK' },
            { type: 'BUTTON', label: 'Skip' },
            { type: 'TEXT', label: `You typed in: [[Enter your clue]]` },
          ],
          GUESSER: [{ type: 'TEXT', label: 'Waiting for clues...' }],
        },
        GUESSING: {
          CLUER: [{ type: 'TEXT', label: 'Waiting for GUESSER to guess...' }],
          GUESSER: [
            { type: 'TEXT_INPUT', label: 'Enter your guess' },
            { type: 'BUTTON', label: 'Submit guess!' },
          ],
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
        },
      },
      round: {
        inputs: {},
      },
      rules: {
        goal: {
          type: 'COLLAB',
          end: 'ROUNDS',
          target: 13,
        },
        states: ['CLUEING', 'GUESSING', 'DONE'],
        roles: {
          CLUER: 1,
          GUESSER: 'REST',
        },
        code: {
          CLUEING: `if (inputs('CLUEING.@CLUER.Submit clue!').every(Boolean)) {
  room.state = 'GUESSING'
  changes.push('state')
  // TODO: check for collisions, etc
}`,
          GUESSING: `if (inputs('GUESSING.@GUESSER.Submit guess!').every(Boolean)) {
  room.state = 'DONE'
  changes.push('state')
}`,
          DONE: `const anyone = inputs('DONE.@CLUER.Next round').concat(
  inputs('DONE.@GUESSER.Next round')
)
if (anyone.some(Boolean)) {
  room.state = 'CLUEING'
  room.history.push(room.round)
  room.round = {}
  changes.pop() // Remove the original input change; it's already in history
  changes.push('state', 'history', 'round')
}`,
        },
      },
      showEditor: false,
      editor: {
        state: 'CLUEING',
        role: 'CLUER',
        player: {
          name: 'Tester',
        },
      },
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
  computed: {
    gameElements() {
      const role = this.room.people[this.player.name]?.role
      return this.views[this.room.state][role] || []
    },
    gameInputs() {
      const path = `round.inputs.${this.room.state}.${this.player.name}`
      if (!getIn(this.room, path)) {
        setIn(this.room, path, {})
      }
      return getIn(this.room, path)
    },
    peek() {
      // Just used for debugging
      return {}
      // return this.room.editor
      // return this.inputs('CLUEING.@CLUER.Submit clue!').every(Boolean)
    },
    editorElements() {
      return this.views[this.editor.state]?.[this.editor.role] || []
    },
    editorInputs() {
      const path = `editor.inputs.${this.editor.state}.${this.editor.player.name}`
      if (!getIn(this.room, path)) {
        setIn(this.room, path, {})
      }
      return getIn(this.room, path)
    },
    editorViewCode() {
      return JSON.stringify(this.editorElements, null, 2)
    },
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.js) // languages.<insert language> to return html with markup
    },
    sanitize,
    inputs(query) {
      // Expand query strings by replacing `@ROLE` with the actual roles
      // E.g. 'CLUEING.@CLUER' => ['CLUEING.Austin', 'CLUEING.Alex'] => ['cat', 'dog']
      const parts = query.split('\.').map(this.lookup)
      return powerset(parts).map((array) =>
        getIn(this.room, `round.inputs.${array.join('.')}`)
      )
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
    },
    async pushChanges() {
      // Could also narrow down with the element's label
      const changes = [`round.inputs.${this.room.state}.${this.player.name}`]

      // Code should be scoped down to:
      // this.room
      // this.inputs
      // changes => TODO this should just be a `setRoom(path, change)`
      // Can also whitelist other primitives (e.g. Boolean)
      const sandbox = { inputs: this.inputs, room: this.room, changes, Boolean }

      // Rules should be evaluated initially, and when each input is changed
      // NEXT: UI for each screen of the game, with a JS rules editor (and eval)
      const compiledRules = Object.fromEntries(
        Object.entries(this.rules.code).map(([state, code]) => [
          state,
          compileCode(code),
        ])
      )

      compiledRules[this.room.state](sandbox)

      await this.saveRoom(...changes)
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

// Eval code, but only accessing constants from the provided sandbox
// From https://blog.risingstack.com/writing-a-javascript-framework-sandboxed-code-evaluation/
const sandboxProxies = new WeakMap()

function compileCode(src) {
  src = 'with (sandbox) {' + src + '}'
  const code = new Function('sandbox', src)

  const has = (target, key) => true
  const get = (target, key) =>
    key === Symbol.unscopables ? undefined : target[key]

  return function (sandbox) {
    if (!sandboxProxies.has(sandbox)) {
      const sandboxProxy = new Proxy(sandbox, { has, get })
      sandboxProxies.set(sandbox, sandboxProxy)
    }
    return code(sandboxProxies.get(sandbox))
  }
}
</script>
