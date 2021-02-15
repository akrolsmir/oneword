<template>
  <LoginModal
    ref="modal"
    :visible="modalVisible"
    :on-guest-callback="onGuestCallback"
    @background-click="modalVisible = false"
    @hide="modalVisible = false"
  />

  <nav
    class="navbar is-fixed-top"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <img
          src="https://oneword.games/images/oneword-logo.png"
          width="80"
          style="max-height: none"
        />
      </router-link>

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="burgerOpen = !burgerOpen"
        :class="{ 'is-active': burgerOpen }"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div
      id="navbarBasicExample"
      class="navbar-menu"
      :class="{ 'is-active': burgerOpen }"
    >
      <div class="navbar-start">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link"> All Games </a>

          <div class="navbar-dropdown">
            <router-link class="navbar-item" to="/"> One Word </router-link>
            <a class="navbar-item"> Incrypt </a>
            <router-link class="navbar-item" to="/storytime/">
              Storytime <span class="tag is-link is-light ml-1">New!</span>
            </router-link>
            <a class="navbar-item">
              Pairwise <span class="tag is-link is-light ml-1">New!</span>
            </a>
            <hr class="navbar-divider" />
            <a
              class="navbar-item"
              href="https://boredgames.gg"
              target="_blank"
              rel="noopener noreferrer"
            >
              All online board games
            </a>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div v-if="user.id" class="buttons">
            <router-link to="/profile" class="button is-white"
              >Signed in as {{ user.name.split(' ')[0] }}!</router-link
            >
            <router-link
              to="/supporter"
              class="button is-warning"
              @click="referPremium"
            >
              <strong>{{
                user.supporter ? 'Supporter' : 'Become a supporter!'
              }}</strong>
            </router-link>
          </div>
          <div v-else class="buttons">
            <a class="button is-primary" @click="logIn">
              <strong>Sign up</strong>
            </a>
            <a class="button is-light" @click="logIn"> Log in </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import LoginModal from './LoginModal.vue'
import { firebaseLogEvent, firebaseLogout } from '../firebase/network.js'
import { inject } from 'vue'
export default {
  components: {
    LoginModal,
  },
  data() {
    return {
      modalVisible: false,
      burgerOpen: false,
      onGuestCallback: Function,
    }
  },
  setup() {
    return { user: inject('currentUser') }
  },
  methods: {
    logIn(onGuestCallback = undefined) {
      this.modalVisible = true
      this.onGuestCallback = onGuestCallback
    },
    async logOut() {
      await firebaseLogout()
      this.user.id = ''
    },
    referPremium() {
      firebaseLogEvent('view_promotion', {
        source: 'navbar',
      })
    },
  },
}
</script>
