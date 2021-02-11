import { updateRoom } from '../firebase-network.js';

Vue.component('chatbox', {
  props: {
    value: {
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
    };
  },
  methods: {
    submitLine() {
      this.pushLine(this.inputText);
      // Don't await for pushLine; just clear the line immediately
      this.inputText = '';
    },
    async pushLine(text) {
      if (!text) {
        return;
      }
      const timestamp = Date.now();
      const line = {
        name: this.name,
        text,
        timestamp,
      };
      await updateRoom(
        { name: this.roomId },
        {
          [`${this.chatlogPath}.${timestamp}`]: line,
        }
      );
    },
    formatTime(timestamp) {
      return new Date(Number(timestamp)).toLocaleTimeString();
    },
  },
  computed: {
    // Note: the logs are sorted so oldest are first.
    // This lets us use column-reverse CSS flex trick to keep scrollbar on bottom
    // See https://stackoverflow.com/a/44051405/1222351
    sortedLogs() {
      return Object.values(this.value || {}).sort((c1, c2) => parseInt(c2.timestamp) - parseInt(c1.timestamp));
    },
  },
  template: `
<div :class="{'box': !hidden }" style="overflow-wrap: break-word;">
  <h2>Room Chat</h2>
  <div v-if="hidden">
    <a @click="hidden = false">(Show)</a><br />
    {{ sortedLogs.length }} messages
  </div>
  <div v-else>
    <a @click="hidden = true">(Hide)</a>
    <div style="height: 50vh; overflow-y: auto; display: flex; flex-direction: column-reverse;">
      <p v-for="line in sortedLogs" :title="formatTime(line.timestamp)"><b>{{ line.name }}:</b> {{ line.text }}</p>
    </div>
    <div class="field has-addons mt-2">
      <div class="control is-expanded">
        <input class="input" v-model="inputText" @keyup.enter="submitLine" placeholder="Please be nice~" />
      </div>
      <div class="control">
        <button class="button" @click="submitLine" aria-label="send"><span class="icon"> ➤ </span></button>
      </div>
    </div>
    <div class="is-size-7">
      <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/AP7ssVPPCr">
        Or hop on our Discord for voice chat 🎤
      </a>
    </div>
  </div>
</div>
  `,
});
