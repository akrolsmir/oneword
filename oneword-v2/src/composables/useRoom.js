import { computed, reactive } from 'vue'
import { setRoom, updateRoom } from '../firebase/network'
import { capitalize } from '../oneword/oneword-utils'
import { getIn, randomWord } from '../utils'

function listPlayers(people) {
  return Object.entries(people || {})
    .filter(([_name, person]) => person.state !== 'WATCHING')
    .map(([name, _person]) => name)
}

/** Expects a reactive `user` object, and a function that sets up a new room. */
export function useRoom(user, newRoom) {
  // Contains local data about the player's choices; not yet synced to Firestore.
  const player = reactive({
    name: 'Eve',
  })

  // The room object containing the game state; synced to Firestore.
  const room = reactive({
    // Basic properties
    name: '',
    people: {},

    players: computed(() => listPlayers(room.people)),
  })

  // Serialize/Deserialize.
  function loadFrom(r) {
    delete r.players // Since computed functions are readonly (prevents console warn)
    Object.assign(room, r)
  }

  function createOrListen() {
    // TODO place in the room creation/listening logic that's inside created() atm
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
    const idsMatch = user.id == room.people[player.name]?.id && !user.guest
    while (room.players.includes(player.name) && !idsMatch) {
      const oldName = player.name.split(' ').pop()
      const title = `Another "${oldName}" is already in this room...\n\nPick a new name!`
      const zanyName = capitalize(randomWord('adjectives')) + ' ' + player.name
      // TODO: Prettify modal, by hooking into user.signIn's modal instead
      let input
      do {
        input = prompt(title, zanyName)
      } while (!input)
      player.name = input
    }
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
    // Reactive objects
    player,
    room,

    // Methods to manipulate rooms
    loadFrom,
    enterRoom,
    resetRoom,
    saveRoom,
  }
}
