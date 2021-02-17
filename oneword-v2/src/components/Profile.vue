<template>
  <BigColumn>
    <section class="hero is-info is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Hey there, {{ displayName }}.
            {{ user.id ? '' : 'Care to sign in?' }}
          </h1>
          <h2 class="subtitle" v-if="user.supporter">
            Thanks for being a supporter!
          </h2>
          <h2 class="subtitle" v-else>Thanks for playing!</h2>
        </div>
      </div>
    </section>
    <br />
    <div v-if="this.user.id" class="buttons">
      <button class="button" @click="logout">Sign out</button>
      <!-- TODO: Change name button? -->
    </div>
    <br />
    <br />

    <h2 class="title">Your Avatar</h2>
    <Nametag :user="user" :name="displayName" />
    <br />
    <p v-if="user.supporter">
      You can change your avatar on
      <a href="https://en.gravatar.com/">Gravatar</a>.
    </p>
    <p v-else>
      Become a <a href="./supporter?refer=profile">supporter</a> to change your
      avatar!
    </p>
    <br />

    <h2 class="title">Your Games</h2>
    <div class="box">
      <h3 class="subtitle">One Word</h3>
      <p v-for="game in onewordGames">
        <b
          ><router-link :to="`/room/${game.roomId}`">{{
            game.roomId
          }}</router-link></b
        >, {{ timeSince(game.lastUpdateTime) }}
      </p>
      <br />
      <h3 class="subtitle">Incrypt</h3>
      <p v-for="game in incryptGames">
        <b
          ><router-link :to="`/incrypt/${game.roomId}`">{{
            game.roomId
          }}</router-link></b
        >, {{ timeSince(game.lastUpdateTime) }}
      </p>
    </div>
  </BigColumn>
</template>

<script>
import { inject } from 'vue'
import { firebaseLogout } from '../firebase/network.js'
import { timeSince } from '../utils.js'
import BigColumn from './BigColumn.vue'

import Nametag from './Nametag.vue'

export default {
  components: {
    Nametag,
    BigColumn,
  },
  setup() {
    return { user: inject('currentUser') }
  },
  methods: {
    url,
    title,
    async logout() {
      await firebaseLogout()
      this.user.id = ''
    },
    timeSince,
  },
  computed: {
    displayName() {
      return (this.user.name && this.user.name.split(' ')[0]) || 'friend'
    },
    gamesByTime() {
      return Object.values(this.user.games || {}).sort(
        (a, b) => b.lastUpdateTime - a.lastUpdateTime
      )
    },
    onewordGames() {
      return this.gamesByTime.filter((game) => game.roomDb === 'rooms')
    },
    incryptGames() {
      return this.gamesByTime.filter((game) => game.roomDb === 'incrypt')
    },
  },
}

function title(game) {
  return {
    rooms: 'One Word',
    incrypt: 'Incrypt',
  }[game.roomDb]
}

function url(game) {
  return {
    rooms: `https://oneword.games?room=${game.roomId}`,
    incrypt: `https://oneword.games/incrypt?room=${game.roomId}`,
  }[game.roomDb]
}
</script>
