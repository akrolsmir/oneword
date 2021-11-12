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

    <h2>Players</h2>
    <!-- Players -->
    <div class="field is-grouped is-grouped-multiline">
      <Nametag
        v-for="[tagged, score] in playerScores"
        :key="tagged"
        class="p-1"
        :name="tagged"
        :score="score"
        :user="room.people[tagged]"
        :self="tagged === player.name"
        :modtag="room.people && room.people[tagged]?.state === 'MOD'"
        :mod="player.isMod"
        @kick="kickPlayer(tagged)"
      />
    </div>
    <div v-if="computedNoMod">
      <button class="button is-ghost p-0" @click.prevent="makeMod(player.name)">
        Become the mod
      </button>
    </div>

    <!-- 2 x 2 Table with labeled axis -->
    <div v-if="room.state !== 'START'" class="pt-4">
      <AlignItQuads
        :round="room.round"
        :state="room.state"
        :playerName="player.name"
        :submitVote="submitVote"
        :index="room.history.length + (room.state === 'DONE' ? 0 : 1)"
      />
    </div>

    <!-- Instructions for the players -->
    <div class="card p-4 mt-4" role="alert">
      <div v-if="room.state === 'START'">
        <div v-if="room.players.length < 4">
          <p>Waiting for 4 players...</p>
          <ShareLink />
        </div>
        <div v-else>
          <button class="button is-primary" @click="nextRound">
            Start game!
          </button>
        </div>
      </div>

      <div v-else-if="room.state === 'CLUING'">
        <div v-if="room.round.cluer === player.name">
          <p>Give a clue for this alignment chart!</p>
          <p>(Try to cover as many quadrants as possible)</p>
          <input
            type="text"
            class="input"
            v-model="player.clue"
            @keyup.enter="submitClue"
          />
          <button class="button is-primary" @click="submitClue">
            Submit Clue
          </button>
        </div>
        <div v-else>Waiting for {{ room.round.cluer }} to give a clue...</div>
      </div>

      <div v-else-if="room.state === 'VOTING'">
        <div v-if="room.round.cluer === player.name">
          Waiting for everyone to pick quadrants for "{{ room.round.clue }}"...
        </div>
        <div v-else>
          <p>Pick the quadrant for "{{ room.round.clue }}"!</p>
          <br /><br />

          (Is this clue irrelevant? If so,
          <a href="#" @click="startChallenge"> challenge it.</a>)
        </div>
      </div>

      <div v-else-if="room.state === 'CHALLENGE'">
        "{{ room.round.clue }}" has been challenged as irrelevant!<br /><br />
        <div v-if="room.round.cluer === player.name">
          Waiting for everyone to vote on this challenge...
        </div>
        <div v-else>
          Is "{{ room.round.clue }}" relevant to this alignment chart?<br />
          <button
            class="button"
            :class="{
              'is-primary': room.round.challenge[player.name] === 'YES',
            }"
            @click="submitChallengeVote('YES')"
          >
            Yes
          </button>
          or
          <button
            class="button"
            :class="{
              'is-danger': room.round.challenge[player.name] === 'NO',
            }"
            @click="submitChallengeVote('NO')"
          >
            No</button
          ><br />
          (If half or more players vote 'No', {{ room.round.cluer }} will need
          to pick a new clue.)
        </div>
      </div>

      <div v-else-if="room.state === 'DONE'">
        <p>
          The votes are in for "{{ room.round.clue }}".<br />
          {{ room.round.cluer }} gets
          {{ tallyPoints(room.round.votes) }} points!
        </p>
        <div v-if="shouldEndGame">
          <br />
          <h2 class="subtitle">Good game! Final scores:</h2>
          <p v-for="[name, score] in playerScores">{{ name }}: {{ score }}</p>
        </div>
        <button v-else class="button is-primary mt-2" @click="nextRound">
          Next Round
        </button>
      </div>
    </div>

    <!-- History -->
    <AlignItHistory :history="room.history" />

    <!-- Mod tools -->
    <!-- Copied from Incrypt -->
    <div v-if="player.isMod" class="notification mx-3 mt-4 mb-6">
      <h2>Mod tools</h2>
      <div class="columns">
        <div class="column">
          (Danger: this may mess up your game score!)<br /><br />
          <button class="button is-small is-danger" @click="nextRound">
            Skip round
          </button>
          <button
            v-if="player.isDev"
            class="button is-small is-danger"
            @click="resetRoom"
          >
            Reset game
          </button>
        </div>
      </div>
    </div>
  </BigColumn>
</template>

<style scoped>
@import url('https://use.typekit.net/aph6szs.css');

.background {
  background-color: #eeeeee;
}

@font-face {
  font-family: 'Grand Slang';
  src: url('/fonts/GrandSlang-Roman.woff2') format('woff2');
}

div {
  font-family: neue-haas-grotesk-text, sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 1rem;
}

h2 {
  font-size: 1.5rem;
  font-family: neue-haas-grotesk-text, sans-serif !important;
  font-weight: 400;
  font-style: normal;
  margin-bottom: 0.5rem;
}

.subtitle {
  margin-bottom: 0.25rem;
  font-family: 'Grand Slang';
}
</style>

