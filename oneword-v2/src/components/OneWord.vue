<template>
  <router-link to="/">Back</router-link>
  <div>{{ $route.params.id }}</div>
  <div>{{ JSON.stringify(room) }}</div>
</template>

<script>
import { getRoom, listenRoom } from '../firebase/network'
export default {
  data() {
    return {
      room: {},
    }
  },
  async created() {
    this.room = await getRoom({ name: this.$route.params.id })
    listenRoom(this.room.name, (room) => (this.room = room))
  },
}
</script>
