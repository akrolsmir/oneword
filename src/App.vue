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

const user = reactive({
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
  displayName: computed(() => user.name.split(' ')[0]),
  guest: false,
  canPlay: computed(() => user.id || (user.guest && user.displayName)),
  // Note: Higher tiers qualify for lower tiers (Eg champions are supporters)
  isSupporter: computed(() => Boolean(user.supporter)),
  isChampion: computed(() =>
    ['CHAMPION', 'SPONSOR', 'ADMIN'].includes(user.supporter)
  ),
  isAdmin: computed(() => user.supporter === 'ADMIN'),
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
    listenForLogin((u) => {
      Object.assign(user, u)
      user.guest = false
    })

    // Best practice would be to make currentUser readonly, and export a update function.
    provide('currentUser', user)
  },
  mounted() {
    user.signIn = this.$refs.navbar.logIn
  },
}
</script>
