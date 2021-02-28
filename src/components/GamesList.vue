<template>
  <form
    v-if="user.id || user.guest"
    @submit.prevent="navigateToRoom"
    method="POST"
  >
    <label class="label mt-2">Player: {{ user.displayName }}</label>
    <label class="label mt-2">Room</label>
    <input
      class="input"
      type="text"
      v-model="roomName"
      placeholder="apple"
      required
    />
    <br /><br />
    <input class="button" type="submit" value="Enter Room" />
  </form>
  <template v-else>
    <br />
    <button class="button is-large is-success" @click="user.signIn">
      Sign in to get started
    </button>
  </template>

  <br /><br />
  <div v-cloak>
    <h2 class="fancy">Open Rooms</h2>
    <p
      v-for="openRoom in allRooms"
      :class="{ halfOpacity: !isActive(openRoom) }"
      :key="openRoom.name"
    >
      <router-link :to="`${roomDirectory}${openRoom.name}`">
        <b>{{ openRoom.name }}</b></router-link
      >, with {{ listPlayers(openRoom).join(', ') }} ({{
        timeSince(openRoom.lastUpdateTime)
      }})
    </p>
    <h2 class="fancy">Private Rooms</h2>
    <p v-for="privateRoom in privateRooms" :key="privateRoom.name">
      <a href="#" @click.prevent="showPrivateModal">
        <b>{{ 'Private room' }} with {{ listPlayers(privateRoom)[0] }}</b>
      </a>
      <span v-if="listPlayers(privateRoom).length > 1">
        and {{ listPlayers(privateRoom).length }} others</span
      >
      ({{ timeSince(privateRoom.lastUpdateTime) }})
    </p>
  </div>
</template>

<script>
import { inject } from 'vue'
import { listRooms, referSupporter } from '../firebase/network'
import { sanitize, timeSince } from '../utils'
import { randomWord } from '../words/lists'
import { listPlayers } from '../oneword/oneword-utils'

function recentRoom(room) {
  const ONE_HOUR_IN_MS = 60 * 60 * 1000
  return Date.now() - room.lastUpdateTime <= ONE_HOUR_IN_MS
}

export default {
  props: {
    roomDirectory: String,
    // Used to determine which rooms look good to go into
    activeFunc: {
      type: Function,
      default: recentRoom,
    },
  },
  setup() {
    return { user: inject('currentUser') }
  },
  data() {
    return {
      allRooms: [],
      privateRooms: [],
      roomName: `${randomWord('adjectives')}-${randomWord('nouns')}`,
      room: {},
    }
  },
  created() {
    const nonempty = (room) => listPlayers(room).length > 0
    // Async load all open and private rooms
    listRooms().then((rooms) => (this.allRooms = rooms.filter(nonempty)))
    listRooms(5, false).then(
      (rooms) => (this.privateRooms = rooms.filter(nonempty))
    )
  },
  computed: {
    // Returns the set of open room names that matches the current `room.name`.
    filteredRoomNameSet() {
      const filtered = new Set()
      const roomNameRe = new RegExp(this.roomName, 'i')
      for (const openRoom of this.allRooms) {
        if (openRoom.name.match(roomNameRe)) {
          filtered.add(openRoom.name)
        }
      }
      return filtered
    },
  },
  methods: {
    timeSince,
    listPlayers,
    // Returns a bool indicating if the provided Room object should be full opacity.
    // 1. If some but not all rooms match the filter, match those
    // 2. Otherwise, match "active" rooms, as defined by the prop `activeFunc`
    isActive: function (openRoom) {
      if (
        this.filteredRoomNameSet.size != 0 &&
        this.filteredRoomNameSet.size != this.allRooms.length
      ) {
        return this.filteredRoomNameSet.has(openRoom.name)
      } else {
        return this.activeFunc(openRoom)
      }
    },
    navigateToRoom() {
      this.roomName = sanitize(this.roomName)
      this.$router.push({
        path: `${this.roomDirectory}${this.roomName}`,
      })
    },
    showPrivateModal() {
      this.$showModal({
        title: 'This room is private 🔒',
        text:
          'To join, ask your teammates for the room name or link.\n\nTo make your own private room, become a supporter!',
        buttons: {
          okay: 'Become a supporter!',
          cancel: 'Not now',
        },
        callbacks: {
          okay: () => {
            referSupporter('private_room_modal')
          },
        },
      })
    },
  },
}
</script>
<style scoped>
.halfOpacity {
  opacity: 0.5;
}
</style>
