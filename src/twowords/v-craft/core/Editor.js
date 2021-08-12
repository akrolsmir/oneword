import kebabCase from 'lodash/kebabCase'
import Indicator from './Indicator'
import Node from './Node'

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
      // TODO next: Try defaulting to emptyLayout() when plainNodesData is undefined
      const nodesData = JSON.parse(plainNodesData)
      this.frames[frameId] = nodesData.map((data) =>
        Node.unserialize(this, data)
      )
    } catch (e) {
      // Don't error if this is a new screen (ie plainNodesData is `undefined`)
      if (plainNodesData) {
        throw new Error('Invalid node data: ', plainNodesData, '\n', e)
      }
    }
  }
}

export default Editor
