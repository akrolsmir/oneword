<template>
  <div id="app" class="pt-4">
    <Editor component="div" class="container" :resolverMap="resolverMap">
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
            ]"
          >
            <Blueprint component="button" class="button is-dark m-2">
              {{ item }}
              <template v-slot:blueprint>
                <Canvas :component="item" />
              </template>
            </Blueprint>
          </template>

          <h2 class="subtitle mt-6">Settings</h2>
          <SettingsPanel />

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
</style>

<script>
import { Canvas, Editor, Frame, Blueprint } from './v-craft/index'
import Container from './components/CraftDiv.vue'
import Paragraph from './components/CraftParagraph.vue'
import Flex from './components/CraftFlex.vue'
import Button from './components/CraftButton.vue'
import Input from './components/CraftInput.vue'
import SettingsPanel from './components/SettingsPanel.vue'

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
    SettingsPanel,
    Blueprint,
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
      },
    }
  },
}
</script>
