<template>
  <div id="studio" class="pt-4">
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
            v-model="selection.canvas"
            :titles="['SETTINGS', 'LAYOUT', 'LOGIC', 'PLAYTEST']"
          />

          <div class="main-area">
            <template v-if="selection.canvas === 'LAYOUT'">
              <!-- For each state, create a screen -->
              <div class="columns">
                <div class="column" v-for="state in $roomx.rules.states">
                  <h2 class="subtitle">{{ state }} Screen</h2>
                  <div class="screen">
                    <Frame
                      component="div"
                      :frame-id="`${state}.${selection.role}`"
                    >
                      <Canvas component="Container">
                        <Paragraph content="Heyo~" />
                      </Canvas>
                    </Frame>
                  </div>
                </div>
              </div>
            </template>

            <template v-if="selection.canvas === 'LOGIC'">
              <div class="columns" v-for="state in $roomx.rules.states">
                <div class="column is-5">
                  <h2 class="subtitle">{{ state }} Screen</h2>
                  <div class="screen">
                    <Frame
                      component="div"
                      :frame-id="`${state}.${selection.role}`"
                    ></Frame>
                  </div>
                </div>
                <div class="column">
                  <!-- Where the per-state logic resides -->
                  <h2 class="subtitle">Logic for {{ state }}</h2>
                  <MonacoEditor v-model="draftCode[state]" />
                </div>
              </div>
            </template>

            <template v-if="selection.canvas === 'PLAYTEST'">
              <div class="columns">
                <!-- Keep stable sort order for player names -->
                <div class="column" v-for="name in $roomx.players">
                  <h2 class="subtitle">
                    {{ name }} - {{ $roomx.round.roles?.[name] }}
                  </h2>
                  <div class="screen">
                    <Frame
                      component="div"
                      :frame-id="`${$roomx.state}.${$roomx.round.roles?.[name]}`"
                      @mouseover="setPlayerx(name)"
                    ></Frame>
                  </div>
                </div>
              </div>

              <h2 class="subtitle">Game data</h2>
              <MonacoEditor
                :modelValue="roomString"
                :heightInVh="60"
                :options="{ readOnly: true }"
              />
            </template>

            <template v-if="selection.canvas === 'SETTINGS'">
              <PublishTab :room="$roomx" />
            </template>
          </div>
        </div>

        <!-- Right: Settings, options, misc controls -->
        <div class="column mx-2 mt-6">
          <SettingsPanel />

          <template
            v-if="selection.canvas === 'LAYOUT' || selection.canvas === 'LOGIC'"
          >
            <!-- TODO: Autosave instead of having to click this -->
            <button
              class="button is-primary is-light mt-6"
              @click="saveRuleset"
            >
              Save Changes</button
            ><br />

            <div class="control">
              <h2 class="subtitle">Role</h2>
              <template v-for="role in $roomx.rules.roles" :key="role">
                <label class="radio">
                  <input
                    type="radio"
                    name="role"
                    :value="role"
                    v-model="selection.role"
                  />
                  {{ role }}</label
                >
                <br />
              </template>
            </div>
          </template>

          <template v-if="selection.canvas === 'LOGIC'">
            <h2 class="title is-4 mt-4">
              <a
                target="_blank"
                href="https://www.notion.so/boardless/Boardless-Games-API-3982d7177d9946e3923a1273b9aa8eaa"
                >Documentation</a
              >
            </h2>
            <h2 class="title is-4">
              <a
                target="_blank"
                href="https://www.notion.so/boardless/Boardless-Games-API-3982d7177d9946e3923a1273b9aa8eaa"
                >Game examples</a
              >
            </h2>
            <h2 class="title is-4">
              <a target="_blank" href="https://discord.com/invite/AP7ssVPPCr"
                >Stuck? Chat with us on Discord!</a
              >
            </h2>
          </template>

          <template v-if="selection.canvas === 'PLAYTEST'">
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

            <button
              class="button is-primary is-light mt-6"
              @click="resetPlaytest"
            >
              Reset game data</button
            ><br />
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

#studio {
  min-height: 100vh;
  background-color: #f3f4f6; /* Tailwind Gray 100  */
}

.main-area {
  padding: 0 1rem;
  height: 100%;
}

