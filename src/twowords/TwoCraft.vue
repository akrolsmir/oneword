<template>
  <div id="app">
    <h3>Hello there</h3>
    <Editor component="div" class="container" :resolverMap="resolverMap">
      <div class="columns">
        <div class="column">
          Setting Panel
          <div class="setting-panel"></div>
        </div>
        <div class="column">
          Preview Panel
          <Frame component="div" class="preview-panel">
            <Canvas
              component="Container"
              class="canvas-class"
              style="color: red"
            >
              <Paragraph content="demo text" />
            </Canvas>
          </Frame>
        </div>
      </div>
    </Editor>
  </div>
</template>

<script>
import { Canvas, Editor, Frame } from './v-craft/index'
import Container from './components/CraftDiv.vue'
import Paragraph from './components/CraftParagraph.vue'

// Hm, Editor seems to be broken. Maybe cuz Vue2 => Vue3?
// Doesn't look too hard to port v-craft to Vue3
export default {
  name: 'App',
  components: {
    Canvas,
    Editor,
    Frame,
    Paragraph,
  },
  data() {
    return {
      resolverMap: {
        Canvas,
        Container,
        Paragraph,
      },
    }
  },
}
</script>
