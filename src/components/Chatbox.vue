<template>
  <div class="block" style="overflow-wrap: break-word">
    <p>
      <span class="fancy">Room Chat</span> &nbsp;
      <a v-if="!hidden" @click="hidden = true">(hide)</a>
    </p>
    <a v-if="hidden" @click="hidden = false"
      >{{ sortedLogs.length }} messages hidden</a
    >
    <div v-else>
      <div
        style="
          height: 50vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column-reverse;
        "
      >
        <p
          v-for="line in sortedLogs"
          v-tippy="{ content: formatTime(line.timestamp), placement: 'left' }"
        >
          <b>{{ line.name }}:</b> {{ line.text }}
        </p>
      </div>
      <div class="field has-addons mt-2">
        <div class="control is-expanded">
          <input
            class="input"
            v-model="inputText"
            @keyup.enter="submitLine"
            placeholder="Please be nice~"
          />
        </div>
        <div class="control">
          <button class="button" @click="submitLine" aria-label="send">
            <span class="icon"> ➤ </span>
          </button>
        </div>
      </div>
      <div class="is-size-7">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://discord.gg/AP7ssVPPCr"
        >
          Or hop on our Discord for voice chat 🎤
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { updateRoom } from '../firebase/network'

export default {
  props: {
    modelValue: {
      /**
        chatlog: {
          // ID is timestamp, for now.
          // TODO: Will there be collisions? Could hash timestamp + name
          // TODO: Is it too expensive to sort? Probably not?
          123456: { player: 'alice', text: 'Hello World', timestamp: 123456 }
        }
      */
      type: Object,
    },
    name: {
      type: String,
      default: 'Anon',
    },
    chatlogPath: {
      type: String,
      default: 'chatlog',
    },
    roomId: {
      type: String,
      default: 'default-room',
    },
  },
  data() {
    return {
      inputText: '',
      hidden: false,
    }
  },
  methods: {
    submitLine() {
      this.pushLine(this.inputText)
      // Don't await for pushLine; just clear the line immediately
      this.inputText = ''
    },
    async pushLine(text) {
      if (!text) {
        return
      }
      const timestamp = Date.now()
      const line = {
        name: this.name,
        text,
        timestamp,
      }
      await updateRoom(
        { name: this.roomId },
        {
          [`${this.chatlogPath}.${timestamp}`]: line,
        }
      )
    },
    formatTime(timestamp) {
      return new Date(Number(timestamp)).toLocaleTimeString()
    },
  },
  computed: {
    // Note: the logs are sorted so oldest are first.
    // This lets us use column-reverse CSS flex trick to keep scrollbar on bottom
    // See https://stackoverflow.com/a/44051405/1222351
    sortedLogs() {
      return Object.values(this.modelValue || {}).sort(
        (c1, c2) => parseInt(c2.timestamp) - parseInt(c1.timestamp)
      )
    },
  },
}
</script>

<style scoped>
.block {
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 1rem;
}
</style>
