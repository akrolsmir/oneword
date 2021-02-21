<!-- Rules: https://geekmom.com/2019/11/listography/ -->
<!-- Buy: https://www.amazon.com/Listography-Game-May-Best-List/dp/1452151776 -->



<template>

  <div id="top-content">
    <div class="narrow card">
      <div class="type"> Scores</div>
      <div style="width: 100%; text-align: center;">({{room.winningScore}} points to win)</div>
      <br>
      <div v-for="player in room.players">
        {{player.name}}: {{player.score}}
      </div>
    </div>
    <div class="narrow card round">
      <div @mouseover="infoHover = true" 
           @mouseout="infoHover = false" 
           :class="{expanded: infoHover}"
           v-if="room.state !== 'START'">
        <div class="type" v-if="card.type === '3FOLD'">
          Threefold <img src="./info.png">
          <div class="info">Write up to <strong>3</strong> answers.</div>
          <div class="info">Try to match as <strong>MANY</strong> players as possible.</div>
        </div>
        <div class="type" v-if="card.type === '1ON1'">
          One-on-One <img src="./info.png">
          <div class="info"> Write up to <strong>10</strong> answers.</div>
          <div class="info">Try to match as <strong>ONLY 1</strong> other player. </div>
        </div>
        <div class="type" v-if="card.type === 'FORGOTTEN4'">
          Forgotten Four <img src="./info.png">
          <div class="info">Write up to <strong>4</strong> answers.</div>
          <div class="info">Try to match <strong>NO</strong> other players.</div>
        </div>
      </div>

      <div v-if="room.state === 'START'"></div>
      <div class="category" v-else-if="room.state === 'PREVIEW'">
        ???
      </div>
      <div class="category" v-else>
        {{room.round.card.category}}
      </div>

      <button class="button" @click="nextRound" v-if="room.state === 'START' || room.state === 'CHECKING'">
        Draw Card
      </button>
      <button class="button" @click="startTimer" v-else-if="room.state === 'PREVIEW'">
        Show Card & Start Timer
      </button>
      <div v-else style="height: 40px;"></div>
    </div>

  </div>

  <div class="centerer">
    <div style="height: 16px;" v-if="room.state === 'PREVIEW'"></div>
    <Timer
      class="timer"
      ref="timer"
      :length="6"
      :on-finish="nextStage"
      v-if="room.state === 'LISTING'"
      :key="room.round.state"
    ></Timer>

    <div class="list card" v-if="room.state === 'LISTING' || room.state === 'PREVIEW'">
      <strong style="font-size: 1.5em;">Your Responses</strong>
      <div class="item" v-for="index in listSize" :key="index">
        <div class="index">{{index}}</div>
        <textarea
          class="textarea mb-2"
          :disabled="room.state === 'PREVIEW'"
          v-model="room.round.entries[player.name][index-1]"
          @keydown.enter.prevent="focusNextTextArea($event)"
        ></textarea>
      </div>
    </div>

    <div id="history">
      <div v-for="round in room.history" class="card summary">
        <div>
          Round {{round.number}}: {{round.card.category}}
          <span v-if="round.card.type === '3FOLD'">(Threefold)</span>
          <span v-if="round.card.type === '1ON1'">(One-on-One)</span>
          <span v-if="round.card.type === 'FORGOTTEN4'">(Forgotten Four)</span>
        </div>
        <div class="player" v-for="player in room.players">
          {{player.name}}
           scored <strong>{{round.scores[player.name]}}</strong>:&ensp;
          <span v-for="index in round.entries[player.name].length">
            <span :class="{fail: !entryScore(round.collisions[player.name][index-1], round)}">
              {{round.entries[player.name][index-1]}}
            </span> ({{round.collisions[player.name][index-1]}})&ensp;
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

  .type, .category {
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

</style>

<script>
import Timer from '../components/Timer.vue'
import {listenRoom, setRoom} from "../firebase/network.js"
import {cards} from "./cards.js"

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
        name: "test-room",
        state: "START", // "START", "PREVIEW", "LISTING", CHECKING", "END"
        winningScore: 30,
        players: [
          {
            name: "adrian",
            score: 0,
          },
          {
            name: "austin",
            score: 0,
          },
        ],
        round: {
          number: 1,
          card: {
            type: "3FOLD",
            category: "Types of tree",
          },
          entries: {
            adrian: ["spruce", "pine", "elm"],
            austin: ["birch", "spruce", "maple"],
          },
          collisions: {
            adrian: [0, 0, 0],
            austin: [0, 0, 0],
          },
        },
        history: [],
      },
      player: {
        name: "adrian",
      },
    }
  },
  computed: {
    listSize() {
      switch(this.card.type) {
        case "3FOLD":
          return 3;
        case "1ON1":
          return 10;
        case "FORGOTTEN4":
          return 4;
        default:
          return 0;
      }
    },
    card() {
      return this.room.round.card;
    },
  },
  methods: {
    async resetRoom() {
      this.room.state = "LISTING";
      await setRoom(this.room);
    },
    nextStage() {
      this.room.state = "CHECKING";

      this.room.round.scores = {};
      this.room.round.collisions = {};

      for (let player of this.room.players) {
        let roundScore = 0;
        this.room.round.collisions[player.name] = [];

        for (let i = 0; i < this.room.round.entries[player.name].length; i++) {
          let entry = this.room.round.entries[player.name][i];
          var collisions = 0;
          for (let other of this.room.players) {
            if (player === other)
              continue;

            if (this.room.round.entries[other.name].includes(entry)) {
              collisions += 1;
            }
          }
          this.room.round.collisions[player.name][i] = collisions;
          roundScore += this.entryScore(collisions, this.room.round);
        }
        this.room.round.scores[player.name] = roundScore;
        player.score += roundScore;
      }

      this.room.history.push(this.room.round);

      for (let player of this.room.players) {
        if (player.score >= this.room.winningScore) {
          this.endGame();
          break;
        }
      }
    },
    nextRound() {
      this.room.state = "PREVIEW";

      this.room.round = {};
      this.room.round.card = cards[Math.floor(Math.random() * cards.length)];
      this.room.round.entries = {};
      this.room.round.number = this.room.history.length + 1;
      for (let player of this.room.players) {
        this.room.round.entries[player.name] = [];
      }
    },
    startTimer() {
      this.room.state = "LISTING";
    },
    focusNextTextArea(event) {
      let next = event.target.parentNode.nextSibling.childNodes[1];
      if (!next) {
        next = event.target.parentNode.parentNode.querySelector("textarea");
      }
      next.focus();
    },
    endGame() {
      this.room.state = "END";
      console.log("game over");
      // TODO
    },
    entryScore(collisionCount, round) {
      switch(round.card.type) {
        case "3FOLD":
          return collisionCount;
        case "1ON1":
          return collisionCount === 1 ? 1 : 0;
        case "FORGOTTEN4":
          return collisionCount === 0 ? 1 : 0;
        default:
          return 0;
      }
    }
  },
  async created() {
    // listenRoom("test-room", room => { this.room = room});
  },
}
</script>