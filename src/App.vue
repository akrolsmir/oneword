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
import { provide } from 'vue'
import AnimatedModal from './components/AnimatedModal.vue'
import Navbar from './components/Navbar.vue'
import { useStore } from './composables/useStore'
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
    const { user } = useUser()
    // Best practice would be to make currentUser readonly, and export an update function.
    provide('currentUser', user)

    const { $roomx, $updatex, $setx } = useStore()
    provide('$roomx', $roomx)
    provide('$updatex', $updatex)
    provide('$setx', $setx)

    return { user }
  },
  mounted() {
    this.user.signIn = this.$refs.navbar.logIn
  },
}
</script>
