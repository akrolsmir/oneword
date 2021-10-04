<template>
  <div class="setting-panel">
    <!-- <label class="checkbox">
      <input
        :checked="editor.enabled"
        @change="toggleState"
        type="checkbox"
        id="editorState"
      />
      Editable</label
    > -->
    <div v-if="settings" class="settings">
      <h3 class="title is-6">Edit {{ componentName }}</h3>

      <component
        v-for="(component, name) in settings"
        :key="name"
        :is="component"
        :node="selectedNode"
      ></component>

      <button class="button mt-2" @click="duplicateSelected">Duplicate</button>

      <button class="button mt-2" @click="removeSelected">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.settings {
  outline: 1px solid gray;
  padding: 1rem;
}
</style>

<script>
export const COMPONENT_NAMES = {
  Paragraph: 'Text',
  Button: 'Button',
  Input: 'Text Input',
  Container: 'Vertical Box',
  Flex: 'Horizontal Box',
  Sketchpad: 'Sketchpad',
  Image: 'Image',
}

export default {
  inject: ['editor'],
  data() {
    return {
      COMPONENT_NAMES,
    }
  },
  computed: {
    componentName() {
      return (
        this.COMPONENT_NAMES[this.editor.selectedNode.props.component] ||
        '<blank>'
      )
    },
    selectedNode() {
      return this.editor.selectedNode
    },
    settings() {
      if (!this.selectedNode) {
        return null
      }

      return this.editor.getSettings(this.selectedNode)
    },
  },
  methods: {
    toggleState() {
      if (this.editor.enabled) {
        this.editor.disable()
      } else {
        this.editor.enable()
      }
    },
    duplicateSelected() {
      this.editor.duplicateNode(this.selectedNode)
    },
    removeSelected() {
      this.editor.removeNode(this.selectedNode)
    },
  },
}
</script>
