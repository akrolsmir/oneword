<template>
  <div id="app" class="pt-4">
    <Editor ref="editor" component="div" :resolverMap="resolverMap">
      <div class="columns is-gapless">
        <div class="column is-narrow mx-2 mt-6">
          <!-- Left: For each component, create a draggable Blueprint -->
          <template
            v-for="item in [
              'Paragraph',
              'Image',
              'Button',
              'Input',
              'Container',
              'Flex',
              'Sketchpad',
            ]"
          >
            <Blueprint
              component="div"
              class="blueprint"
              v-tippy="{ content: 'Drag me 👉' }"
            >
              {{ COMPONENT_NAMES[item] || item }}
              <template v-slot:blueprint>
                <Canvas :component="item" />
              </template>
            </Blueprint>
            <br />
          </template>
        </div>

        <!-- Center: Main editor area -->
        <div class="column is-8 mx-2">
          <BulmaTabs
            v-model="local.canvas"
            :titles="['LAYOUT', 'LOGIC', 'PLAYTEST', 'PUBLISH']"
          />

          <div class="main-area">
            <template v-if="local.canvas === 'LAYOUT'">
              <!-- For each state, create a screen -->
              <div class="columns">
                <div class="column" v-for="state in $roomx.rules.states">
                  <p class="has-text-centered">{{ state }} Screen</p>
                  <!-- TODO remove temp hack setting DONE to DEFAULT -->
                  <Frame component="div" :frame-id="state">
                    <Canvas component="Container">
                      <Paragraph content="Heyo~" />
                      <Paragraph
                        content="There comes a danger up in this club,"
                      />
                      <Paragraph
                        content="When we get started and we ain't gonna stop..."
                      />
                      <Paragraph
                        content="We gonna turn it up til it gets too hot."
                      />
                      <Button label="Heyo!" />
                    </Canvas>
                  </Frame>
                </div>
              </div>
            </template>

            <template v-if="local.canvas === 'LOGIC'">
              <div class="columns" v-for="state in $roomx.rules.states">
                <div class="column is-5">
                  <h2 class="subtitle">Layout for {{ state }}</h2>
                  <Frame component="div" :frame-id="state"></Frame>
                </div>
                <div class="column">
                  <!-- Where the per-state logic resides -->
                  <h2 class="subtitle">Logic for {{ state }}</h2>
                  <TwoPrism v-model="local.code[state]" />
                </div>
              </div>
            </template>

            <template v-if="local.canvas === 'PLAYTEST'">
              <div class="columns">
                <div
                  class="column"
                  v-for="name in ['Alpha', 'Beta', 'Charlie', 'Delta']"
                >
                  <h2 class="subtitle has-text-centered">{{ name }}</h2>
                  <Frame
                    component="div"
                    :frame-id="$roomx.state"
                    @mouseover="setPlayerx(name)"
                  ></Frame>
                </div>
              </div>

              <h2 class="subtitle">Game data</h2>
              <TwoPrism v-model="roomString" :readonly="true" />
            </template>

            <template v-if="local.canvas === 'PUBLISH'">
              <PublishTab :room="$roomx" />
            </template>
          </div>
        </div>

        <!-- Right: Settings, options, misc controls -->
        <div class="column is-3 mx-2 mt-6">
          <SettingsPanel />

          <template v-if="local.canvas === 'LAYOUT'">
            <!-- TODO: Autosave instead of having to click this -->
            <button
              class="button is-primary is-light mt-6"
              @click="saveLayouts"
            >
              Save Layouts</button
            ><br />
          </template>

          <template v-if="local.canvas === 'LOGIC'">
            <button class="button is-primary is-light mt-6" @click="saveCode">
              Save Code</button
            ><br />
          </template>

          <template v-if="local.canvas === 'PLAYTEST'">
            <!-- Jump to a specific state. -->
            <div class="control">
              <h2 class="subtitle">State</h2>
              <template v-for="state in $roomx.rules.states" :key="state">
                <label class="radio">
                  <input
                    type="radio"
                    name="state"
                    :value="state"
                    v-model="$roomx.state"
                  />
                  {{ state }}</label
                >
                <br />
              </template>
            </div>

            <button class="button is-primary is-light mt-6" @click="resetRound">
              Reset game data</button
            ><br />

            <input class="input mt-6" v-model="local.duplicateName" />
            <button class="button" @click="duplicateRoom(local.duplicateName)">
              Duplicate as "{{ local.duplicateName }}"
            </button>
          </template>
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

