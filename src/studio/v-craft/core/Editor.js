import kebabCase from 'lodash/kebabCase'
import Indicator from './Indicator'
import Node from './Node'
import { nanoid } from 'nanoid'

class Editor {
  constructor(nodes = [], resolverMap = {}) {
    this.nodeMap = {}
    this.selectedNode = null
    this.draggedNode = null
    this.indicator = new Indicator()
    this.enabled = true
    // Keep track of which node tree corresponds to each Frame
    // (A node tree is a list of top-level Node objects)
    this.frames = { DEFAULT: [] }

    this.setTopLevelNodes(nodes)
    this.setResolverMap(resolverMap)
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.selectNode(null)
    this.enabled = false
  }

  setResolverMap(resolverMap) {
    this.resolverMap = {}

    Object.entries(resolverMap).forEach(([key, value]) => {
      this.resolverMap[kebabCase(key)] = value
    })
  }

  initializeNodeMap(nodes) {
    nodes.forEach((node) => {
      this.nodeMap[node.uuid] = node
      this.initializeNodeMap(node.children)
    })
  }

  setTopLevelNodes(nodes) {
    this.frames['DEFAULT'] = nodes
    this.initializeNodeMap(nodes)
  }

  findNode(uuid) {
    return this.nodeMap[uuid]
  }

  selectNode(node) {
    this.selectedNode = node
  }

  // Selects the node with the same uuid
  // Use after re-importing, because importing creates a new node object.
  reselectNode() {
    if (this.selectedNode) {
      this.selectNode(this.findNode(this.selectedNode.uuid))
    }
  }

  dragNode(node) {
    this.draggedNode = node
  }

  findResolver(name) {
    return this.resolverMap[kebabCase(name)]
  }

  removeNode(node) {
    node.makeOrphan()

    if (node === this.selectedNode) {
      this.selectNode(null)
    }
  }

  duplicateNode(node) {
    const newNode = node.clone()
    // Untether from parent so makeOrphan works correctly
    newNode.parent = null
    newNode.insertAfter(node)
  }

  getCraftConfig(node) {
    let resolver
    if (node.isCanvas()) {
      resolver = this.findResolver(node.props.component)
    } else {
      resolver = this.findResolver(node.componentName)
    }

    return resolver.craft || {}
  }

  getSettings(node) {
    return this.getCraftConfig(node).settings || {}
  }

  export(frameId = 'DEFAULT') {
    const nodesData = this.frames[frameId].map((node) => node.serialize())

    return JSON.stringify(nodesData)
  }

  import(plainNodesData, frameId = 'DEFAULT') {
    try {
      // If plainNodesData is not provided, default to an empty container
      const nodesData = JSON.parse(plainNodesData || emptyLayout())
      const nodes = nodesData.map((data) => Node.unserialize(this, data))
      this.frames[frameId] = nodes
      this.initializeNodeMap(nodes)
      this.reselectNode()
    } catch (e) {
      throw new Error('Invalid node data: ', plainNodesData, '\n', e)
    }
  }
}

// Slight code smell: this ties Editor to our Container implementation
function emptyLayout() {
  return `[
    {
      "componentName": "Canvas",
      "props": {
        "component": "Container",
        "color": "#E5E7EB"
      },
      "children": [
      ],
      "addition": {},
      "uuid": "${nanoid()}"
    }
  ]`
}

export default Editor
