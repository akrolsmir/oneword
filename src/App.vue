<template>
  <!-- Standard Modals -->
  <AnimatedModal
    :visible="showStandardModal"
    :content="standardModal"
    @background-click="showStandardModal = false"
    @cancel="showStandardModal = false"
  />
  <Navbar ref="navbar" :navbarShown="navbarShown" />
  <router-view />
</template>

<script>
import { provide, ref } from 'vue'
import AnimatedModal from './components/AnimatedModal.vue'
import Navbar from './components/Navbar.vue'
import { useUser } from './composables/useUser'

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
    // Provide a way for pages to hide the navbar
    const navbarShown = ref(true)
    const showNavbar = (value) => {
      navbarShown.value = value
      document.body.className = navbarShown.value ? 'has-navbar-fixed-top' : ''
    }
    provide('showNavbar', showNavbar)

    const { user } = useUser()
    // Best practice would be to make currentUser readonly, and export an update function.
    provide('currentUser', user)
    return { user, showNavbar, navbarShown }
  },
  mounted() {
    this.user.signIn = this.$refs.navbar.logIn
  },
}
</script>
