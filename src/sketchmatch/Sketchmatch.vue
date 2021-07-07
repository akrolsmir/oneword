<!-- Subtext Rules: https://www.ultraboardgames.com/subtext/game-rules.php -->

<template>
  <BigColumn>
    <!-- Header -->
    <div class="card m-2 p-4">
      {{ room.players }}<br />
      <button class="button" @click="newRound">New Round</button>
      <button class="button" @click="toGuessing">To: GUESSING</button>
      <button class="button is-danger" @click="resetRoom">Reset game</button>
    </div>

    <div class="columns">
      <div class="column" v-for="agent in room.players">
        <!-- Current Round -->
        <div class="card m-2 p-4">
          <template v-if="roomx.state === 'DRAWING'">
            <h2 class="subtitle">
              {{ agent }}'s Word: {{ roomx.round.words[agent] }}
            </h2>
            Draw something
            <Sketchpad :path="`round.${roomx.state}.${agent}`" />
          </template>
          <template v-if="roomx.state === 'GUESSING'">
            <img :src="roomx.round.DRAWING[agent]" alt="Clue" />
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
import { randomWord } from '../words/lists'

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
      // FIXME: Updates aren't coming in, because this triggers
      // BEFORE useRoom's listenRoom and thus gets overwritten
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
    toGuessing() {
      this.updatex({ state: 'GUESSING' })
    },
    newRound() {
      const history = [...this.roomx.history, this.roomx.round]
      const round = {
        words: {
          Austin: randomWord(),
          Boston: 'gold',
        },
      }
      const state = 'DRAWING'
      this.updatex({ history, round, state })
    },
    submitClue() {
      this.roomx.round.clues[this.player.name] = this.player.clue
      this.saveRoom(`round.clues.${this.player.name}`)
    },
    becomeSpy() {
      this.roomx.spy = this.player.name
      this.saveRoom('spy')
    },
    updatex(changes) {
      this.$store.commit('updateState', changes)
    },
  },
}
</script>
