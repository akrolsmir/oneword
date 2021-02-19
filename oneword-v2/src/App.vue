<template>
  <Navbar ref="navbar" />
  <router-view />
</template>

<script>
import { provide, reactive, computed, ref } from 'vue'
import Navbar from './components/Navbar.vue'
import { listenForLogin } from './firebase/network'

function useRoom() {
  // const room = ref({});
  const room = reactive({
    name: '',
    state: '',
    round: {},
    history: [],
    people: {},
  })

  function loadFrom(r) {
    Object.assign(room, r)
  }

  // 1: client directly updates room, then calls push
  async function push(...props) {
    await updateRoom(
      room,
      Object.fromEntries(props.map((prop) => [prop, getIn(this.room, prop)]))
    )
  }

  // OR 2: This does the updating and push
  async function update(path, toUpdate) {}

  // OR 3: Skip local update, always just push

  // Could even try to batch updates together to save roundtrips???!
  // (maybe Firestore handles this; maybe 2 pushes are okay)

  // resetRoom must be overriden?
  // enterRoom may be overriden? (or just a boolean of "whether to skip")
  //
}

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
    Navbar,
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
