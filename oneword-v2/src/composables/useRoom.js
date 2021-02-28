import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getRoom,
  listenForLogin,
  listenRoom,
  setRoom,
  updateRoom,
} from '../firebase/network'
import { capitalize } from '../oneword/oneword-utils'
import { getIn, randomWord } from '../utils'

function listPlayers(people) {
  return Object.entries(people || {})
    .filter(([_name, person]) => person.state !== 'WATCHING')
    .map(([name, _person]) => name)
}

/** Expects a reactive `user` object, and a function that sets up a new room. */
export function useRoom(user, makeNewRoom) {
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

  function loadFrom(newRoom) {
    // Strip out computed functions. They're readonly, but this prevents a console warning.
    delete newRoom.players
    Object.assign(room, newRoom)
  }

  const router = useRouter()
  const route = useRoute()

  // Should be called in a Vue app AFTER setup(), eg in beforeMount()
  // See: https://i.imgur.com/6jVcrja.png
  async function createOrEnterRoom() {
    // For dev velocity, accept https://oneword.games/room/rome?player=Spartacus
    if (route.query.player && !user.id) {
      user.guest = true
      user.name = route.query.player
    }

    room.name = route.params.id
    const fetchedRoom = await getRoom(room)

    if (!fetchedRoom) {
      // 1. If the room doesn't exist, create it, then return
      player.name = user.displayName || `${randomWord('adjectives')}-anon`
      await resetRoom()
      listenRoom(room.name, loadFrom)
      return
    } else {
      // 2. Set this room's contents, and proceed to enter the room
      loadFrom(fetchedRoom)
      listenRoom(room.name, loadFrom)
    }

    // 3. If returning from Firebase sign in ('?authed=1'), skip the login modal
    if (route.query.authed) {
      // Remove the 'authed=1' from the URL for cleanliness
      const query = { ...route.query }
      delete query.authed
      router.replace(query)

      // Then sign them in after the Firebase callback returns
      listenForLogin(enterRoom)
      return
    }

    // 4. Enter the room, prompting for login if needed
    await enterRoom()
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
    loadFrom(makeNewRoom(room.name))
    await joinGame(false)
    await setRoom(room)
  }

  async function saveRoom(...props) {
    await updateRoom(
      room,
      Object.fromEntries(props.map((prop) => [prop, getIn(room, prop)]))
    )
  }

  loadFrom(makeNewRoom(room.name))

  return {
    // Reactive objects
    player,
    room,

    // Methods to manipulate rooms
    createOrEnterRoom,
    resetRoom,
    saveRoom,
  }
}