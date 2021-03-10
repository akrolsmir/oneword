<!-- Rules: https://geekmom.com/2019/11/listography/ -->
<!-- Buy: https://www.amazon.com/Listography-Game-May-Best-List/dp/1452151776 -->

<template>
  <BigColumn :showPanes="true">
    <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template>

    <div class="columns">
      <div class="column narrow card bg">
        <div class="type">Scores</div>
        <div style="width: 100%; text-align: center; font-style: italic">
          {{ room.winningScore }} points to win
        </div>
        <br />
        <div v-for="[tagged, score] in playerScores" :key="tagged">
          <Nametag
            class="p-1"
            :name="tagged"
            :key="tagged"
            :score="score"
            :user="room.people[tagged]"
            :self="tagged === player.name"
            :modtag="room.people && room.people[tagged]?.state === 'MOD'"
            :mod="player.isMod"
            @kick="kickPlayer(tagged)"
          />
        </div>
      </div>
      <div class="column narrow card bg round">
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
        <div class="category fancy" v-else>
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

    <!-- Dummy div to prevent layout from shifting when Timer appears -->
    <div style="height: 24px" v-if="room.state === 'PREVIEW'"></div>
    <Timer
      style="margin: 0 auto"
      class="timer mb-2"
      ref="timer"
      :length="room.timerLength"
      :on-finish="nextStage"
      v-if="room.state === 'LISTING' && room.timerLength > 0"
      :key="room.round.state"
    ></Timer>

    <div
      class="list card"
      v-if="room.state === 'LISTING' || room.state === 'PREVIEW'"
    >
      <div class="type"><strong>Your Responses</strong></div>
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

    <!-- Mod tools -->
    <!-- Copied from Incrypt -->
    <div class="notification mx-3 mt-4 mb-6" v-if="player.isMod">
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

    <div id="history" class="mt-6">
      <!-- PERF: paginate through history for better list render performance -->
      <div v-for="round in room.history" :key="round.number" class="bg summary">
        <div class="fancy normal mb-2" style="font-weight: 500">
          {{ round.number + 1 }}. {{ round.card.category }} ({{
            CARD_TYPES[round.card.type].longName
          }})
        </div>
        <div
          class="player mb-4 ml-5"
          v-for="[entries, name] in orderedEntries(round.entries)"
          :key="name"
        >
          <span class="has-text-weight-semibold"
            >{{ name }} scored {{ roundScores[round.number][name] }}:</span
          >&ensp;
          <!-- TODO: enable Vue Tippy after https://github.com/KABBOUCHI/vue-tippy/issues/166 resolved -->
          <!-- v-tippy="{ content: collisions[round.number][name][i]?.join(', ') }" -->
          <span v-for="(entry, i) in entries" :key="entry">
            <span v-if="entry">
              <a
                @click="toggleInvalid(round.card.category, entry)"
                aria-label="invalidate"
              >
                <span
                  class="has-text-danger-dark"
                  v-if="
                    !entryScore(
                      collisions[round.number][name][i]?.length,
                      round
                    )
                  "
                  >×
                </span>
                <span v-else class="has-text-success-dark">✓ </span>
              </a>
              <!-- PERF: Inline calculations are expensive --
                eg they invoke checkInvalid on each keystroke -->
              <span
                :class="{ invalid: checkInvalid(round.card.category, entry) }"
              >
                <span
                  :class="{
                    fail: !entryScore(
                      collisions[round.number][name][i]?.length,
                      round
                    ),
                  }"
                >
                  {{ entry }}
                </span>
                <span v-if="collisions[round.number][name][i]">
                  ({{ collisions[round.number][name][i].length }})
                </span>
              </span>
              &ensp;
            </span>
          </span>
        </div>
      </div>
    </div>
  </BigColumn>
</template>

