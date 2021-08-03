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

      <button class="button is-danger is-small mt-2" @click="removeSelected">
        Delete
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings {
  outline: 1px solid gray;
  padding: 0.5rem;
}
</style>

<script>
export default {
  inject: ['editor'],
  data() {
    return {
      // TODO: Deduplicate with TwoCraft.vue
      COMPONENT_NAMES: {
        Paragraph: 'Text',
        Button: 'Button',
        Input: 'Text Input',
        Container: 'Vertical Box',
        Flex: 'Horizontal Box',
        Sketchpad: 'Sketchpad',
        Image: 'Image',
      },
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
    removeSelected() {
      return this.editor.removeNode(this.selectedNode)
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
  },
}
</script>
