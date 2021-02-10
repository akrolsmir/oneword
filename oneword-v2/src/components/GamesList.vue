<template>
  <div>
    <div class="fancy big">Welcome!</div>
    This is an online game based on
    <a target="_blank" rel="noopener noreferrer" href="https://amzn.to/2xV5lUm"
      >Just One</a
    >, a co-op word game for 3+ players.<br />
    In each of the 13 rounds, come up with a one-word hint for the guesser...<br />
    But beware: duplicate hints are discarded!<br />
  </div>

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
    /><br /><br />
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
      <router-link :to="`/room/${openRoom.name}`">
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
    <!-- One Word Sponsors -->
    <h2 class="fancy">Sponsors</h2>
    We're grateful to be <a href="./supporter.html">sponsored by</a>:
    <div class="m-2">
      <Nametag
        name="Tory N."
        :user="{ email: 'telarian@gmail.com', supporter: 'SPONSOR' }"
      />
    </div>
    Thanks for supporting One Word!
  </div>
  <br /><br />
</template>

<script>
import { inject } from 'vue'
import { formatDistanceToNow } from 'date-fns'

import Nametag from './Nametag.vue'
import { listRooms } from '../firebase/network'
import { sanitize } from '../text-utils'
import { listPlayers } from '../oneword/oneword-utils'

export default {
  components: {
    Nametag,
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
    listPlayers,
    isMuteOpenRoom(openRoom) {
      return false // TODO: fix
    },
    timeSince(millis) {
      return formatDistanceToNow(new Date(millis), { addSuffix: true })
    },
    navigateToRoom() {
      this.player.roomName = sanitize(this.player.roomName)
      this.$router.push({ path: `/room/${this.player.roomName}` })
    },
  },
}
</script>
