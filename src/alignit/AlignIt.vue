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

    <h2 class="subtitle">Players</h2>
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

    <!-- 2 x 2 Table with labeled axis -->
    <div v-if="room.state !== 'START'" class="pt-4">
      <table>
        <tr>
          <td></td>
          <td colspan="2">
            <div class="y-axis">{{ room.round.yAxis?.[0] }}</div>
          </td>
          <td></td>
        </tr>
        <tr>
          <td rowspan="2">
            <div class="x-axis">{{ room.round.xAxis?.[0] }}</div>
          </td>
          <td
            class="square"
            :class="{ colored: colored('A') }"
            @click="submitVote('A')"
          >
            <img src="/images/illustrations/AlignItGradient.png" />
            <p class="quad-voters">{{ quadVoters('A') }}</p>
          </td>
          <td
            class="square"
            :class="{ colored: colored('B') }"
            @click="submitVote('B')"
          >
            <img src="/images/illustrations/AlignItGradient.png" />
            <p class="quad-voters">{{ quadVoters('B') }}</p>
          </td>
          <td rowspan="2">
            <div class="x-axis end">{{ room.round.xAxis?.[1] }}</div>
          </td>
        </tr>
        <tr>
          <td
            class="square"
            :class="{ colored: colored('C') }"
            @click="submitVote('C')"
          >
            <img src="/images/illustrations/AlignItGradient.png" />
            <p class="quad-voters">{{ quadVoters('C') }}</p>
          </td>
          <td
            class="square"
            :class="{ colored: colored('D') }"
            @click="submitVote('D')"
          >
            <img src="/images/illustrations/AlignItGradient.png" />
            <p class="quad-voters">{{ quadVoters('D') }}</p>
          </td>
        </tr>
        <tr>
          <td></td>
          <td colspan="2">
            <div class="y-axis">{{ room.round.yAxis?.[1] }}</div>
          </td>
          <td></td>
        </tr>
      </table>
    </div>

    <div class="card p-4 mt-4">
      <div v-if="room.state === 'START'">
        <div v-if="room.players.length < 3">
          <p>Waiting for 3 players...</p>
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
        <div v-if="room.round.cluer === player.name">
          Waiting for everyone to pick quadrants for "{{ room.round.clue }}"...
        </div>
        <div v-else>
          Pick the quadrant for "{{ room.round.clue }}"!<br /><br />

          (Is this clue irrelevant? If so,
          <a href="#" @click="startChallenge"> challenge it.</a>)
        </div>
      </div>

      <div v-else-if="room.state === 'CHALLENGE'">
        "{{ room.round.clue }}" has been challenged as irrelevant!<br /><br />
        <div v-if="room.round.cluer === player.name">
          Waiting for everyone to vote...
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
        <button class="button is-primary mt-2" @click="nextRound">
          Next Round
        </button>
      </div>
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
.subtitle {
  margin-bottom: 0.25rem;
}

.square {
  width: 230px;
  height: 200px;
  text-align: center;
  padding: 0;
  line-height: 0;

  filter: grayscale(100%);
}

.square.colored {
  filter: grayscale(0%);
}

.square:hover {
  cursor: pointer;
  filter: grayscale(0%);
}

.y-axis {
  font-size: 2rem;
  text-align: center;
}

.x-axis {
  font-size: 2rem;
  text-align: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 14em;
}

.end {
  transform: rotate(0deg);
}

.quad-voters {
  line-height: normal;
  position: absolute;
  left: 0;
  right: 0;
  top: 45%;
  padding: 0 1rem;
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
    state: 'START', // "CLUING", "VOTING", "CHALLENGE", "DONE"
    winningScore: 10,
    people: {},
    round: {
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
  },
  methods: {
    tallyPoints,
    submitClue() {
      updateRoom(this.room, {
        'round.clue': this.player.clue,
        state: 'VOTING',
      })
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

      this.room.state = 'CLUING'
      this.room.round = {
        cluer: nextGuesser(this.room.round.cluer, this.room.players),
        xAxis: this.room.round.xAxis,
        yAxis: this.room.round.yAxis,
        votes: {},
        [nextAxis]: pickRandom(axisCards), // TODO pick from bag instead
      }

      this.saveRoom('state', 'round')
    },
    colored(quadrant) {
      // While CLUING, all quadrants are grayscale.
      // While VOTING, only the quadrant that the player voted for is colored.
      // While DONE, all voted quadrants are colored.
      switch (this.room.state) {
        case 'CLUING':
          return false
        case 'VOTING':
          return this.room.round.votes[this.player.name] === quadrant
        case 'DONE':
          return Object.values(this.room.round.votes).includes(quadrant)
      }
    },
    quadVoters(quadrant) {
      if (this.room.state === 'DONE') {
        return Object.entries(this.room.round.votes)
          .filter(([voter, vote]) => vote === quadrant)
          .map(([voter, vote]) => voter)
          .sort()
          .join(', ')
      }
      return ''
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