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
          {{ change.timestamp == ingotx.active ? ' - ACTIVE' : '' }}
        </label>
        <MonacoEditor
          :modelValue="`diff = ${stringifyDiff(change.diff)}`"
          :heightInVh="10"
        />
      </template>

      <h1 class="title">All Changes</h1>
      <div v-for="change in ingotx.changes" :key="change.timestamp">
        <a href="#" @click="jump(change.timestamp)">
          {{ change.author }} @ {{ new Date(change.timestamp).toUTCString() }}
        </a>
      </div>
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
import MonacoEditor from './MonacoEditor.vue'
import { useIngot } from '../composables/useIngot'
import { useHotkey } from '../composables/useHotkey'

export default {
  components: { MonacoEditor },
  setup() {
    const ingot = useIngot()
    return { ...ingot }
  },
  data() {
    return {
      /* An editable string to set the room */
      localRoomString: '',
    }
  },
  created() {
    this.ingotx.active = 300000 // To trigger the watch
    console.log('ingot.changesArray', this.changesArray)
    useHotkey({
      'c+s': this.saveRoom,
      'c+shift+z': this.redo,
      'c+z': this.undo,
    })
  },
  watch: {
    'ingotx.active'() {
      const localRoom = this.current
      this.localRoomString = 'let room = ' + JSON.stringify(localRoom, null, 2)
    },
  },
  methods: {
    stringifyDiff,
    saveRoom() {
      try {
        const newRoomString = this.localRoomString.slice('let room = '.length)
        const newRoom = JSON.parse(newRoomString)
        this.set(newRoom)
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
