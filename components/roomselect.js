Vue.component('roomselect', {
  props: {
    onEnter: Function,
    user: Object /* Required props: id, guest */,
    player: Object /* Required props: name */,
    room: Object /* Required props: name */,
    navbar: Object /* from navbar component */,
  },
  template: `
<div>
  <form v-if="user.id || user.guest" @submit.prevent="onEnter" method="POST">
    <label class="label">Player</label>
    <input class="input" type="text" v-model="player.name" placeholder="Ringo" />
    <label class="label">Room</label>
    <input class="input" type="text" v-model="room.name" placeholder="apple" required /><br /><br />
    <input class="button" type="submit" value="Enter Room" />
  </form>
  <template v-else>
    <br />
    <button class="button is-large is-success" @click="$refs.navbar.logIn()">Sign in to get started</button><br />
    <a @click='$set(user, "guest", true)' class="is-size-7">Guest account</a>
  </template>
</div>
  `,
});
