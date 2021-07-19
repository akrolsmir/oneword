<template>
  <div id="app" class="pt-4">
    <Editor
      ref="editor"
      component="div"
      class="container"
      :resolverMap="resolverMap"
    >
      <div class="columns">
        <div class="column">
          <h2 class="subtitle">Components</h2>

          <!-- For each component, create a draggable Blueprint -->
          <template
            v-for="item in [
              'Paragraph',
              'Button',
              'Input',
              'Container',
              'Flex',
              'Sketchpad',
            ]"
          >
            <Blueprint component="button" class="button is-dark m-2">
              {{ item }}
              <template v-slot:blueprint>
                <Canvas :component="item" />
              </template>
            </Blueprint>
          </template>

          <h2 class="subtitle">Settings</h2>
          <SettingsPanel />

          <h2 class="subtitle">Roomx</h2>
          <TwoPrism v-model="roomString" :readonly="true" />

          <hr />
        </div>
        <div class="column">
          <h2 class="subtitle">Preview</h2>
          <Frame component="div" class="preview-panel">
            <Canvas component="Container">
              <Paragraph content="Heyo~" />
              <Paragraph content="There comes a danger up in this club," />
              <Paragraph
                content="When we get started and we ain't gonna stop..."
              />
              <Paragraph content="We gonna turn it up til it gets too hot." />
              <Button label="Heyo!" />
            </Canvas>
          </Frame>
          <router-link :to="`/twopreview/${room.name}`"
            >Preview game</router-link
          >

          <!-- Display a layout based on a specific state and role -->
          <div class="control">
            <h2 class="subtitle">State</h2>
            <template v-for="state in $roomx.rules.states" :key="state">
              <label class="radio">
                <input
                  type="radio"
                  name="state"
                  :value="state"
                  v-model="local.state"
                />
                {{ state }}</label
              >
              <br />
            </template>
          </div>

          <div class="control">
            <h2 class="subtitle">Role</h2>
            <template v-for="role in $roomx.rules.roles" :key="role">
              <label class="radio">
                <input
                  type="radio"
                  name="role"
                  :value="role"
                  v-model="local.role"
                />
                {{ role }}</label
              >
              <br />
            </template>
          </div>

          <!-- TODO: Autosave instead of having to click this -->
          <button class="button" @click="saveLayout">Save Layout</button>

          <!-- Where the per-state logic resides -->
          <h2 class="subtitle">Logic for {{ local.state }}</h2>
          <TwoPrism v-model="$roomx.code[local.state]" />
        </div>
      </div>
    </Editor>
  </div>
</template>

<style>
/* Show a blue box around selected node, and green box on hover */
.cf-node-selected {
  box-shadow: 0px 0px 4px 4px rgba(55, 144, 216, 0.459);
}

[draggable='true'] {
  transition: all 0.1s ease-in-out;
}

[draggable='true']:hover {
  box-shadow: 0px 0px 4px 4px rgba(0, 128, 0, 0.432);
  cursor: move;
}

.subtitle {
  margin-bottom: 0.5rem !important;
  margin-top: 2rem;
}

html {
  background-color: #e0e7ff;
}
</style>

<script>
import { Canvas, Editor, Frame, Blueprint } from './v-craft/index'
import Container from './components/CraftDiv.vue'
import Paragraph from './components/CraftParagraph.vue'
import Flex from './components/CraftFlex.vue'
import Button from './components/CraftButton.vue'
import Input from './components/CraftInput.vue'
import Sketchpad from './components/CraftSketchpad.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import CraftExport from './components/CraftExport.vue'
import { inject } from '@vue/runtime-core'
import { useRoom } from '../composables/useRoom'
import TwoPrism from './TwoPrism.vue'
import { nanoid } from 'nanoid'

function emptyLayout() {
  return `[
    {
      "componentName": "Canvas",
      "props": {
        "component": "Container"
      },
      "children": [
      ],
      "addition": {},
      "uuid": "${nanoid()}"
    }
  ]`
}

function buildLayouts(states, roles) {
  const fromRoles = () =>
    Object.fromEntries(roles.map((r) => [r, emptyLayout()]))

  return Object.fromEntries(states.map((s) => [s, fromRoles()]))
}

function buildCode(states) {
  const emptyCode = `// TODO: Fill this in`
  return Object.fromEntries(states.map((s) => [s, emptyCode]))
}

const rules = {
  states: ['DRAWING', 'GUESSING', 'DONE'],
  roles: ['CLUER', 'GUESSER'],
}

function makeNewRoom(name) {
  return {
    name,
    state: 'DRAWING', // or "GUESSING", or "DONE"
    round: {},
    history: [],
    public: true,
    lastUpdateTime: Date.now(),

    layouts: buildLayouts(rules.states, rules.roles),
    rules,
    code: buildCode(rules.states),
  }
}

export default {
  name: 'App',
  components: {
    Canvas,
    Editor,
    Frame,
    Paragraph,
    Button,
    Input,
    Flex,
    Sketchpad,
    SettingsPanel,
    Blueprint,
    CraftExport,
    TwoPrism,
  },
  data() {
    return {
      resolverMap: {
        Canvas,
        Container,
        Paragraph,
        Button,
        Input,
        Flex,
        Sketchpad,
      },
      local: {
        state: rules.states[0],
        role: rules.roles[0],
        code: buildCode(rules.states),
      },
    }
  },
  inject: ['$roomx', '$updatex'],
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  watch: {
    currentLayout() {
      this.$refs.editor.editor.import(this.currentLayout)
    },
  },
  methods: {
    saveLayout() {
      const layoutString = this.$refs.editor.editor.export()
      this.$updatex({
        [`layouts.${this.local.state}.${this.local.role}`]: layoutString,
      })
    },
  },
  computed: {
    currentLayout() {
      return this.$roomx.layouts[this.local.state][this.local.role] || []
    },
    roomString() {
      function truncator(key, value) {
        if (typeof value === 'string' && value.length > 80) {
          return value.substring(0, 40) + '...'
        }
        return value
      }

      return JSON.stringify(this.$roomx, truncator, 2)
    },
  },
}
</script>
