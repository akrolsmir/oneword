import cloneDeep from 'lodash/cloneDeep'
import Node from '../core/Node'

function getCraftConfig(componentName, props, editor) {
  const config = {
    defaultProps: {},
    rules: {},
    addition: {},
  }

  let resolver
  if (componentName === 'Canvas') {
    resolver = editor.findResolver(props.component)
  } else {
    resolver = editor.findResolver(componentName)
  }

  if (resolver.craft) {
    Object.keys(config).forEach((key) => {
      if (resolver.craft[key]) {
        config[key] = cloneDeep(resolver.craft[key])
      }
    })
  }

  return config
}

function createNodeFromVNode(editor, vnode, parentNode = null) {
  // In Vue2 => Vue3, componentName (aka 'tag') is gone from VNodes...
  // Vue2: https://github.com/vuejs/vue-next/blob/master/packages/runtime-core/src/vnode.ts
  // Vue3: https://github.com/vuejs/vue/blob/dev/types/vnode.d.ts
  // Hack for now: Add "craft.tag" in each custom component's .vue definition
  const componentName = vnode.type.craft.tag
  let props = vnode.props

  if (componentName === 'Canvas' && vnode.data?.attrs) {
    // Always skipped cuz no vnode.data.attrs, I think...
    // TODO: Investigate, what was data.attrs? Was it important?
    props = { ...props, ...vnode.data.attrs }
  }

  const { rules, addition, defaultProps } = getCraftConfig(
    componentName,
    props,
    editor
  )
  const nodeProps = { ...defaultProps, ...props }

  const node = new Node(
    componentName,
    nodeProps,
    parentNode,
    [],
    rules,
    addition
  )

  const vnodeChildren = vnode.children?.default()
  const children = vnodeChildren
    ? vnodeChildren
        .map((childVNode) => createNodeFromVNode(editor, childVNode, node))
        .filter((childNode) => !!childNode)
    : []
  node.children = children

  return node
}

export default createNodeFromVNode
