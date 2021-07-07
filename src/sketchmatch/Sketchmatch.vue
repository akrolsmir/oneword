<!-- Subtext Rules: https://www.ultraboardgames.com/subtext/game-rules.php -->

<template>
  <BigColumn>
    <!-- Header -->
    <div class="card m-2 p-4">
      <button class="button" @click="newRound">Next Round</button>
      <button class="button is-danger" @click="resetRoom">Reset game</button>
    </div>

    <div class="columns">
      <div class="column" v-for="agent in room.players">
        <!-- Current Round -->
        <div class="card m-2 p-4">
          <template v-if="roomx.state === 'DRAWING'">
            <h2 class="subtitle">Word: {{ roomx.round.words[player.name] }}</h2>
            Draw something
            <Sketchpad :path="`round.${roomx.state}.${agent}`" />
          </template>
        </div>

        <!-- History -->
        <div class="card m-2 p-4" v-for="round in roomx.history"></div>
      </div>
    </div>
  </BigColumn>
</template>

<style scoped>
.background {
  background-color: rgb(201, 224, 178);
}
</style>

<script>
import { inject } from 'vue'
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
import Timer from '../components/Timer.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import Sketchpad from './Sketchpad.vue'
import { useRoom } from '../composables/useRoom.js'
import { debounce } from '../utils'
import { listenRoom } from '../firebase/network'

function makeNewRoom(name) {
  return {
    name,
    state: 'DRAWING', // "DRAWING", "GUESSING", "DONE",
    rounds: 8, // Depends on # players. 2x for 4-5p, 1x for 6-8p
    people: {
      // TODO: Roles: 1x TEACHER, 1x PET, Nx STUDENT
    },
    round: {
      teacher: 'Austin',
      // Alternatively: Could be grouped by player?
      words: {
        Austin: 'snail',
        Boston: 'table',
        Caustic: 'soup',
        Dustin: 'snail',
      },
      DRAWING: {
        Austin: '...',
      },
      // TODO: some kind of shuffled ordering?
      GUESSING: {
        Austin: 'Dustin',
        Boston: 'Caustic',
        Caustic: 'Dustin',
        Dustin: 'Dustin',
        // Note: not that interesting to guess your own;
        // Maybe PET should try to guess the most popular other answer?
      },
    },
    history: [],
    invalidEntries: {},
    timerLength: 90,
    public: true,
    lastUpdateTime: Date.now(),
  }
}

export default {
  components: {
    BigColumn,
    Chatbox,
    Timer,
    Nametag,
    ShareLink,
    Sketchpad,
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  created() {
    this.debouncedSubmitClue = debounce(this.submitClue, 300)
  },
  watch: {
    'room.name'() {
      // Write updates to Vuex store instead of local room
      this.$store.commit('loadFirestore', this.room)
      listenRoom(this.room.name, (room) => {
        this.$store.commit('loadFirestore', room)
      })
    },
  },
  computed: {
    roomx() {
      // Vuex version of room
      // Question: can we do all this without Vuex?
      return this.$store.state.roomStore || {}
    },
  },
  methods: {
    newRound() {
      this.roomx.history.push(this.roomx.round)
      // Hm, can't just modify roomx. Supposed to use a mutation, I think
      // This is a pretty annoying extra layer. What could we do instead?
      // 1. Write to roomx and call a "sync" function that auto pushes
      // 2. Maybe this is okay, most inputs are now handled automatically
      this.roomx.round = {
        clues: {},
        defuses: {},
        correct: 0,
      }
      this.roomx.state = 'DRAWING'
      this.saveRoom('state', 'history', 'round')
    },
    submitClue() {
      this.roomx.round.clues[this.player.name] = this.player.clue
      this.saveRoom(`round.clues.${this.player.name}`)
    },
    becomeSpy() {
      this.roomx.spy = this.player.name
      this.saveRoom('spy')
    },
  },
}
</script>
