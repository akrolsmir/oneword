import { getIn, setIn } from '../utils'

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
        // Use setIn, in case the roles object does not yet exist
        setIn(room, `round.roles.${name}`, role)
      }
      break
    case 'NEXT_ALPHABETICAL':
      const oldRoles = room.history[room.history.length - 1]?.roles || {}
      const [oldName, _] =
        Object.entries(oldRoles).find(([name, r]) => r === role) || []
      const name = nextItem(oldName, room.players)
      setIn(room, `round.roles.${name}`, role)
      break
    default:
      setIn(room, `round.roles.${player}`, role)
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
    return Object.entries(room.round.roles || {})
      .map(([name, r]) => (r === role ? name : ''))
      .filter(Boolean)
  }
  // Not @ROLE syntax, so just return the original string wrapped in an array
  return [part]
}

/**
 * Just dig out all the player inputs for a particular id
 * E.g. inputy('next-round') => {Austin: 3, Alex: 4}
 */
export function inputy(room, inputId) {
  return room.round[inputId] || {}
  // TODO: should missing inputs be undefined? null?
}

/**
 * Expand query strings by replacing `@ROLE` with the actual roles
 * E.g. 'CLUEING.@CLUER.favorite-pet' => ['cat', 'dog']
 * @param {String} query In the form 'PHASE.@ROLE.input-label'
 * @returns An array of matching inputs. Missing inputs will be `undefined`
 */
export function inputs(room, query) {
  const parts = query.split('.').map((part) => lookup(room, part))
  const r = powerset(parts).map((array) =>
    getIn(room, `round.${array.join('.')}`)
  )
  return r
}

// Return a linear array of every possible combination
// E.g. [[1], [2, 3], [4, 5]] => [[1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5]]
// TODO: encapsulate with unit tests: https://dev.to/vuesomedev/add-testing-to-vite-4b75
export function powerset(parts) {
  if (parts.length == 0) {
    return [[]]
  }
  const first = parts[0]
  const rest = powerset(parts.slice(1))
  return first.flatMap((f) => rest.map((r) => [f].concat(r)))
}
