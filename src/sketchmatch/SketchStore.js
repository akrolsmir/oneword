import { createStore } from 'vuex'
import { updateRoom } from '../firebase/network'
import { setIn } from '../utils'

export const store = createStore({
  state() {
    return {
      roomStore: {}, // Synced to Firebase room
    }
  },
  mutations: {
    input(state, { path, value }) {
      // Optimistically update the local room state
      setIn(state.roomStore, path, value)
      // Also push the changes to Firestore
      /* no await */ updateRoom(state.roomStore, { [path]: value })
    },
    // nextRound(state) {},
    loadFirestore(state, firestoreJson) {
      state.roomStore = firestoreJson
      // TODO: need to hook up to listenRoom
    },
  },
  actions: {},
})

// roomStore should be the new source of truth for a room
// Mutations aren't so defined, rather, components directly manipulate room obj
// State should track all player inputs over time

/*
Q: When do we push Vuex state to Firestore?
  1. Before modifying the state
  2. After modifying the state
  3. Have Vuexfire take care of it? @next seems to support Vue 3
*/
