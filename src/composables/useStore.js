import { cloneDeep, isEmpty, mapValues } from 'lodash'
import { reactive, watch } from 'vue'
import firebase from 'firebase/app'
import { updateRoom } from '../firebase/network'
import {
  assignRole,
  inputs,
  inputy,
  getPlayers,
  pickRandom,
  shuffle,
} from '../studio/api'
import {
  flattenPaths,
  getIn,
  setIn,
  objectDiff,
  sanitize,
  replaceValues,
} from '../utils'
import { adjectives, nouns, verbs } from '../words/parts-of-speech'
import { useIngot } from './useIngot'

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

  const ingot = useIngot()

  // All writes to $roomx
  function $updatex(changes) {
    Object.entries(changes).map(([path, value]) => setIn($roomx, path, value))
  }

  function $setx(room) {
    // Effectively `$roomx = room`, but keeps the same reactive reference
    setWithoutIngot(room)
    ingot.set(room)
  }

  // Escape hatch for undoing/redoing to set roomx without leaving a diff
  function setWithoutIngot(room) {
    Object.keys($roomx).forEach((key) => delete $roomx[key])
    Object.assign($roomx, room)
  }

  // TODO: Ensure label => id mapping is unique?
  function $inputx(label, value) {
    $updatex({
      [`round.${sanitize(label)}.${$playerx.name}`]: value,
    })
  }

  function $interpolatex(text) {
    function clean(obj) {
      return typeof obj === 'object' ? JSON.stringify(obj, null, 2) : obj
    }
    function replacer(match, path) {
      return clean(getIn($roomx, path)) || `<${match}>`
    }

    return text.replace(/\[\[(.+?)\]\]/, replacer)
  }

  const $undo = function () {
    ingot.undo()
    setWithoutIngot(ingot.current.value)
  }
  const $redo = function () {
    ingot.redo()
    setWithoutIngot(ingot.current.value)
  }

  // Whenever props of roomx change, push the corresponding change to Firestore
  // From https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watching-reactive-objects
  watch(
    () => [cloneDeep($roomx), ingot.ingotx.active],
    ([roomx, active], [prevRoomx, prevActive]) => {
      if (active != prevActive) {
        // If the active pointer changed, this is an undo/redo; don't push to Firestore
        return
      }

      // Run game logic and update room as appropriate
      compute(roomx, $playerx)

      // Identify the new paths in this room -- to scope down Firestore push
      const diff = flattenPaths(objectDiff(prevRoomx, roomx))
      // If there are no changes, we just got back from a Firestore pull
      // If the room name changed, we swapped from initial zero state
      // So only push when: 1. There are changes, and 2. the room name is the same
      if (!(isEmpty(diff) || 'name' in diff)) {
        const DELETE = firebase.firestore.FieldValue.delete()
        const deleteDiff = replaceValues(diff, undefined, DELETE)
        console.warn('Applying diff:', deleteDiff)
        /* no await */ updateRoom(roomx, deleteDiff)

        // Also register the diff in ingot
        ingot.apply(diff)

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
    $undo,
    $redo,
  }
}

function compute(room, $playerx) {
  try {
    const API = {
      inputs,
      inputy,
      assignRole,
      getPlayers,
    }
    const WORDLISTS = {
      NOUNS: nouns,
      ADJECTIVES: adjectives,
      VERBS: verbs,
    }
    function curry(func) {
      return (...params) => func(room, ...params)
    }
    // Inject the room into these functions
    const CURRIED_API = mapValues(API, curry)
    const sandbox = {
      ...CURRIED_API,
      pickRandom,
      shuffle,
      WORDLISTS,
      room,
      Boolean,
      console,
    }
    // Just compile the rule that we need:
    const codeString = room.code[room.state]
    const compiled = compileCode(codeString)
    // Run the code on our sandbox
    compiled(sandbox)
    $playerx.errors = {}
  } catch (e) {
    // Ugly hack: Expose to Studio by communicating over $playerx.errors
    // Show just the first line of the stack trace
    const stack = e.stack.split('\n').slice(0, 1).join('\n')
    $playerx.errors = { [room.state]: stack }
  }
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
// Jailed is complex (supports Node.js), and old; try just grabbing it as vendor code?
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
