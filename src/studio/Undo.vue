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
      <template v-for="(diff, index) in diffStrings" :key="diff">
        <label class="label">
          {{ index == activeIndex ? 'ACTIVE:' : '' }} Diff {{ index }}</label
        >
        <MonacoEditor :modelValue="`diff${index} = ${diff}`" :heightInVh="10" />
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
      /* Diffs are updates that work in Firestore */
      diffs: [
        {},
        { title: 'initial', a: 'b' },
        { title: 'changed', 'foo.bar': 3 },
        // TODO: Handle undefined-type diffs as removals in Firestore
        { a: undefined },
      ],
      /* Which of the diffs is currently selected */
      activeIndex: 0,
      /* An editable string to set the room */
      localRoomString: '',
    }
  },
  created() {
    this.activeIndex = 2 // To trigger the watch
  },
  watch: {
    activeIndex() {
      const localRoom = this.stateAt(this.activeIndex)
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
    diffStrings() {
      return this.diffs.map(stringifyDiff)
    },
  },
  methods: {
    stateAt(index) {
      const reapplied = this.diffs.slice(0, index + 1).reduce(applyDiff)
      return stripUndefined(reapplied)
    },
    undo() {
      this.activeIndex = Math.max(0, this.activeIndex - 1)
    },
    redo() {
      this.activeIndex = Math.min(this.diffs.length - 1, this.activeIndex + 1)
    },
    saveRoom() {
      try {
        const oldRoom = this.stateAt(this.activeIndex)
        const newRoomString = this.localRoomString.slice('let room = '.length)
        const newRoom = JSON.parse(newRoomString)
        const diff = flattenPaths(objectDiff(oldRoom, newRoom))

        if (!isEmpty(diff)) {
          // Start a new history chain from here
          this.diffs = [...this.diffs.slice(0, this.activeIndex + 1), diff]
          this.redo()
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
