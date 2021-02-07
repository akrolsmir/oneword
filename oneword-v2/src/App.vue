<template>
  <Navbar />
  <router-view />
</template>

<script>
import { provide, reactive } from 'vue'
import Navbar from './components/Navbar.vue'
import { listenForLogin } from './firebase/network'

export const currentUser = reactive({
  id: '',
  name: '',
  email: '',
  createTime: 0,
  lastUpdateTime: 0,
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
}
</script>
