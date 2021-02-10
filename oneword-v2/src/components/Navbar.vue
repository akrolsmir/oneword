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
            <a class="navbar-item"> One Word </a>
            <a class="navbar-item"> Incrypt </a>
            <a class="navbar-item">
              Storytime <span class="tag is-link is-light ml-1">New!</span>
            </a>
            <a class="navbar-item">
              Wordix <span class="tag is-link is-light ml-1">New!</span>
            </a>
            <hr class="navbar-divider" />
            <a class="navbar-item"> Suggest a new game! </a>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div v-if="user.id" class="buttons">
            <router-link to="/profile" class="button is-primary"
              >Hello, {{ user.name.split(' ')[0] }}!</router-link
            >
            <a class="button is-light" @click="logOut">Log out</a>
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
import { firebaseLogout } from '../firebase/network.js'
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
  },
}
</script>
