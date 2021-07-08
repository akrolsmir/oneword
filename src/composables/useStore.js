import { reactive, readonly } from 'vue'
import { setRoom, updateRoom } from '../firebase/network'
import { getIn, sanitize } from '../utils'

export function useStore() {
  // $roomx is the same as this.room; eventually, deprecate the latter
  // readonly outside of $updatex and $setx
  const $roomx = reactive({})
  // $playerx is for all local (non-synced) data
  const $playerx = reactive({})
  // Alternative: $storex could have $storex.room, $storex.player
  // Basically `$storex` would be the same as `this`
  // Pros: Components can share additional info (e.g. player.name)
  // Cons: More ambiguity/complexity?

  // All writes to $roomx
  function $updatex(changes) {
    Object.entries(changes).map(([path, value]) => setIn($roomx, path, value))
    /* no await */ updateRoom($roomx, changes)
  }

  function $setx(room) {
    // Effectively `$roomx = room`, but keeps the same reactive reference
    Object.assign($roomx, room)
  }

  // TODO: Ensure label => id mapping is unique?
  function $inputx(label, value) {
    $updatex({
      [`round.${$roomx.state}.${$playerx.name}.${sanitize(label)}`]: value,
    })
  }

  function $interpolatex(text) {
    const replacer = (match, label) => {
      const path = `round.${$roomx.state}.${$playerx.name}.${sanitize(label)}`
      return getIn($roomx, path) || '<empty>'
    }

    return text.replace(/\[\[(.+?)\]\]/, replacer)
  }

  return {
    $roomx: readonly($roomx),
    $updatex,
    $setx,
    $playerx,
    $inputx,
    $interpolatex,
  }
}

// Writes a value to a particular spot in the object, creating empty obj as necessary
// Assumes object is defined
export function setIn(object, path, value) {
  // Base case
  if (!path.includes('.')) {
    object[path] = value
    return
  }

  // Create the next child obj if necessary
  const [next, ...rest] = path.split('.')
  object[next] = object[next] || {}
  // Recurse!
  setIn(object[next], rest.join('.'), value)
}
