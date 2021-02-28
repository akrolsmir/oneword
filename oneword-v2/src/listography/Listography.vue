<!-- Rules: https://geekmom.com/2019/11/listography/ -->
<!-- Buy: https://www.amazon.com/Listography-Game-May-Best-List/dp/1452151776 -->

<template>
  <div id="top-content">
    <div class="narrow card">
      <div class="type">Scores</div>
      <div style="width: 100%; text-align: center; font-style: italic">
        {{ room.winningScore }} points to win
      </div>
      <br />
      <div v-for="player in room.players">
        {{ player }}: {{ playerScores[player] }}
      </div>
    </div>
    <div class="narrow card round">
      <div v-if="room.state !== 'START'">
        <div class="type">
          {{ cardType.longName }}
          <div class="info">
            Write up to <strong>{{ cardType.listSize }}</strong> answers.
          </div>
          <div class="info">{{ cardType.explanation }}</div>
        </div>
      </div>

      <div v-if="room.state === 'START'"></div>
      <div class="category" v-else-if="room.state === 'PREVIEW'">???</div>
      <div class="category" v-else>
        {{ room.round.card.category }}
      </div>

      <button
        class="button"
        @click="nextRound"
        v-if="room.state === 'START' || room.state === 'CHECKING'"
      >
        Draw Card
      </button>
      <button
        class="button"
        @click="startTimer"
        v-else-if="room.state === 'PREVIEW'"
      >
        Show Card & Start Timer
      </button>
      <div v-else style="height: 40px"></div>
    </div>
  </div>

  <div class="centerer">
    <div style="height: 16px" v-if="room.state === 'PREVIEW'"></div>
    <Timer
      class="timer"
      ref="timer"
      :length="room.timerLength"
      :on-finish="nextStage"
      v-if="room.state === 'LISTING'"
      :key="room.round.state"
    ></Timer>

    <div
      class="list card"
      v-if="room.state === 'LISTING' || room.state === 'PREVIEW'"
    >
      <strong style="font-size: 1.5em">Your Responses</strong>
      <div class="item" v-for="index in cardType.listSize" :key="index">
        <div class="index">{{ index }}</div>
        <textarea
          class="textarea mb-2"
          :disabled="room.state === 'PREVIEW'"
          v-model="player.entries[index - 1]"
          @input="debouncedSubmitEntries"
          @keydown.enter.prevent="focusNextTextArea($event)"
        ></textarea>
      </div>
    </div>

    <div id="history">
      <div v-for="round in room.history" class="card summary">
        <div>
          Round {{ round.number + 1 }}: {{ round.card.category }} ({{
            CARD_TYPES[round.card.type].longName
          }})
        </div>
        <div class="player" v-for="(entries, name) in round.entries">
          {{ name }}
          scored <strong>{{ roundScores[round.number][name] }}</strong
          >:&ensp;
          <span v-for="index in entries.length">
            <span v-if="entries[index - 1]">
              <span
                :class="{
                  invalid:
                    room.invalidEntries[
                      round.card.category + entries[index - 1]
                    ],
                }"
              >
                <span
                  :class="{
                    fail: !entryScore(
                      collisions[round.number][name][index - 1],
                      round
                    ),
                  }"
                >
                  {{ entries[index - 1] }}
                </span>
                ({{ collisions[round.number][name][index - 1] }})
              </span>
              <span
                class="trash"
                @click="toggleInvalid(round.card.category, entries[index - 1])"
                >🗑️</span
              >
              &ensp;
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Mod tools -->
    <div class="subtitle">Mod Tools</div>
    <div class="columns">
      <div class="column">
        <button class="button" @click="resetRoom">Reset room</button>
      </div>
      <div class="column">
        <button class="button" @click="nextStage">Next stage</button>
      </div>
      <div class="column">
        <input class="input" size="5" v-model="room.timerLength" />
        seconds <br />
        <button class="button" @click="setTimer">Set timers</button>
      </div>
    </div>
  </div>
</template>

