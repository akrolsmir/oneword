<template>
  <!-- Standard Modals -->
  <AnimatedModal
    :visible="showStandardModal"
    :content="standardModal"
    @background-click="showStandardModal = false"
    @cancel="showStandardModal = false"
  />
  <Navbar ref="navbar" />
  <router-view />
</template>

<script>
import { provide, reactive, computed } from 'vue'
import AnimatedModal from './components/AnimatedModal.vue'
import Navbar from './components/Navbar.vue'
import { listenForLogin } from './firebase/network'

const currentUser = reactive({
  // If user.id is not filled in, then user is not logged in
  id: '',
  name: '',
  email: '',
  createTime: 0,
  lastUpdateTime: 0,
  // TODO: Also add game history?
  // NOTE: The following properties are not pulled from Firestore
  // Callback to display the sign in popup
  signIn: () => {},
  // Display only the first name
  displayName: computed(() => currentUser.name.split(' ')[0]),
  guest: false,
  canPlay: computed(
    () => currentUser.id || (currentUser.guest && currentUser.displayName)
  ),
})
export default {
  components: {
    AnimatedModal,
    Navbar,
  },
  data() {
    return { showStandardModal: false, standardModal: {} }
  },
  methods: {
    showModal(modalConfig) {
      this.showStandardModal = true
      this.standardModal = modalConfig
    },
  },
  setup() {
    listenForLogin((user) => {
      Object.assign(currentUser, user)
      user.guest = false
    })

    // Best practice would be to make currentUser readonly, and export a update function.
    provide('currentUser', currentUser)
  },
  mounted() {
    currentUser.signIn = this.$refs.navbar.logIn
  },
}
</script>
