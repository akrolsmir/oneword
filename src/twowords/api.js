/**
 * Assigns the specified player(s) to the role.
 *
 * @param {String} player One of:
 *  - a player's name
 *  - 'EVERYONE': to set all players to this role
 *  - 'NEXT_ALPHABETICAL': to rotate to the next player
 * @param {String} role the role to assign
 */
export function assignRole(room, player, role) {
  switch (player) {
    case 'EVERYONE':
      for (const name of room.players) {
        room.round.roles[name] = role
      }
      break
    case 'NEXT_ALPHABETICAL':
      const oldRoles = room.history[room.history.length - 1]?.roles || {}
      const [oldName, _] =
        Object.entries(oldRoles).find(([name, r]) => r === role) || []
      const name = nextItem(oldName, room.players)
      room.round.roles[name] = role
      break
    default:
      room.round.roles[player] = role
  }
}

// Copied from oneword-utils.js
function nextItem(item, list) {
  const nextIndex = (list.indexOf(item) + 1 + list.length) % list.length
  return list[nextIndex]
}

/**
 * @param {String} part A role like '@CLUER'
 * @returns An array of player names who have that role
 */
export function lookup(room, part) {
  if (part.startsWith('@')) {
    // Return all players with this role
    const role = part.slice(1)
    return Object.entries(room.round.roles)
      .map(([name, r]) => (r === role ? name : ''))
      .filter(Boolean)
  }
  // Not @ROLE syntax, so just return the original string wrapped in an array
  return [part]
}
