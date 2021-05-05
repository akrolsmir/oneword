import { computed, onBeforeMount, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getRoom,
  listenForLogin,
  listenRoom,
  serverLog,
  setRoom,
  updateRoom,
} from '../firebase/network'
import { capitalize } from '../oneword/oneword-utils'
import { getIn } from '../utils'
import { randomWord } from '../words/lists'

function listPlayers(people) {
  return Object.entries(people || {})
    .filter(([_name, person]) => person.state !== 'WATCHING')
    .map(([name, _person]) => name)
    .sort()
}

/**
 * Creates a template room, usable in different game types.
 * Room creation & joining logic should go here; game logic should not.
 *
 * @param {*} user - Reactive user object from useUser()
 * @param {Function} makeNewRoom - Should return a new room with no one in it
 * @param {Function} [onJoin] - Callback, to do more init for player/room
 */
export function useRoom(user, makeNewRoom, onJoin = undefined) {
  // Contains local data about the player's choices; not yet synced to Firestore.
  const player = reactive({
    name: 'Eve',

    isMod: computed(() => {
      return user.isAdmin || room.people[player.name]?.state === 'MOD'
    }),
    isDev: computed(() => {
      return (
        user.isAdmin || ['localhost', '127.0.0.1'].includes(location.hostname)
      )
    }),
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
  // See Vue lifecycle: https://i.imgur.com/6jVcrja.png
  async function createOrEnterRoom() {
    // For dev velocity, accept https://oneword.games/room/rome?player=Spartacus
    if (route.query.player) {
      user.guest = true
      user.name = route.query.player
    }

    room.name = route.params.id
    const fetchedRoom = await getRoom(room)

    if (!fetchedRoom) {
      // 1. If the room doesn't exist, create it, then return
      // Known issue: Creating as a guest leads to 'Anon'
      await resetRoom()

      // 1.5. If room should be private ('?private=1'), privatize & clean the URL
      if (route.query.private) {
        router.replace(without(route.query, 'private'))
        await updateRoom(room, { public: false })
      }
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
      router.replace(without(route.query, 'authed'))

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
      user.signIn(joinGame)
    } else {
      await joinGame()
    }
  }

  function uniquify(name) {
    player.name = name
    // Skip uniquify popup when entering from ?player=Spartacus
    if (route.query.player) return

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
    uniquify(user.displayName || 'Anon')
    room.people[player.name] = {
      id: user.id,
      supporter: user.supporter,
      state: 'PLAYING',
      guest: user.guest,
      avatarUrl: user.avatarUrl,
    }
    if (onJoin) {
      onJoin(room, player)
    }
    if (alsoUpload) {
      await saveRoom(`people.${player.name}`)
    }
  }

  async function resetRoom() {
    loadFrom(makeNewRoom(room.name))
    await joinGame(false)
    const roomCopy = { ...room }
    delete roomCopy.players
    await setRoom(roomCopy)
  }

  async function saveRoom(...props) {
    await updateRoom(
      room,
      Object.fromEntries(props.map((prop) => [prop, getIn(room, prop)]))
    )
  }

  async function kickPlayer(name) {
    await updateRoom(room, { [`people.${name}.state`]: 'WATCHING' })
  }

  async function makeMod(name) {
    await updateRoom(room, {
      [`people.${this.player.name}.state`]: 'PLAYING',
      [`people.${name}.state`]: 'MOD',
    })
  }

  function without(object, ...props) {
    const copy = { ...object }
    props.forEach((prop) => delete copy[prop])
    return copy
  }

  loadFrom(makeNewRoom(room.name))

  onBeforeMount(() => {
    /* no await */ createOrEnterRoom()
  })

  return {
    // Reactive objects
    player,
    room,

    // Methods to manipulate rooms
    enterRoom,
    resetRoom,
    saveRoom,
    kickPlayer,
    makeMod,
  }
}
