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
import { nanoid } from 'nanoid'

function emptyLayout() {
  return `[
    {
      "componentName": "Canvas",
      "props": {
        "component": "Container"
      },
      "children": [
      ],
      "addition": {},
      "uuid": "${nanoid()}"
    }
  ]`
}

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

    // Default to empty layout, if Editor has nothing cached.
    const isNullOrEmpty = (arr) => !arr || arr.length == 0
    const frame = this.editor.frames[this.frameId]
    if (isNullOrEmpty(frame)) {
      this.editor.import(emptyLayout(), this.frameId)
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