div.blueprint {
  text-align: center;
  outline: 1px dashed gray;
  padding: 0.25rem;
}

#app {
  background-color: #f3f4f6; /* Tailwind Gray 100  */
  /* Boilerplate to full-screen this div */
  margin: 0;
  height: 100%;
  position: relative;
  overflow: auto;
}

.main-area {
  background-color: lightgray;
  padding: 1rem;
  height: 100%;
}
</style>

<script>
import { Canvas, Editor, Frame, Blueprint } from './v-craft/index'
import Container from './components/CraftDiv.vue'
import Paragraph from './components/CraftParagraph.vue'
import Flex from './components/CraftFlex.vue'
import Button from './components/CraftButton.vue'
import Image from './components/CraftImage.vue'
import Input from './components/CraftInput.vue'
import Sketchpad from './components/CraftSketchpad.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import CraftExport from './components/CraftExport.vue'
import { inject, onMounted } from '@vue/runtime-core'
import { useRoom } from '../composables/useRoom'
import TwoPrism from './TwoPrism.vue'
import { nanoid } from 'nanoid'
import cloneDeep from 'lodash/cloneDeep'
import { setRoom } from '../firebase/network'
import BulmaTabs from './BulmaTabs.vue'
import PublishTab from './PublishTab.vue'

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

const COMPONENT_NAMES = {
  Paragraph: 'Text',
  Button: 'Button',
  Input: 'Text Input',
  Container: 'Vertical Box',
  Flex: 'Horizontal Box',
  Sketchpad: 'Sketchpad',
  Image: 'Image',
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

const resolverMap = {
  Canvas,
  Container,
  Paragraph,
  Button,
  Input,
  Flex,
  Sketchpad,
  Image,
}

export default {
  name: 'App',
  components: {
    ...resolverMap,
    Editor,
    Frame,
    SettingsPanel,
    Blueprint,
    CraftExport,
    TwoPrism,
    BulmaTabs,
    PublishTab,
  },
  data() {
    return {
      resolverMap,
      COMPONENT_NAMES,
      local: {
        state: rules.states[0],
        role: rules.roles[0],
        code: buildCode(rules.states),
        canvas: 'LAYOUT',
        duplicateName: 'game-copy',
      },
    }
  },
  inject: ['$roomx', '$updatex', '$playerx'],
  setup() {
    const showNavbar = inject('showNavbar')
    onMounted(() => showNavbar(false))

    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  // We use watches instead of computed functions, to invoke Editor's methods
  watch: {
    currentLayout() {
      // Sync up local with $roomx when the user changes the state
      for (const state of rules.states) {
        this.$refs.editor.editor.import(
          this.$roomx.layouts[state][this.local.role],
          state
        )
        this.local.code = this.$roomx.code
      }
    },
    'local.canvas'() {
      if (this.local.canvas == 'PLAYTEST') {
        this.$refs.editor.editor.disable()
      } else {
        this.$refs.editor.editor.enable()
      }
    },
  },
  methods: {
    saveLayouts() {
      const updates = {}
      for (const state of rules.states) {
        updates[`layouts.${state}.${this.local.role}`] =
          this.$refs.editor.editor.export(state)
      }
      this.$updatex(updates)
    },
    saveCode() {
      const updates = {}
      for (const state of rules.states) {
        updates[`code.${state}`] = this.local.code[state]
      }
      this.$updatex(updates)
    },
    resetRound() {
      this.$roomx.round = {}
      this.$roomx.state = 'DRAWING'
    },
    setPlayerx(name) {
      // TODO: @mouseover hack ignores tab focus
      // Also, need People to match up somehow (ideally with roles)
      this.$playerx.name = name
    },
    async duplicateRoom(duplicateName) {
      const newRoom = cloneDeep(this.$roomx)
      newRoom.name = duplicateName
      await setRoom(newRoom)
      // Navigate to the new room
      this.$router.push(`/twocraft/${duplicateName}`)
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
      // Return an object showing only these fields
      const mask = ({ state, round }) => ({ state, round })
      return JSON.stringify(mask(this.$roomx), truncator, 2)
    },
  },
}
</script>
