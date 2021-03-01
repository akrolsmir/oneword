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
        <img src="/oneword-logo.png" width="80" style="max-height: none" />
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
            <router-link class="navbar-item" to="/incrypt">
              Incrypt
            </router-link>
            <!-- <router-link class="navbar-item" to="/storytime">
              Storytime <span class="tag is-link is-light ml-1">New!</span>
            </router-link>
            <router-link class="navbar-item" to="/pairwise">
              Pairwise <span class="tag is-link is-light ml-1">New!</span>
            </router-link> -->
            <hr class="navbar-divider" />
            <a
              class="navbar-item"
              href="https://boredgames.gg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discover other games...
            </a>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <router-link v-if="user.id" to="/profile" class="button is-white"
              >Signed in as {{ user.name.split(' ')[0] }}!</router-link
            >
            <a v-else class="button is-light" @click="logIn"> Sign up </a>
            <a
              href="/supporter"
              class="button is-warning"
              @click.prevent="referSupporter('navbar')"
            >
              <strong>{{
                user.isSupporter ? 'Supporter' : 'Become a supporter!'
              }}</strong>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import LoginModal from './LoginModal.vue'
import { firebaseLogout, referSupporter } from '../firebase/network.js'
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
    referSupporter,
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
