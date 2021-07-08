import { reactive, readonly } from 'vue'
import { setRoom, updateRoom } from '../firebase/network'

export function useStore() {
  // $roomx is the same as this.room; eventually, deprecate the latter
  // readonly outside of $updatex and $setx
  const $roomx = reactive({})

  // All writes to $roomx
  function $updatex(changes) {
    Object.entries(changes).map(([path, value]) => setIn($roomx, path, value))
    /* no await */ updateRoom($roomx, changes)
  }

  function $setx(room) {
    // Effectively `$roomx = room`, but keeps the same reactive reference
    Object.assign($roomx, room)
  }
  return { $roomx: readonly($roomx), $updatex, $setx }
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
