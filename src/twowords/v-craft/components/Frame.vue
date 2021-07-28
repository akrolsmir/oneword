<template>
  <component :is="component">
    <Node
      v-for="node in editor.frames[frameId]"
      :key="node.uuid"
      :node="node"
    />
    <Indicator :indicator="editor.indicator" />
  </component>
</template>

<script>
import Node from './Node.vue'
import Indicator from './Indicator.vue'
import createNodeFromVNode from '../utils/createNodeFromVNode'

export default {
  components: {
    Node,
    Indicator,
  },
  props: {
    component: [Object, String],
    // A string key to identify which of the editor's frames to show
    frameId: {
      type: String,
      default: 'DEFAULT',
    },
  },
  inject: ['editor'],
  created() {
    if (!this.editor) {
      throw new Error('<Frame/> must be wrapped with <Editor/>.')
    }

    // Show the Frame's slot contents, if Editor has nothing cached.
    const isNullOrEmpty = (arr) => !arr || arr.length == 0
    const frame = this.editor.frames[this.frameId]
    if (isNullOrEmpty(frame)) {
      const nodes = this.createNodesFromSlots()
      this.editor.setTopLevelNodes(nodes)
    }
  },
  methods: {
    createNodesFromSlots() {
      const defaultSlots = this.$slots.default() || []
      return defaultSlots
        .map((vnode) => createNodeFromVNode(this.editor, vnode))
        .filter((node) => !!node)
    },
  },
}
</script>
