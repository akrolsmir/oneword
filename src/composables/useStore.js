import { cloneDeep, isEmpty } from 'lodash'
import { reactive, watch } from 'vue'
import { updateRoom } from '../firebase/network'
import { flattenPaths, getIn, objectDiff, sanitize } from '../utils'

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

  // Whenever props of roomx change, push the corresponding change to Firestore
  // From https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watching-reactive-objects
  watch(
    () => cloneDeep($roomx),
    (roomx, prev) => {
      // Identify the new paths in this room -- to scope down Firestore push
      const changes = flattenPaths(objectDiff(prev, roomx))
      if (!(isEmpty(changes) || 'name' in changes)) {
        // If there are no changes, we just got back from a Firestore pull
        // If the room name changed, we swapped from initial zero state
        // So only push when  1. There are changes and 2. the room name is the same
        /* no await */ updateRoom(roomx, changes)
        // TODO: Can we debounce changes here, instead of per-input?
      }
    }
  )

  return {
    $roomx,
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
