import { getRoom, listenRoom, updateRoom } from '../firebase-network.js';
import { nouns, compounds, verbs, adjectives } from '../many-words.js';

/*
TODO: This refactor is mired in technical complexity. Some thoughts:
- Components might not be the right way to pursue a game framework
  - props are not supposed to be really "shared", but rather one-way
    update for parent => child (and then events for child => parent)
- Maybe look into Vuex for state management?
- Common features like enterRoom could also just be extracted as helpers,
  maybe in firebase-network. Or not...
*/
Vue.component('roomselect', {
  props: {
    resetRoom: Function /* Initialize the room structure; differs between games */,
    user: Object /* Required props: id, guest */,
    player: Object /* Required props: name */,
    room: Object /* Required props: name */,
    navbar: Object /* from navbar component */,
  },
  methods: {
    async enterRoom() {
      if (!this.player.name) {
        this.navbar.logIn();
        return;
      }
      // Sanitize room name
      this.room.name = this.room.name
        .trim()
        .toLowerCase()
        .replace(/\s/g, '-') // whitespace
        .replace(/[^\p{L}-]/gu, ''); // not (dash or letter in any language)

      const room = await getRoom(this.room);

      if (room) {
        // If the player's name collides with another user's,
        // prepend adjectives until it is unique
        while (
          room.players.includes(this.player.name) &&
          (this.user.guest || this.user.email != room.playerData[this.player.name].email)
        ) {
          this.player.name = capitalize(randomWord('adjectives')) + ' ' + this.player.name;
        }

        this.room = room;
        return await this.joinRoom();
      } else {
        // Create a new room
        listenRoom(this);
        return await this.resetRoom();
      }
    },
    // Only call if room already exists.
    async joinRoom() {
      listenRoom(this);

      // migration
      if (!this.room.playerData) {
        this.room.playerData = {};
      }

      const { email = '', supporter = '' } = this.user;
      this.room.playerData[this.player.name] = { email, supporter };

      if (this.room.players.includes(this.player.name)) {
        await this.saveRoom('playerData');
      } else {
        // Note: players could have a race condition, if two people enter
        // simultaneously. Should replace with single source of truth playerData,
        // since dicts do not overwrite
        this.room.players.push(this.player.name);
        await this.saveRoom('playerData', 'players');
      }
    },
    // Copied from index.html
    async saveRoom(...props) {
      await updateRoom(this.room, Object.fromEntries(props.map((prop) => [prop, this.room[prop]])));
    },
  },
  template: `
<div>
  <form v-if="user.id || user.guest" @submit.prevent="enterRoom" method="POST">
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

function capitalize(str) {
  return str ? str[0].toLocaleUpperCase() + str.substring(1) : '';
}

// Copied from index.html
function randomWord(category = 'nouns', customWords = '') {
  const custom = customWords.split(/\s/);
  const categories = { nouns, compounds, verbs, adjectives, custom };
  const words = categories[category];
  return words[Math.floor(Math.random() * words.length)];
}
