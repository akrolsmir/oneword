<template>
  <BigColumn :showPanes="true">
    <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template>

    <Editor
      ref="editor"
      component="div"
      class="container"
      :resolverMap="resolverMap"
    >
      <Frame component="div" class="preview-panel">
        <Canvas component="Container">
          <Paragraph content="Heyo~" />
        </Canvas>
      </Frame>
    </Editor>
  </BigColumn>
</template>

<style scoped>
.background {
  background-color: #e0e7ff;
}
</style>

<script>
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
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

function makeNewRoom(name) {
  // TODO: fill in. Right now, we only ever preview after creating in TwoCraft.
  return {}
}

export default {
  components: {
    BigColumn,
    Chatbox,
    // TODO: Not all needed
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
    }
  },
  inject: ['$roomx', '$updatex'],
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom)
    return Object.assign(roomHelpers, { user })
  },
  mounted() {
    this.$refs.editor.editor.disable()
  },
  watch: {
    'room.state'() {
      const role = 'CLUER'
      const layout = this.$roomx.layouts[this.$roomx.state][role]
      if (layout) {
        this.$refs.editor.editor.import(layout)
      }
    },
  },
}
</script>
