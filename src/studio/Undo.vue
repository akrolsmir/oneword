<template>
  <div class="columns" @keyup.meta="undo">
    <div class="column">
      <h1 class="title">Current</h1>
      <MonacoEditor v-model="localRoomString" />
      <!-- TODO: Maybe should need to click "edit" first -->
      <!-- TODO: Prevent saving malformed versions? Indicate with error button. -->
      <button class="button is-primary" @click="saveRoom">
        Save Room (Ctrl + s)
      </button>
    </div>
    <div class="column">
      <h1 class="title">History</h1>
      <button class="button" @click="undo">Undo (Ctrl + z)</button>
      <button class="button" @click="redo">Redo (Ctrl + Shift + z)</button>
      <br />
      <template v-for="change in changesArray" :key="change.timestamp">
        <label class="label">
          {{ change.author }} @
          {{ new Date(change.timestamp).toUTCString() }}
          {{ change.timestamp == metaroom.active ? ' - ACTIVE' : '' }}
        </label>
        <MonacoEditor
          :modelValue="`diff = ${stringifyDiff(change.diff)}`"
          :heightInVh="10"
        />
      </template>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f3f4f6; /* Tailwind Gray 100  */
  padding: 2rem;
  margin-top: 2rem;
}
</style>

<script>
import { isEmpty } from 'lodash'
import { objectDiff, flattenPaths, applyDiff, stripUndefined } from '../utils'
import MonacoEditor from './MonacoEditor.vue'
export default {
  components: { MonacoEditor },
  data() {
    return {
      metaroom: {
        /* Diffs are updates that work in Firestore */
        changes: {
          // Single change object:
          100000: {
            timestamp: 100000,
            author: 'Alpha',
            diff: {},
          },
          200000: {
            timestamp: 200000,
            author: 'Beta',
            diff: { title: 'initial', a: 'b' },
          },
          300000: {
            timestamp: 300000,
            author: 'Alpha',
            diff: { title: 'changed', 'foo.bar': 3 },
          },
          400000: {
            timestamp: 400000,
            author: 'Charlie',
            diff: { a: undefined },
          },
        },
        /* Which of the diffs is currently selected */
        active: 100000,
      },
      /* An editable string to set the room */
      localRoomString: '',
    }
  },
  created() {
    this.metaroom.active = 300000 // To trigger the watch
  },
  watch: {
    'metaroom.active'() {
      const localRoom = this.stateAt(this.metaroom.active)
      this.localRoomString = 'let room = ' + JSON.stringify(localRoom, null, 2)
    },
  },
  // Listen for ctrl+z and ctrl+shift+z codes
  // TODO: Could pull out into useKeyboard hook
  mounted() {
    this.keyListener = document.addEventListener('keydown', (event) => {
      if (event.code == 'KeyZ' && (event.ctrlKey || event.metaKey)) {
        if (event.shiftKey) {
          this.redo()
        } else {
          this.undo()
        }
        event.preventDefault()
      }
      if (event.code == 'KeyS' && (event.ctrlKey || event.metaKey)) {
        this.saveRoom()
        event.preventDefault()
      }
    })
  },
  unmounted() {
    // We don't want the listener to exist after we exit this component
    document.removeEventListener('keydown', this.keyListener)
  },
  computed: {
    // TODO handle treelike structure with diff parents
    changesArray() {
      return Object.values(this.metaroom.changes).sort(
        (d1, d2) => d1.timestamp - d2.timestamp
      )
    },
    diffs() {
      return this.changesArray.map((change) => change.diff)
    },
  },
  methods: {
    stringifyDiff,
    index(timestamp) {
      return this.changesArray.indexOf(this.metaroom.changes[timestamp])
    },
    stateAt(timestamp) {
      const reapplied = this.diffs
        .slice(0, this.index(timestamp) + 1)
        .reduce(applyDiff)
      return stripUndefined(reapplied)
    },
    undo() {
      const newIndex = Math.max(0, this.index(this.metaroom.active) - 1)
      this.metaroom.active = this.changesArray[newIndex].timestamp
    },
    redo() {
      const newIndex = Math.min(
        this.changesArray.length - 1,
        this.index(this.metaroom.active) + 1
      )
      this.metaroom.active = this.changesArray[newIndex].timestamp
    },
    saveRoom() {
      try {
        const oldRoom = this.stateAt(this.metaroom.active)
        const newRoomString = this.localRoomString.slice('let room = '.length)
        const newRoom = JSON.parse(newRoomString)
        const diff = flattenPaths(objectDiff(oldRoom, newRoom))

        if (!isEmpty(diff)) {
          const timestamp = Date.now()
          // Start a new history chain from here
          this.metaroom.changes[timestamp] = {
            timestamp,
            author: 'Austin',
            diff,
            // TODO: add parent pointer if not up-to-date
          }
          this.metaroom.active = timestamp
        }
      } catch (e) {
        console.error('Failed to edit room:\n', e)
      }
    },
  },
}

function stringifyDiff(object) {
  // Show undefined, though JSON.stringify would normally remove them
  const replacer = (k, v) => (v === undefined ? '(deleted)' : v)

  return JSON.stringify(object, replacer, 2)
}
</script>
