<template>
  <form
    v-if="user.id || user.guest"
    @submit.prevent="navigateToRoom()"
    method="POST"
  >
    <label class="label mt-5">{{
      $t('gameList.welcomeText', { user: user.displayName })
    }}</label>

    <div class="field has-addons">
      <div class="control is-expanded">
        <input
          class="input"
          type="text"
          v-model="roomName"
          placeholder="apple"
          required
        />
      </div>
      <div class="control">
        <a class="button" href="#" @click.prevent="rerollName">🎲</a>
      </div>
    </div>

    <input
      class="button mt-2 mr-2 has-text-weight-bold"
      type="submit"
      :value="$t('gameList.enter')"
    />
    <button
      class="button is-warning mt-2"
      type="button"
      @click="createPrivateRoom"
    >
      {{ $t('gameList.createRoom') }}
    </button>
  </form>
  <template v-else>
    <br />
    <button class="button is-large is-success" @click="user.signIn">
      {{ $t('gameList.signIn') }}
    </button>
  </template>

  <br /><br />
  <div v-cloak>
    <h2 class="fancy">{{ $t('gameList.openRooms') }}</h2>
    <p
      v-for="openRoom in allRooms"
      :class="{ halfOpacity: !isActive(openRoom) }"
      :key="openRoom.name"
    >
      <router-link :to="`${roomDirectory}${openRoom.name}`">
        <b>{{ openRoom.name }}</b></router-link
      >{{
        $t('gameList.openRoomList', {
          players: listPlayers(openRoom).join(', '),
        })
      }}
      ({{ timeSince(openRoom.lastUpdateTime) }})
    </p>
    <h2 class="fancy" v-if="privateRooms.length > 0">
      {{ $t('gameList.privateRoom') }}
    </h2>
    <p
      v-for="privateRoom in privateRooms"
      :class="{ halfOpacity: !isActive(privateRoom) }"
      :key="privateRoom.name"
    >
      <a href="#" @click.prevent="showPrivateModal">
        <b>{{
          $t('gameList.privateRoomList', {
            player: listPlayers(privateRoom)[0],
          })
        }}</b>
      </a>
      <span v-if="listPlayers(privateRoom).length > 1">
        {{
          $t('gameList.andOthers', {
            playernumber: listPlayers(privateRoom).length,
          })
        }}</span
      >
      ({{ timeSince(privateRoom.lastUpdateTime) }})
    </p>
  </div>
</template>

<script>
import { inject } from 'vue'
import { listRooms, referSupporter } from '../firebase/network'
import { sanitize } from '../utils'
import { timeSince } from '../i18n'
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
    rerollName() {
      this.roomName = `${randomWord('adjectives')}-${randomWord('nouns')}`
    },
    // Returns a bool indicating if the provided Room object should be full opacity.
    // 1. If some but not all rooms match the filter, match those
    // 2. Otherwise, match "active" rooms, as defined by the prop `activeFunc`
    isActive(openRoom) {
      if (
        this.filteredRoomNameSet.size != 0 &&
        this.filteredRoomNameSet.size != this.allRooms.length
      ) {
        return this.filteredRoomNameSet.has(openRoom.name)
      } else {
        return this.activeFunc(openRoom)
      }
    },
    navigateToRoom(query = {}) {
      this.roomName = sanitize(this.roomName)
      this.$router.push({
        path: `${this.roomDirectory}${this.roomName}`,
        query,
      })
    },
    createPrivateRoom() {
      if (this.user.isSupporter) {
        this.navigateToRoom({ private: true })
      } else {
        this.showCreatePrivateModal()
      }
    },
    showPrivateModal() {
      this.$showModal({
        title: this.$t('gameList.privateModal.title'),
        text: this.$t('gameList.privateModal.text'),
        buttons: {
          okay: this.$t('gameList.privateModal.okay'),
          cancel: this.$t('gameList.privateModal.cancel'),
        },
        callbacks: {
          okay: () => {
            referSupporter('private_room_modal')
          },
        },
      })
    },
    showCreatePrivateModal() {
      this.$showModal({
        title: this.$t('gameList.createPrivateModal.title'),
        text: this.$t('gameList.createPrivateModal.text'),
        buttons: {
          okay: this.$t('gameList.createPrivateModal.okay'),
          cancel: this.$t('gameList.createPrivateModal.cancel'),
        },
        callbacks: {
          okay: () => {
            referSupporter('create_private_modal')
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