.screen {
  min-height: 500px;
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
import SettingsPanel, { COMPONENT_NAMES } from './components/SettingsPanel.vue'
import CraftExport from './components/CraftExport.vue'
import { inject, markRaw, onMounted } from 'vue'
import { useRoom } from '../composables/useRoom'
import MonacoEditor from './MonacoEditor.vue'
import { cloneDeep, pickBy } from 'lodash'
import BulmaTabs from '../components/BulmaTabs.vue'
import PublishTab from './PublishTab.vue'
import { docString } from './docs'
import { getRuleset } from '../firebase/rulesets'
import { setRoom } from '../firebase/network'
import { randomWord } from '../words/lists'

function buildCode(states) {
  const emptyCode = `// TODO: Fill this in`
  return Object.fromEntries(states.map((s) => [s, emptyCode]))
}

const rules = {
  states: ['DRAWING', 'GUESSING', 'DONE'],
  roles: ['CLUER', 'GUESSER'],
  testers: ['Alpha', 'Beta', 'Charlie', 'Delta'],
}

function makeNewRoom(name) {
  return {
    name,
    state: rules[0], // or "GUESSING", or "DONE"
    round: {},
    history: [],
    public: true,
    lastUpdateTime: Date.now(),

    layouts: {},
    rules,
    code: buildCode(rules.states),

    // The last editor options chosen by maker; also synced to cloud
    selection: {
      state: rules.states[0],
      role: rules.roles[0],
      canvas: 'LAYOUT',
    },
  }
}

const resolverMap = {
  // markRaw() prevents these components from being react-ified when
  // the resolverMap is passed into data, preventing an annoying warning.
  Canvas: markRaw(Canvas),
  Container: markRaw(Container),
  Paragraph: markRaw(Paragraph),
  Button: markRaw(Button),
  Input: markRaw(Input),
  Flex: markRaw(Flex),
  Sketchpad: markRaw(Sketchpad),
  Image: markRaw(Image),
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
  name: 'Studio',
  components: {
    ...resolverMap,
    Editor,
    Frame,
    SettingsPanel,
    Blueprint,
    CraftExport,
    MonacoEditor,
    BulmaTabs,
    PublishTab,
  },
  data() {
    return {
      resolverMap,
      COMPONENT_NAMES,
      docString,
      toolIcons,
    }
  },
  inject: ['$roomx', '$updatex', '$playerx', '$setx'],
  setup() {
    const showNavbar = inject('showNavbar')
    onMounted(() => showNavbar(false))

    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom, undefined, true)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  async created() {
    // If no ID was provided by vue router, create a new room
    if (this.$route.params.id === undefined) {
      const template = await getRuleset('wordone')
      const gameName =
        randomWord('adjectives') + '-' + randomWord('nouns') + '-game'

      const newRoom = cloneDeep(template)
      newRoom.metadata.status = 'DRAFT'
      newRoom.metadata.creatorId = this.user.id
      newRoom.metadata.creatorName = this.user.name
      newRoom.name = gameName
      await setRoom(newRoom)

      // Force a reload to the new room
      alert(`Creating a new game: ${gameName}!`)
      window.location = `/builder/${gameName}`
    }
  },
  // We use watches instead of computed functions, to invoke Editor's methods
  watch: {
    currentLayout() {
      // Sync up layouts and draft code when $roomx is loaded
      for (const state of this.$roomx.rules.states) {
        for (const role of this.$roomx.rules.roles) {
          this.$refs.editor.editor.import(
            this.$roomx.layouts[state]?.[role],
            `${state}.${role}`
          )
        }
        this.draftCode = cloneDeep(this.$roomx.code)
      }
    },
    'selection.canvas'() {
      if (this.selection.canvas == 'PLAYTEST') {
        this.$refs.editor.editor.disable()
      } else {
        this.$refs.editor.editor.enable()
      }
    },
  },
  methods: {
    saveRuleset() {
      // Alert the user if the game is owned by someone else.
      if (
        this.$roomx.metadata.creatorId &&
        this.$roomx.metadata.creatorId !== this.user.id
      ) {
        alert(
          `This game is owned by ${this.$roomx.metadata.creatorName}.\n` +
            `To edit it, make a copy from 'SETTINGS' > 'Change ID'`
        )
        return
      }

      const updates = {
        'metadata.creatorName': this.user.name,
        'metadata.creatorId': this.user.id,
      }
      for (const state of this.$roomx.rules.states) {
        updates[`code.${state}`] = this.draftCode[state]
        for (const role of this.$roomx.rules.roles) {
          const frameId = `${state}.${role}`
          updates[`layouts.${frameId}`] =
            this.$refs.editor.editor.export(frameId)
        }
      }
      this.$updatex(updates)

      // Ask guests to sign in. Ideally we'd block on this, but
      // signIn flow from Firestore is arbitrarily async.
      if (!this.user.id) {
        this.user.signIn()
      }
    },
    resetPlaytest() {
      // Strip out everything but the ruleset data
      const newRoom = pickBy(this.$roomx, (v, k) =>
        ['name', 'layouts', 'rules', 'code', 'selection', 'metadata'].includes(
          k
        )
      )
      this.$setx(newRoom)

      // Then re-initialize gameplay data
      this.$roomx.history = []
      this.$roomx.round = {
        roles: {},
      }
      this.$roomx.people = {}
      this.$roomx.players = []
      this.$roomx.state = this.$roomx.rules.states[0]
      for (const tester of this.$roomx.rules.testers) {
        this.$roomx.round.roles[tester] = this.selection.role
        this.$roomx.people[tester] = {}
      }
    },
    setPlayerx(name) {
      // TODO: @mouseover hack ignores tab focus
      // Also, need People to match up somehow (ideally with roles)
      this.$playerx.name = name
    },
  },
  computed: {
    currentLayout() {
      return (
        this.$roomx.layouts[this.selection.state]?.[this.selection.role] || []
      )
    },
    roomString() {
      function truncator(key, value) {
        if (typeof value === 'string' && value.length > 80) {
          return value.substring(0, 40) + '...'
        }
        return value
      }
      // Return a copy without these fields:
      const mask = ({ layouts, rules, code, selection, metadata, ...rest }) =>
        rest
      // Return a copy with only these fields:
      // const mask = ({ state, round }) => ({ state, round })
      // Return a copy
      // const mask = (object) => ({ ...object })
      return 'let room = ' + JSON.stringify(mask(this.$roomx), truncator, 2)
    },
    selection() {
      return this.$roomx.selection
    },
  },
}
</script>
