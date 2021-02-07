<template>
  <LoginModal ref="modal" :visible="modalVisible" />

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
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link"> All Games </a>

          <div class="navbar-dropdown">
            <a class="navbar-item"> One Word </a>
            <a class="navbar-item"> Incrypt </a>
            <a class="navbar-item">
              <span class="tag is-success is-light mr-1">New!</span> Storytime
            </a>
            <a class="navbar-item">
              <span class="tag is-success is-light mr-1">New!</span> Wordix
            </a>
            <hr class="navbar-divider" />
            <a class="navbar-item"> Suggest a new game! </a>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div v-if="user.name" class="buttons">
            <a class="button is-primary"
              >Hello, {{ user.name.split(' ')[0] }}!</a
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
import { firebaseLogout, listenForLogin } from '../firebase/network.js'
export default {
  components: {
    LoginModal,
  },
  data() {
    return {
      user: {},
      modalVisible: false,
    }
  },
  methods: {
    logIn() {
      this.$refs.modal.toggleVisible()
    },
    async logOut() {
      await firebaseLogout()
      this.user = {}
    },
  },
  created() {
    listenForLogin((user) => (this.user = user))
  },
}
</script>
