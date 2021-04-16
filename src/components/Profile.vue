<template>
  <BigColumn>
    <section class="hero is-info is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Hey there, {{ displayName }}.
            {{ user.id ? '' : 'Care to sign in?' }}
          </h1>
          <h2 class="subtitle" v-if="user.isSupporter">
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
    <p v-if="user.isSupporter">
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
      <template v-for="(gameTitle, db) in DB_TO_GAMES">
        <h3 class="subtitle">{{ gameTitle }}</h3>
        <div v-if="listGames(db).length === 0">
          You haven't played {{ gameTitle }} yet...
        </div>
        <p v-else v-for="game in listGames(db)">
          <b
            ><router-link :to="`/${DB_TO_PATH[db]}/${game.roomId}`">{{
              game.roomId
            }}</router-link></b
          >, {{ timeSince(game.lastUpdateTime) }}
        </p>
        <br />
      </template>
    </div>

    <h2 class="title">Supporter Settings</h2>
    <div v-if="user.isSupporter">
      Thanks for being a One Word {{ user.supporterString }}! <br />
      <!-- TODO: also include on Supporter page -->
      <a href="#" @click.prevent="launchCustomerPortal">
        Manage your settings
      </a>
    </div>
    <div v-else>
      You're not currently a supporter 😢 <br />
      <!-- TODO: Could set up referral tracking -->
      <router-link to="/supporter" class="button is-warning"
        >Become one!</router-link
      >
    </div>
  </BigColumn>
</template>

<script>
import { inject } from 'vue'
import { customerPortal, firebaseLogout } from '../firebase/network.js'
import { timeSince } from '../utils.js'
import BigColumn from './BigColumn.vue'

import Nametag from './Nametag.vue'

const DB_TO_GAMES = {
  rooms: 'One Word',
  incrypt: 'Incrypt',
  silver: 'Storytime',
  pairwise: 'Pairwise',
}

const DB_TO_PATH = {
  rooms: 'room',
  incrypt: 'incrypt',
  silver: 'storytime',
  pairwise: 'pairwise',
}

export default {
  components: {
    Nametag,
    BigColumn,
  },
  data: () => ({ DB_TO_GAMES, DB_TO_PATH }),
  setup() {
    return { user: inject('currentUser') }
  },
  methods: {
    async logout() {
      await firebaseLogout()
      this.user.id = ''
    },
    timeSince,
    listGames(db) {
      return this.gamesByTime.filter((game) => game.roomDb === db)
    },
    async launchCustomerPortal() {
      try {
        const resp = await customerPortal({
          returnUrl: window.location.toString(),
        })
        const url = resp.data
        window.open(url, '_blank')
      } catch (error) {
        alert(
          `Whoops, our system broke! Please contact austin@oneword.games\n\n${error}`
        )
      }
    },
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
  },
}
</script>
