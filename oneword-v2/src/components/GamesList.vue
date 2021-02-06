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

  <form v-if="user.id || user.guest" @submit.prevent="enterRoom" method="POST">
    <label class="label">Player</label>
    <input
      class="input"
      type="text"
      v-model="player.name"
      placeholder="Ringo"
    />
    <label class="label">Room</label>
    <input
      class="input"
      type="text"
      v-model="room.name"
      placeholder="apple"
      required
    /><br /><br />
    <input class="button" type="submit" value="Enter Room" />
  </form>
  <template v-else>
    <br />
    <button class="button is-large is-success" @click="$refs.navbar.logIn()">
      Sign in to get started</button
    ><br />
    <a @click="$set(user, 'guest', true)" class="is-size-7"
      >Play without an account</a
    >
  </template>

  <br /><br />
  <div v-cloak>
    <h2 class="fancy">Open Rooms</h2>
    <p
      v-for="openRoom in allRooms"
      :class="{ halfOpacity: isMuteOpenRoom(openRoom) }"
      :key="openRoom.name"
    >
      <a href="#"
        ><b>{{ openRoom.name }}</b></a
      >, with {{ openRoom.players.join(', ') }} ({{
        dayjs(openRoom.lastUpdateTime).fromNow()
      }})
    </p>
    <h2 class="fancy">Private Rooms</h2>
    <p v-for="privateRoom in privateRooms" :key="privateRoom.name">
      <a href="#" @click.prevent="showPrivateModal">
        <b>{{ 'Private room' }} with {{ privateRoom.players[0] }}</b>
      </a>
      <span v-if="privateRoom.players.length > 1">
        and {{ privateRoom.players.length }} others</span
      >
      ({{ dayjs(privateRoom.lastUpdateTime).fromNow() }})
    </p>
    <!-- One Word Sponsors -->
    <h2 class="fancy">Sponsors</h2>
    We're grateful to be <a href="./supporter.html">sponsored by</a>:
    <div class="m-2">
      <!-- <nametag name="Tory N." :user="{ email: 'telarian@gmail.com', supporter: 'SPONSOR' }"></nametag> -->
    </div>
    Thanks for supporting One Word!
  </div>
  <br /><br />
</template>

<script>
import dayjs from 'dayjs'

export default {
  data() {
    return {
      allRooms: [],
      privateRooms: [],
      user: {},
    }
  },
  methods: {
    dayjs,
    isMuteOpenRoom(openRoom) {
      return false
    },
  },
}
</script>
