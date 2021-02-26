import { computed, reactive } from 'vue'
import { setRoom, updateRoom } from '../firebase/network'
import { getIn } from '../utils'

function listPlayers(people) {
  return Object.entries(people || {})
    .filter(([_name, person]) => person.state !== 'WATCHING')
    .map(([name, _person]) => name)
}

export function useRoom(user, newRoom) {
  // Contains local data about the player's choices; not synced to Firestore.
  const player = reactive({
    name: 'Charliez',
  })

  // Synced to Firestore
  const room = reactive({
    // Basic properties
    name: '',
    // state: '',
    // round: {},
    // history: [],
    people: {},

    // Serialize/Deserialize.
    loadFrom(r) {
      Object.assign(room, r)
    },
    createOrListen() {
      // TODO
    },

    async enterRoom() {
      if (!user.canPlay) {
        // If not logged in, show the sign-in modal
        const onGuest = () => {
          room.uniquify(user.displayName)
          room.joinGame()
        }
        user.signIn(onGuest)
      } else {
        room.uniquify(user.displayName)
        await room.joinGame()
      }
    },

    uniquify(name) {
      player.name = name

      // TODO: need to figure out this.players

      // If the player's name collides with another user's (aka different id,
      // or player is a guest), prepend adjectives until name is unique
      // while (
      //   this.players.includes(player.name) &&
      //   (user.id != this.room.people[player.name].id || user.guest)
      // ) {
      //   player.name = capitalize(randomWord('adjectives')) + ' ' + player.name
      // }
      // // Let the player know if they were renamed
      // if (player.name !== name) {
      //   console.warn('TODOOOOOO')
      //   // room.showUniquifiedModal()
      // }
    },

    async joinGame() {
      // Assumes player.name as already been uniquify'd
      room.people[player.name] = {
        id: user.id || '',
        supporter: user.isSupporter || '',
        state: 'PLAYING',
      }
      await room.saveRoom('people')
    },

    async resetRoom() {
      room.loadFrom(newRoom())
      await room.joinGame()
      console.log('about to set', room)
      await setRoom(room)
    },

    async saveRoom(...props) {
      await updateRoom(
        room,
        Object.fromEntries(props.map((prop) => [prop, getIn(room, prop)]))
      )
    },

    players: computed(() => listPlayers(room.people)),
  })

  room.loadFrom(newRoom())

  return {
    player,
    room,
  }
}
