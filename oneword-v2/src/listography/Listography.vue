<!-- Rules: https://geekmom.com/2019/11/listography/ -->
<!-- Buy: https://www.amazon.com/Listography-Game-May-Best-List/dp/1452151776 -->

<template>
  <div id="top-content">
    <div class="narrow card">
      <div class="type">Scores</div>
      <div style="width: 100%; text-align: center">
        ({{ room.winningScore }} points to win)
      </div>
      <br />
      <div v-for="player in room.players">
        {{ player.name }}: {{ playerScores[player.name] }}
      </div>
    </div>
    <div class="narrow card round">
      <div
        @mouseover="infoHover = true"
        @mouseout="infoHover = false"
        :class="{ expanded: infoHover }"
        v-if="room.state !== 'START'"
      >
        <div class="type">
          {{ longName[card.type] }} <img src="./info.png" />
          <div class="info">
            Write up to <strong>{{ listSize[card.type] }}</strong> answers.
          </div>
          <div class="info">{{ explanation[card.type] }}</div>
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
      :length="6"
      :on-finish="nextStage"
      v-if="room.state === 'LISTING'"
      :key="room.round.state"
    ></Timer>

    <div
      class="list card"
      v-if="room.state === 'LISTING' || room.state === 'PREVIEW'"
    >
      <strong style="font-size: 1.5em">Your Responses</strong>
      <div class="item" v-for="index in listSize[card.type]" :key="index">
        <div class="index">{{ index }}</div>
        <textarea
          class="textarea mb-2"
          :disabled="room.state === 'PREVIEW'"
          v-model="room.round.entries[player.name][index - 1]"
          @keydown.enter.prevent="focusNextTextArea($event)"
        ></textarea>
      </div>
    </div>

    <div id="history">
      <div v-for="round in room.history" class="card summary">
        <div>
          Round {{ round.number + 1 }}: {{ round.card.category }} ({{
            longName[round.card.type]
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
  height: 36px;
  transition: height 150ms, margin 150ms;
}
.expanded .type {
  height: 100px;
  margin-bottom: -64px;
}
.type > .info {
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
import Timer from '../components/Timer.vue'
import { listenRoom, setRoom } from "../firebase/network.js"
import { categories } from "./cards.js"

export default {
  components: {
    // Nametag,
    Timer,
    // GameEnd,
  },
  data() {
    return {
      infoHover: false,
      room: {
        name: 'test-room',
        state: 'START', // "START", "PREVIEW", "LISTING", CHECKING", "END"
        winningScore: 30,
        players: [
          {
            name: 'adrian',
            score: 0,
          },
          {
            name: 'austin',
            score: 0,
          },
        ],
        round: {
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
        },
        history: [],
        invalidEntries: {},
      },
      player: {
        name: 'adrian',
      },
    }
  },
  watch: {
    playerScores() {
      for (let player of this.room.players) {
        if (this.playerScores[player.name] >= this.room.winningScore) {
          this.endGame()
          break
        }
      }
    },
  },
  computed: {
    listSize() {
      return {
        '3FOLD': 3,
        '1ON1': 10,
        FORGOTTEN4: 4,
      }
    },
    longName() {
      return {
        '3FOLD': 'Threefold',
        '1ON1': 'One on One',
        FORGOTTEN4: 'Forgotten Four',
      }
    },
    explanation() {
      return {
        '3FOLD': 'Try to match as MANY players as possible.',
        '1ON1': 'Try to match ONLY 1 other player.',
        FORGOTTEN4: 'Try to match NO other players.',
      }
    },
    card() {
      return this.room.round.card
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

              if (round.entries[otherName].includes(entry)) {
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
        scores[player.name] = this.roundScores.reduce(
          (total, scores) => total + scores[player.name],
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
    async resetRoom() {
      this.room.state = 'LISTING'
      await setRoom(this.room)
    },
    nextStage() {
      this.room.state = 'CHECKING'
      this.room.history.push(this.room.round)
    },
    nextRound() {
      this.room.state = 'PREVIEW'

      this.room.round = {};
      let card = {};
      card.type = ["1ON1", "3FOLD", "FORGOTTEN4"][Math.floor(Math.random() * 3)];
      for (let i = 0; i < 1000; i++) {
        card.category = categories[Math.floor(Math.random() * categories.length)];
        if (!this.previousCategories.includes(card.category)) {
          break;
        }
      }
      this.room.round.card = card;
      this.room.round.entries = {};
      this.room.round.number = this.room.history.length;
      for (let player of this.room.players) {
        this.room.round.entries[player.name] = []
      }
    },
    startTimer() {
      this.room.state = 'LISTING'
    },
    focusNextTextArea(event) {
      let next = event.target.parentNode.nextSibling.childNodes[1]
      if (!next) {
        next = event.target.parentNode.parentNode.querySelector('textarea')
      }
      next.focus()
    },
    endGame() {
      this.room.state = 'END'
      console.log('game over')
      // TODO
    },

    toggleInvalid(category, entry) {
      let key = category + entry
      this.room.invalidEntries[key] = !this.room.invalidEntries[key]
    },

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
  async created() {
    // listenRoom("test-room", room => { this.room = room});
  },
}
</script>