<script>
import { inject } from 'vue'
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
import Timer from '../components/Timer.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import AlignItHistory from './AlignItHistory.vue'
import AlignItQuads from './AlignItQuads.vue'
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
    state: 'START', // "CLUING", "VOTING", "CHALLENGE", "DONE"
    winningScore: 10,
    people: {},
    round: {
      // Axis might collide, but nextRound() will fix this.
      xAxis: pickRandom(axisCards),
      yAxis: pickRandom(axisCards),

      /** Example:
      xAxis: ['Good', 'Evil'],
      yAxis: ['New', 'Old'],

      Grid structure should look like:
           Good  Evil
      New  A     B
      Old  C     D

      cluer: 'Austin',
      clue: 'Twitter',

      votes: {
        Alice: 'A',
        Bob: 'B',
        Carol: 'C',
      },

      challenge: {
        Alice: 'YES',
        Bob: 'NO',
        Carol: 'NO',
      }
      */
    },
    history: [],
    invalidEntries: {},
    timerLength: 90,
    public: true,
    lastUpdateTime: Date.now(),
  }
}

function onJoin(room, player) {
  if (noMod(room)) {
    room.people[player.name].state = 'MOD'
  }
}

// TODO: Move this logic into useRoom?
function noMod(room) {
  return !Object.values(room.people || {}).some(
    (person) => person.state === 'MOD'
  )
}

export default {
  components: {
    BigColumn,
    Chatbox,
    Timer,
    Nametag,
    ShareLink,
    AlignItQuads,
    AlignItHistory,
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom, onJoin)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  computed: {
    voters() {
      return this.room.players.filter((p) => p !== this.room.round.cluer)
    },
    // Returns a sorted list eg [['Victor', 10], ['Hugo', 6]...]
    playerScores() {
      // Initialize scores to 0 for all players
      let scores = {}
      for (const player of this.room.players) {
        scores[player] = 0
      }

      // For each round in history, tally up the points for that player
      for (const round of this.room.history) {
        if (this.room.players.includes(round.cluer)) {
          scores[round.cluer] += tallyPoints(round.votes)
        }
      }
      return Object.entries(scores).sort(
        ([p1, s1], [p2, s2]) => s2 - s1 || p1 < p2
      )
    },
    shouldEndGame() {
      // End the game if somebody has hit 10 points and we're at the end of a cycle
      const tenPointsReached = this.playerScores.some(
        ([player, points]) => points >= 10
      )
      if (!tenPointsReached) {
        return false
      }
      // This is the end of a cycle if the next player going would get more turns
      // than anybody else total
      const playerTurns = {}
      for (const round of this.room.history) {
        playerTurns[round.cluer] = (playerTurns[round.cluer] || 0) + 1
      }
      const maxTurns = Math.max(...Object.values(playerTurns))
      const nextCluer = nextGuesser(this.room.round.cluer, this.room.players)
      return playerTurns[nextCluer] === maxTurns
    },
    computedNoMod() {
      return noMod(this.room)
    },
  },
  methods: {
    tallyPoints,
    submitClue() {
      updateRoom(this.room, {
        'round.clue': this.player.clue,
        state: 'VOTING',
      })
      this.player.clue = ''
    },
    submitVote(quadrant) {
      // Votes may only be submited by voters during 'VOTING'
      if (
        this.room.state !== 'VOTING' ||
        !this.voters.includes(this.player.name)
      ) {
        return
      }

      this.room.round.votes[this.player.name] = quadrant
      const toSave = ['round.votes.' + this.player.name]
      // Continue to end if everyone has voted
      if (Object.keys(this.room.round.votes).length === this.voters.length) {
        this.room.state = 'DONE'
        this.room.history.push(this.room.round)
        toSave.push('state', 'history')
      }

      this.saveRoom(...toSave)
    },
    nextRound() {
      // Alternate between changing out the xAxis and yAxis
      const nextAxis = this.room.history.length % 2 === 0 ? 'xAxis' : 'yAxis'
      const currentAxes = [this.room.round.xAxis, this.room.round.yAxis]

      this.room.state = 'CLUING'
      this.room.round = {
        cluer: nextGuesser(this.room.round.cluer, this.room.players),
        xAxis: this.room.round.xAxis,
        yAxis: this.room.round.yAxis,
        votes: {},
        [nextAxis]: pickFromBag(axisCards, currentAxes),
      }

      this.saveRoom('state', 'round')
    },
    startChallenge() {
      updateRoom(this.room, {
        state: 'CHALLENGE',
        [`round.challenge.${this.player.name}`]: 'NO',
      })
    },
    submitChallengeVote(vote) {
      this.room.round.challenge[this.player.name] = vote
      let toSave = ['round.challenge.' + this.player.name]
      // Resolve challenge when everyone has voted
      if (Object.keys(this.room.round.challenge).length >= this.voters.length) {
        const challenges = Object.values(this.room.round.challenge).filter(
          (c) => c === 'NO'
        ).length
        if (challenges >= this.voters.length / 2) {
          // Challenge succeeded; reset the clue and votes
          this.room.state = 'CLUING'
          this.room.round.challenge = {}
          this.room.round.clue = ''
          this.room.round.votes = {}
          toSave = ['state', 'round']
        } else {
          this.room.state = 'VOTING'
          this.room.round.challenge = {}
          toSave = ['state', 'round.challenge']
        }
      }

      this.saveRoom(...toSave)
    },
  },
}

function tallyPoints(votes) {
  // Return the number of unique values in votes, by converting to a set
  return new Set(Object.values(votes || {})).size
}
</script>
