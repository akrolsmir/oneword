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
    people: {},

    // See if the computed function will actually upload to Firestore properly
    players: computed(() => listPlayers(room.people)),

    // I think it writes? But it can't be overwritten...
  })

  // Serialize/Deserialize.
  function loadFrom(r) {
    delete r.players // Since computed functions are readonly (prevents console warn)
    Object.assign(room, r)
  }
  function createOrListen() {
    // TODO
  }

  async function enterRoom() {
    if (!user.canPlay) {
      // If not logged in, show the sign-in modal
      const onGuest = () => {
        uniquify(user.displayName)
        joinGame()
      }
      user.signIn(onGuest)
    } else {
      uniquify(user.displayName)
      await joinGame()
    }
  }

  function uniquify(name) {
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
    //   // showUniquifiedModal()
    // }
  }

  async function joinGame(alsoUpload = true) {
    // Assumes player.name as already been uniquify'd
    room.people[player.name] = {
      id: user.id || '',
      supporter: user.isSupporter || '',
      state: 'PLAYING',
    }
    if (alsoUpload) {
      await saveRoom('people')
    }
  }

  async function resetRoom() {
    loadFrom(newRoom(room.name))
    await joinGame(false)
    await setRoom(room)
  }

  async function saveRoom(...props) {
    await updateRoom(
      room,
      Object.fromEntries(props.map((prop) => [prop, getIn(room, prop)]))
    )
  }

  loadFrom(newRoom(room.name))

  return {
    player,
    room,

    loadFrom,
    enterRoom,
    resetRoom,
    saveRoom,
  }
}
