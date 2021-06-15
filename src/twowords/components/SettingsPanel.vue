<template>
  <div class="setting-panel">
    <div v-if="settings" class="settings">
      <component
        v-for="(component, name) in settings"
        :key="name"
        :is="component"
        :node="selectedNode"
      ></component>
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
  },
}
</script>