<style>
#top-content {
  margin-top: 48px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.centerer {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.centerer > * {
  margin-bottom: 24px;
}
.narrow.card {
  width: 250px;
  min-height: 350px;
  margin: 0 24px;
}
.round.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}
.card {
  padding: 24px;
}

.type,
.category {
  width: 100%;
  text-align: center;
  overflow-y: hidden;
}
.type {
  font-size: 1.5em;
  height: 100px;
  margin-bottom: -64px;
}

.type > .info {
  font-style: italic;
  font-size: 0.6em;
}
.type > img {
  width: 24px;
  height: 24px;
}
.category {
  font-size: 1.8em;
}

.timer {
  max-width: 548px;
  margin-bottom: 0;
}

.list {
  width: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.item {
  display: flex;
  align-items: center;
}
.item .index {
  min-width: 24px;
}
.card .item textarea {
  min-height: 3em;
  min-width: auto;
  margin: 2px 0 !important;
}
.list .button {
  margin-top: 12px;
}

#history {
  display: flex;
  flex-direction: column-reverse;
}
.summary {
  width: 548px;
  max-width: 100%;
  margin-bottom: 24px;
}
.fail {
  text-decoration: line-through;
}
.invalid {
  opacity: 0.3;
  text-decoration: line-through;
}
.trash {
  cursor: pointer;
}
</style>

<script>
import { inject } from 'vue'
import Timer from '../components/Timer.vue'
import { getRoom, listenRoom } from '../firebase/network.js'
import { categories } from './cards.js'
import { useRoom } from '../composables/useRoom.js'
import {
  debounce,
  listIncludes,
  pickRandom,
  randomWord,
  sanitize,
} from '../utils'

function newRoom(name) {
  return {
    name,
    state: 'START', // "START", "PREVIEW", "LISTING", CHECKING", "END"
    winningScore: 30,
    people: {},
    round: {
      /** Example:
      number: 0,
      card: {
        type: '3FOLD',
        category: 'Types of tree',
      },
      entries: {
        adrian: ['spruce', 'pine', 'elm'],
        austin: ['birch', 'spruce', 'maple'],
      },
      collisions: {
        adrian: [0, 0, 0],
        austin: [0, 0, 0],
      },
      */
    },
    history: [],
    invalidEntries: {},
    timerLength: 60,
  }
}

const CARD_TYPES = {
  '3FOLD': {
    listSize: 3,
    longName: 'Threefold',
    explanation: 'Try to match as MANY players as possible.',
  },
  '1ON1': {
    listSize: 10,
    longName: 'One on One',
    explanation: 'Try to match ONLY 1 other player.',
  },
  FORGOTTEN4: {
    listSize: 4,
    longName: 'Forgotten Four',
    explanation: 'Try to match NO other players.',
  },
}

