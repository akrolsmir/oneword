<!-- Rules: https://docs.google.com/document/d/1DJckKhBSKjZXwYYg2xCEvEcK6tx1_aS2QpwJSw40dYQ/edit -->

<template>
  <BigColumn :showPanes="true">
    <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template>

    <h2 class="subtitle">{{ room.state }}</h2>

    <!-- 2 x 2 Grid with labeled axis -->
    <div class="columns">
      <div class="column"></div>
      <div class="column">{{ room.round.xAxis?.[0] }}</div>
      <div class="column">{{ room.round.xAxis?.[1] }}</div>
    </div>
    <div class="columns">
      <div class="column">{{ room.round.yAxis?.[0] }}</div>
      <div class="column">A</div>
      <div class="column">B</div>
    </div>
    <div class="columns">
      <div class="column">{{ room.round.yAxis?.[1] }}</div>
      <div class="column">C</div>
      <div class="column">D</div>
    </div>

    <div class="card p-4">
      <div v-if="room.state === 'CLUING'">
        <div v-if="room.round.cluer === player.name">
          <p>Give a clue that for this alignment chart!</p>
          <p>(Try to cover as many quadrants as possible)</p>
          <input type="text" class="input" v-model="player.clue" />
          <button class="button is-primary" @click="submitClue">
            Submit Clue
          </button>
        </div>
        <div v-else>
          <p>Waiting for {{ room.round.cluer }} to give a clue...</p>
        </div>
      </div>
      <div v-else-if="room.state === 'VOTING'">
        What quadrant does "{{ room.round.clue }}" go in?
        <button
          v-for="quadrant in ['A', 'B', 'C', 'D']"
          class="button"
          @click="submitVote(quadrant)"
        >
          {{ quadrant }}
        </button>
      </div>
      <div v-else-if="room.state === 'DONE'"></div>
    </div>

    <!-- Mod tools -->
    <!-- Copied from Incrypt -->
    <div v-if="player.isMod" class="notification mx-3 mt-4 mb-6">
      <h2>Mod tools</h2>
      <br />
      <div class="columns">
        <div class="column">
          <button class="button is-small is-danger" @click="nextStage">
            End round
          </button>
          <button
            v-if="player.isDev"
            class="button is-small is-danger"
            @click="resetRoom"
          >
            Reset game
          </button>
        </div>
        <div class="column is-size-7">
          <div class="field has-addons">
            <div class="control">
              <input
                class="input is-small"
                style="flex: 1 2 48px"
                v-model.number="player.timerLength"
              />
            </div>
            <div class="control">
              <button class="button is-small" @click="updateTimer">
                Set round timer (secs)
              </button>
            </div>
          </div>
          <br />
          <b>Timer suggestion</b><br />
          90 secs for a new group<br />
          60 secs for an experienced group<br />
          0 secs to disable timers<br />
        </div>
      </div>
    </div>
  </BigColumn>
</template>

<style scoped>
.background {
  background-color: #e0e7ff;
}
</style>

<script>
import { inject } from 'vue'
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
import Timer from '../components/Timer.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import { axisCards } from './cards.js'
import { useRoom } from '../composables/useRoom.js'
import {
  debounce,
  listIncludes,
  pickRandom,
  sanitize,
  orderedEntries,
  pickFromBag,
} from '../utils'
import { updateRoom } from '../firebase/network'
import { nextGuesser } from '../oneword/oneword-utils'

function makeNewRoom(name) {
  return {
    name,
    state: 'CLUING', // "CLUING", "VOTING", "DONE"
    winningScore: 10,
    people: {},
    round: {
      // /** */ Example:
      xAxis: ['Good', 'Evil'],
      yAxis: ['New', 'Old'],

      // Grid structure should look like:
      //      Good  Evil
      // New  A     B
      // Old  C     D

      cluer: 'Austin',
      clue: 'Twitter',

      votes: {
        Alice: 'A',
        Bob: 'B',
        Carol: 'C',
      },
      //*/
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
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom)
    roomHelpers.player.timerLength = 90
    console.log('setting up', roomHelpers)
    return Object.assign(roomHelpers, { user })
  },
  computed: {},
  methods: {
    submitClue() {
      updateRoom(this.room, {
        'round.clue': this.player.clue,
        state: 'VOTING',
      })
    },
    submitVote(quadrant) {
      const update = {
        ['round.votes.' + this.player.name]: quadrant,
      }
      // Continue to end if everyone has voted
      if (
        Object.keys(this.room.round.votes).length === this.room.players.length
      ) {
        update['state'] = 'DONE'
      }

      updateRoom(this.room, update)
    },
    nextRound() {
      // Alternate between changing out the xAxis and yAxis
      const nextAxis = this.room.history.length % 2 === 0 ? 'xAxis' : 'yAxis'

      this.room.state = 'CLUING'
      this.room.history.push(this.room.round)
      this.room.round = {
        cluer: nextGuesser(this.room.round.cluer, this.room.players),
        [nextAxis]: pickRandom(axisCards), // TODO pick from bag instead
      }

      this.saveRoom('state', 'history', 'round')
    },
  },
}
</script>
