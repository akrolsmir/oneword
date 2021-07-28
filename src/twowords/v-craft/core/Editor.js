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
    this.screens = { DEFAULT: [] }

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
    this.screens['DEFAULT'] = nodes
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

  export(screen = 'DEFAULT') {
    const nodesData = this.screens[screen].map((node) => node.serialize())

    return JSON.stringify(nodesData)
  }

  import(plainNodesData, screen = 'DEFAULT') {
    try {
      const nodesData = JSON.parse(plainNodesData)
      this.screens[screen] = nodesData.map((data) =>
        Node.unserialize(this, data)
      )
    } catch {
      throw new Error('The input is not valid.')
    }
  }
}

export default Editor
