<template>
  <LoginModal
    ref="modal"
    :visible="modalVisible"
    :on-guest-callback="onGuestCallback"
    @background-click="modalVisible = false"
    @hide="modalVisible = false"
  />

  <nav
    v-if="navbarShown"
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
          <a class="navbar-link" href="#" @click.prevent>
            {{ $t('navBar.allGame') }}
          </a>
          <div class="navbar-dropdown">
            <router-link class="navbar-item" to="/">One Word</router-link>
            <router-link class="navbar-item" to="/incrypt">Incrypt</router-link>
            <router-link class="navbar-item" to="/listorama">
              Listorama
            </router-link>
            <router-link class="navbar-item" to="/storytime">
              Storytime
            </router-link>
            <router-link class="navbar-item" to="/pairwise">
              Pairwise
            </router-link>
            <router-link class="navbar-item" to="/quadsquad">
              Quad Squad
              <!-- <span class="tag is-link is-light ml-1">{{
                $t('navBar.new')
              }}</span> -->
            </router-link>
            <hr class="navbar-divider" />
            <a
              class="navbar-item"
              href="https://boredgames-gg.netlify.app/"
              target="_blank"
              rel="noopener"
            >
              {{ $t('navBar.discoverOther') }}
            </a>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="locale-changer select pr-2">
            <select v-model="$i18n.locale">
              <option value="en" selected>English</option>
              <option value="es">Español</option>
              <option value="zh_TW">繁體中文</option>
              <option value="zh_CN">简体中文</option>
            </select>
          </div>
          <div class="buttons">
            <router-link v-if="user.id" to="/profile" class="button is-white">
              {{ $t('navBar.signInAs', { user: user.name.split(' ')[0] }) }}
            </router-link>
            <button v-else class="button is-light" @click="logIn">
              {{ $t('navBar.signUp') }}
            </button>
            <a
              href="/supporter"
              class="button is-warning"
              @click.prevent="referSupporter('navbar')"
            >
              <strong>{{
                user.isSupporter
                  ? $t('navBar.supporter')
                  : $t('navBar.becomeSupporter')
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
  props: {
    navbarShown: Boolean,
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
