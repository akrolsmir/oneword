import { cloneDeep, isEmpty } from 'lodash'
import { reactive, watch } from 'vue'
import { updateRoom } from '../firebase/network'
import { assignRole, lookup } from '../twowords/api'
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
      // Run game logic and update room as appropriate
      // NOTE: seems to be causing update loops in normal games; test + fix
      // before merging into master
      compute(roomx)

      // Identify the new paths in this room -- to scope down Firestore push
      const changes = flattenPaths(objectDiff(prev, roomx))
      if (!(isEmpty(changes) || 'name' in changes)) {
        // If there are no changes, we just got back from a Firestore pull
        // If the room name changed, we swapped from initial zero state
        // So only push when  1. There are changes and 2. the room name is the same
        /* no await */ updateRoom(roomx, changes)
        // TODO: Can we debounce changes here, instead of per-input?
        // Note: Vue batches multiple updates within the same tick:
        // https://v3.vuejs.org/guide/reactivity-computed-watchers.html#effect-flush-timing
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

function compute(room) {
  try {
    const sandbox = {
      // Inject the room into these functions
      inputs: (query) => inputs(room, query),
      assignRole: (player, role) => assignRole(room, player, role),
      room,
      Boolean,
      console,
    }
    // Just compile the rule that we need:
    const compiled = compileCode(room.code[room.state])
    // Run the code on our sandbox
    compiled(sandbox)
  } catch (e) {
    // TODO: Map stack trace to user's code? And surface to user.
    console.error(`Error with computing: ${e}`)
    console.error('Code was:', room.code?.[room.state])
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

// BUGS:
// 1. Only one of the updates goes through (why? repro?)
// 2. Arrays don't update correctly in Firestore
// 3. Randomly infinite loops (repro?)
// 4. Rerun logic on type = kinda annoying
// 5. room.round = {} doesn't work, needs room.round = {b:1}

// Eval code, but only accessing constants from the provided sandbox
// From https://blog.risingstack.com/writing-a-javascript-framework-sandboxed-code-evaluation/
// TODO: What happens if they infinite loop? What if they close the sandbox?
// e.g. `} alert('hi')` totally breaks
// Maybe solve with iframes and postMessage?
// See: https://medium.com/zendesk-engineering/sandboxing-javascript-e4def55e855e
// Maybe solve with a sandbox library: https://github.com/asvd/jailed
const sandboxProxies = new WeakMap()

function compileCode(src) {
  src = `with (sandbox) {\n${src}\n}`
  const code = new Function('sandbox', src)

  const has = (target, key) => true
  const get = (target, key) =>
    key === Symbol.unscopables ? undefined : target[key]

  return function (sandbox) {
    if (!sandboxProxies.has(sandbox)) {
      const sandboxProxy = new Proxy(sandbox, { has, get })
      sandboxProxies.set(sandbox, sandboxProxy)
    }
    return code(sandboxProxies.get(sandbox))
  }
}

// Expand query strings by replacing `@ROLE` with the actual roles
// E.g. 'CLUEING.@CLUER' => ['CLUEING.Austin', 'CLUEING.Alex'] => ['cat', 'dog']
function inputs(room, query) {
  const parts = query.split('.').map((part) => lookup(room, part))
  const r = powerset(parts).map((array) =>
    getIn(room, `round.${array.join('.')}`)
  )
  return r
}

// Return a linear array of every possible combination
// E.g. [[1], [2, 3], [4, 5]] => [[1, 2, 4], [1, 3, 4], [1, 2, 5], [1, 3, 5]]
// TODO: encapsulate with unit tests: https://dev.to/vuesomedev/add-testing-to-vite-4b75
function powerset(parts) {
  if (parts.length == 0) {
    return [[]]
  }
  const first = parts[0]
  const rest = powerset(parts.slice(1))
  return first.flatMap((f) => rest.map((r) => [f].concat(r)))
}