<style scoped>
.background {
  background-color: #e0e7ff;
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
.card.bg {
  background-color: #f5f5f5;
}

.type,
.category {
  width: 100%;
  text-align: center;
  overflow-y: hidden;
  overflow-wrap: break-word;
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
  margin: 0 auto;
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
.fail {
  text-decoration: line-through;
}
.invalid {
  opacity: 0.3;
  text-decoration: line-through;
}
.summary {
  padding: 1rem;
  margin-bottom: 24px;
  /* Needed for Tippy, apparently...? */
  position: relative;
}
</style>

<script>
import { inject } from 'vue'
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
import Timer from '../components/Timer.vue'
import Nametag from '../components/Nametag.vue'
import { narrowCards, allCards } from './cards.js'
import { useRoom } from '../composables/useRoom.js'
import {
  debounce,
  listIncludes,
  pickRandom,
  sanitize,
  orderedEntries,
  pickFromBag,
} from '../utils'

function makeNewRoom(name) {
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
        austin: ['birch', 'spruce', 'MAPLEstory'],
      },
      */
    },
    history: [],
    invalidEntries: {},
    timerLength: 90,
    public: true,
    lastUpdateTime: Date.now(),
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
    BigColumn,
    Chatbox,
    Timer,
    Nametag,
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  created() {
    this.debouncedSubmitEntries = debounce(this.submitEntries, 300)
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
    // Returns a list of collisions in each round, eg
    // [{ adrian: [[], ['austin'], []], austin: [['adrian'], [], []] } ...]
    collisions() {
      let collisions = []

      for (let round of this.room.history) {
        collisions[round.number] = {}
        for (let name in round.entries) {
          collisions[round.number][name] = []

          for (let i = 0; i < round.entries[name].length; i++) {
            let entry = round.entries[name][i]
            if (!entry) continue
            if (this.checkInvalid(round.card.category, entry)) continue

            collisions[round.number][name][i] = []
            for (let otherName in round.entries) {
              if (name === otherName) continue

              // 10 rounds of 10 players with 10 entries each =
              // 100 checks per pair, 100 pairs, 10 times = 100k calls to wordsMatch
              // For only 1k words! ideas:
              // - Make wordsMatch cheaper
              //   - cache singular and plural forms (done!)
              //   - use a different stemming algorithm? Faster + broad, but less accurate...
              // - Restructure code so only affected round gets recalculated...?
              if (listIncludes(round.entries[otherName], entry)) {
                collisions[round.number][name][i].push(otherName)
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
            if (this.checkInvalid(round.card.category, entry)) continue

            score += this.entryScore(
              this.collisions[round.number][name][i].length,
              round
            )
          }
          roundScores[round.number][name] = score
        }
      }
      return roundScores
    },
    // Returns a sorted list eg [['Victor', 10], ['Hugo', 6]...]
    playerScores() {
      let scores = {}
      for (let player of this.room.players) {
        scores[player] = this.roundScores.reduce(
          (total, scores) => total + (scores[player] || 0),
          0
        )
      }
      return Object.entries(scores).sort(
        ([p1, s1], [p2, s2]) => s2 - s1 || p1 < p2
      )
    },

    previousCategories() {
      return this.room.history.map((round) => round.card.category)
    },

    // Cache this list, since recalulating a lot becomes expensive
    invalidList() {
      return Object.entries(this.room.invalidEntries)
        .filter(([k, v]) => v)
        .map(([k, v]) => k)
    },
  },
  methods: {
    orderedEntries,
    debounce,
    sanitize,
    nextStage() {
      this.room.state = 'CHECKING'
      this.room.history.push(this.room.round)
      this.saveRoom('state', 'history')
    },
    nextRound() {
      this.room.state = 'PREVIEW'

      this.room.round = {}
      const pastTypes = this.room.history.map((round) => round.card.type)
      const card = {
        type: pickFromBag(Object.keys(CARD_TYPES), pastTypes),
      }
      for (let i = 0; i < 1000; i++) {
        const cardList = card.type === 'FORGOTTEN4' ? narrowCards : allCards
        card.category = pickRandom(cardList)
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
    updateTimer() {
      this.room.timerLength = this.player.timerLength
      this.saveRoom('timerLength')
    },
    submitEntries() {
      this.room.round.entries[this.player.name] = this.player.entries.slice()
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
    checkInvalid(category, entry) {
      // TODO: Possibly cache in-memory to skip listIncludes?
      // A map of (category, entry) => listIncludes result
      // Can be computed, aka recalculated when invalidList changes
      const key = sanitize(category + entry)
      return listIncludes(this.invalidList, key)
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
