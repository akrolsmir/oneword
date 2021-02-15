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
      v-model="player.roomName"
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
      :class="{ halfOpacity: isMuteOpenRoom(openRoom) }"
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

import { listRooms } from '../firebase/network'
import { sanitize, timeSince } from '../utils'
import { listPlayers } from '../oneword/oneword-utils'

export default {
  props: {
    roomDirectory: String,
  },
  setup() {
    return { user: inject('currentUser') }
  },
  data() {
    return {
      allRooms: [],
      privateRooms: [],
      player: {},
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
      const roomNameRe = new RegExp(this.player.roomName, 'i')
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
    // Returns a bool indicating if the provided Room object should be muted due to not matching the
    // currently entered Room field. Will always return false if no open rooms match the current room name.
    isMuteOpenRoom: function (openRoom) {
      return (
        this.filteredRoomNameSet.size != 0 &&
        !this.filteredRoomNameSet.has(openRoom.name)
      )
    },
    navigateToRoom() {
      this.player.roomName = sanitize(this.player.roomName)
      this.$router.push({
        path: `${this.roomDirectory}${this.player.roomName}`,
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
