<template>
  <Navbar ref="navbar" />
  <router-view />
</template>

<script>
import { provide, reactive } from 'vue'
import Navbar from './components/Navbar.vue'
import { listenForLogin } from './firebase/network'

const currentUser = reactive({
  id: '',
  name: '',
  email: '',
  createTime: 0,
  lastUpdateTime: 0,
  // Since we're passing user around as a global anyways,
  // we'll hook in navbar's signIn here
  signIn: () => {},
  // TODO: Also add game history?
})

export default {
  components: {
    Navbar,
  },
  setup() {
    listenForLogin((user) => Object.assign(currentUser, user))

    // Best practice would be to make currentUser readonly, and export a update function.
    provide('currentUser', currentUser)
  },
  mounted() {
    currentUser.signIn = this.$refs.navbar.logIn
  },
}
</script>
