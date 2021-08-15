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
              class="p-1"
              v-tippy="{
                content: `${COMPONENT_NAMES[item] || item}: Drag me 👉`,
                placement: 'right',
              }"
            >
              <figure class="image is-32x32">
                <img
                  :src="`/images/tool-icons/${toolIcons[item]}`"
                  width="32"
                  height="32"
                />
              </figure>
              <template v-slot:blueprint>
                <Canvas :component="item" />
              </template>
            </Blueprint>
          </template>

          <div class="p-1 mt-6">
            <figure class="image is-32x32 mt-6">
              <img :src="`/images/tool-icons/HelpIcon32.svg`" />
            </figure>
          </div>
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
                  <h2 class="subtitle">{{ state }} Screen</h2>
                  <div class="screen">
                    <Frame component="div" :frame-id="state">
                      <Canvas component="Container">
                        <Paragraph content="Heyo~" />
                      </Canvas>
                    </Frame>
                  </div>
                </div>
              </div>
            </template>

            <template v-if="local.canvas === 'LOGIC'">
              <div class="columns" v-for="state in $roomx.rules.states">
                <div class="column is-5">
                  <h2 class="subtitle">{{ state }} Screen</h2>
                  <Frame component="div" :frame-id="state"></Frame>
                </div>
                <div class="column">
                  <!-- Where the per-state logic resides -->
                  <h2 class="subtitle">Logic for {{ state }}</h2>
                  <TwoMonaco v-model="local.code[state]" />
                </div>
              </div>
            </template>

            <template v-if="local.canvas === 'PLAYTEST'">
              <div class="columns">
                <!-- Keep stable sort order for player names -->
                <div class="column" v-for="name in $roomx.players">
                  <h2 class="subtitle">
                    {{ name }} - {{ $roomx.round.roles?.[name] }}
                  </h2>
                  <Frame
                    component="div"
                    :frame-id="$roomx.state"
                    @mouseover="setPlayerx(name)"
                  ></Frame>
                </div>
              </div>

              <h2 class="subtitle">Game data</h2>
              <TwoMonaco
                v-model="roomString"
                :heightInVh="60"
                :options="{ readOnly: true }"
              />
            </template>

            <template v-if="local.canvas === 'PUBLISH'">
              <PublishTab :room="$roomx" />
            </template>
          </div>
        </div>

        <!-- Right: Settings, options, misc controls -->
        <div class="column mx-2 mt-6">
          <SettingsPanel />

          <template v-if="local.canvas === 'LAYOUT'">
            <!-- TODO: Autosave instead of having to click this -->
            <button
              class="button is-primary is-light mt-6"
              @click="saveLayouts"
            >
              Save Layouts</button
            ><br />

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
          </template>

          <template v-if="local.canvas === 'LOGIC'">
            <button class="button is-primary is-light mt-6" @click="saveCode">
              Save Code</button
            ><br />

            <h2 class="subtitle">Docs</h2>
            <TwoMonaco
              :modelValue="docString"
              :heightInVh="70"
              :options="{
                readOnly: true,
                lineNumbers: 'off',
                glyphMargin: false,
                folding: false,
              }"
            />
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

#app {
  background-color: #f3f4f6; /* Tailwind Gray 100  */
  /* Boilerplate to full-screen this div */
  margin: 0;
  height: 100%;
  position: relative;
  overflow: auto;
}

.main-area {
  padding: 0 1rem;
  height: 100%;
}

.screen {
  min-height: 50vh;
  outline: 1px solid gray;
  background: repeating-linear-gradient(
    135deg,
    #e9e9e9,
    #e9e9e9 20px,
    #f3f4f6 20px,
    #f3f4f6 40px
  );
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
import { inject, onMounted } from 'vue'
import { useRoom } from '../composables/useRoom'
import TwoMonaco from './TwoMonaco.vue'
import cloneDeep from 'lodash/cloneDeep'
import { setRoom } from '../firebase/network'
import BulmaTabs from './BulmaTabs.vue'
import PublishTab from './PublishTab.vue'
import { docString } from './docs'

function buildCode(states) {
  const emptyCode = `// TODO: Fill this in`
  return Object.fromEntries(states.map((s) => [s, emptyCode]))
}

const rules = {
  states: ['DRAWING', 'GUESSING', 'DONE'],
  roles: ['CLUER', 'GUESSER'],
  testers: ['Alpha', 'Beta', 'Charlie', 'Delta'],
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

    layouts: {},
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

const toolIcons = {
  Flex: 'AddComponentIcon32.svg',
  Button: 'CircleToolIcon32.svg',
  Sketchpad: 'DrawToolIcon32.svg',
  // 'HelpIcon32.svg',
  Image: 'ImageUploadIcon32.svg',
  // 'LineToolIcon32.svg',
  Input: 'NewScreenIcon32.svg',
  // 'ProfilePlaceholderIcon32.svg',
  Container: 'RectangleToolIcon32.svg',
  Paragraph: 'TextToolIcon32.svg',
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
    TwoMonaco,
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
      docString,
      toolIcons,
    }
  },
  inject: ['$roomx', '$updatex', '$playerx'],
  setup() {
    const showNavbar = inject('showNavbar')
    onMounted(() => showNavbar(false))

    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom, undefined, true)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  // We use watches instead of computed functions, to invoke Editor's methods
  watch: {
    currentLayout() {
      // Sync up local with $roomx when the user changes the state
      for (const state of this.$roomx.rules.states) {
        this.$refs.editor.editor.import(
          this.$roomx.layouts[state]?.[this.local.role],
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
      for (const state of this.$roomx.rules.states) {
        updates[`layouts.${state}.${this.local.role}`] =
          this.$refs.editor.editor.export(state)
      }
      this.$updatex(updates)
    },
    saveCode() {
      const updates = {}
      for (const state of this.$roomx.rules.states) {
        updates[`code.${state}`] = this.local.code[state]
      }
      this.$updatex(updates)
    },
    resetRound() {
      this.$roomx.round = {
        roles: {},
      }
      this.$roomx.state = 'DRAWING'
      for (const tester of this.$roomx.rules.testers) {
        this.$roomx.round.roles[tester] = this.local.role
        this.$roomx.people[tester] = {}
      }
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
      return this.$roomx.layouts[this.local.state]?.[this.local.role] || []
    },
    roomString() {
      function truncator(key, value) {
        if (typeof value === 'string' && value.length > 80) {
          return value.substring(0, 40) + '...'
        }
        return value
      }
      // Return a copy without these fields:
      const mask = ({ layouts, rules, code, ...rest }) => rest
      // Return a copy with only these fields:
      // const mask = ({ state, round }) => ({ state, round })
      // Return a copy
      // const mask = (object) => ({ ...object })
      return 'let room = ' + JSON.stringify(mask(this.$roomx), truncator, 2)
    },
  },
}
</script>
