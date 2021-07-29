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

<script>
export default {
  inject: ['editor'],
  computed: {
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