export default {
  components: {
    Timer,
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, newRoom)
    return Object.assign(roomHelpers, { user })
  },
  async created() {
    this.debouncedSubmitEntries = debounce(this.submitEntries, 300)

    // For dev velocity, accept https://oneword.games/room/rome?player=Spartacus
    if (this.$route.query.player && !this.user.id) {
      this.user.guest = true
      this.user.name = this.$route.query.player
    }

    this.room.name = this.$route.params.id
    const fetchedRoom = await getRoom(this.room)

    if (!fetchedRoom) {
      // 1. If the room doesn't exist, create it, then return
      this.player.name =
        this.user.displayName || `${randomWord('adjectives')}-anon`
      await this.resetRoom()
      listenRoom(this.room.name, this.loadFrom)
      return
    } else {
      // 2. Set this room's contents, and proceed to enter the room
      this.loadFrom(fetchedRoom)
      listenRoom(this.room.name, this.loadFrom)
    }

    // 3. If returning from Firebase sign in ('?authed=1'), skip the login modal
    if (this.$route.query.authed) {
      // Remove the 'authed=1' from the URL for cleanliness
      const query = { ...this.$route.query }
      delete query.authed
      this.$router.replace(query)

      // Then sign them in after the Firebase callback returns
      listenForLogin((_user) => this.enterRoom())
      return
    }

    // 4. Enter the room, prompting for login if needed
    this.enterRoom()
  },
  data() {
    return {
      CARD_TYPES,
    }
  },
  watch: {
    'room.state'(state) {
      // Reset past entries when the round moves forward.
      if (state === 'PREVIEW' || state === 'LISTING') {
        this.player.entries = new Array(this.cardType.listSize).fill('')
      }
    },
  },
  computed: {
    card() {
      return this.room.round.card
    },
    cardType() {
      return CARD_TYPES[this.card.type]
    },
    collisions() {
      let collisions = []

      for (let round of this.room.history) {
        collisions[round.number] = {}
        for (let name in round.entries) {
          collisions[round.number][name] = []

          for (let i = 0; i < round.entries[name].length; i++) {
            let entry = round.entries[name][i]
            if (!entry) continue
            let key = round.card.category + entry
            if (this.room.invalidEntries[key]) continue

            collisions[round.number][name][i] = 0
            for (let otherName in round.entries) {
              if (name === otherName) continue

              // TODO: Not sufficient, since invalidEntries is exact match
              if (listIncludes(round.entries[otherName], entry)) {
                collisions[round.number][name][i] += 1
              }
            }
          }
        }
      }
      return collisions
    },
    roundScores() {
      let roundScores = []
      for (let round of this.room.history) {
        roundScores[round.number] = {}
        for (let name in round.entries) {
          let score = 0
          for (let i = 0; i < round.entries[name].length; i++) {
            let entry = round.entries[name][i]
            if (!entry) continue
            let key = round.card.category + entry
            if (this.room.invalidEntries[key]) continue

            score += this.entryScore(
              this.collisions[round.number][name][i],
              round
            )
          }
          roundScores[round.number][name] = score
        }
      }
      return roundScores
    },
    playerScores() {
      let scores = {}
      for (let player of this.room.players) {
        scores[player] = this.roundScores.reduce(
          (total, scores) => total + (scores[player] || 0),
          0
        )
      }
      return scores
    },

    previousCategories() {
      return this.room.history.map((round) => round.card.category)
    },
  },
  methods: {
    debounce,
    nextStage() {
      this.room.state = 'CHECKING'
      this.room.history.push(this.room.round)
      this.saveRoom('state', 'history')
    },
    nextRound() {
      this.room.state = 'PREVIEW'

      this.room.round = {}
      const card = {
        type: pickRandom(Object.keys(CARD_TYPES)),
      }
      for (let i = 0; i < 1000; i++) {
        card.category = pickRandom(categories)
        if (!this.previousCategories.includes(card.category)) {
          break
        }
      }
      this.room.round.card = card
      this.room.round.entries = {}
      this.room.round.number = this.room.history.length
      for (let player of this.room.players) {
        this.room.round.entries[player] = []
      }
      this.saveRoom('state', 'round')
    },
    startTimer() {
      this.room.state = 'LISTING'
      this.saveRoom('state')
    },
    setTimer() {
      this.saveRoom('timerLength')
    },
    submitEntries() {
      this.room.round.entries[this.player.name] = this.player.entries
      this.saveRoom(`round.entries.${this.player.name}`)
    },
    focusNextTextArea(event) {
      let next = event.target.parentNode.nextSibling.childNodes[1]
      if (!next) {
        next = event.target.parentNode.parentNode.querySelector('textarea')
      }
      next.focus()
    },
    endGame() {
      // TODO Turn into a computed check, with appropriate game end UI
      this.room.state = 'END'
    },

    toggleInvalid(category, entry) {
      const key = sanitize(category + entry) // Sanitize for Firestore
      this.room.invalidEntries[key] = !this.room.invalidEntries[key]
      this.saveRoom(`invalidEntries.${key}`)
    },

    // TODO cleanup: place inside CARD_TYPES array
    entryScore(collisionCount, round) {
      switch (round.card.type) {
        case '3FOLD':
          return collisionCount
        case '1ON1':
          return collisionCount === 1 ? 1 : 0
        case 'FORGOTTEN4':
          return collisionCount === 0 ? 1 : 0
        default:
          return 0
      }
    },
  },
}
</script>
