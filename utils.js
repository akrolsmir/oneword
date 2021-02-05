// Extracts a node from an object tree by its path, like "redTeam.players"
export function getIn(object, path) {
  let node = object;
  for (const part of path.split('.')) {
    node = node[part];
  }
  return node;
}
