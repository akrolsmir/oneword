<template>
  <BigColumn :width="1200" class="background">
    <!-- Notification -->
    <div class="modal" :class="{ 'is-active': alertIsShowing }">
      <div class="modal-background" @click="alertIsShowing = false"></div>
      <div class="modal-content">
        <div class="notification">
          <label class="is-block mb-2">Invite your friends to play!</label>
          <ShareLink />

          <button
            class="delete"
            aria-label="close"
            @click="alertIsShowing = false"
          ></button>
        </div>
      </div>
    </div>

    <!-- Column-based layout for leader board, Main UI, and Chat box -->
    <div class="columns is-centered">
      <!-- Left pane is for leader board. Only shown in-game and when width > 1216px -->
      <div class="column">
        <Leaderboard
          :state="room.currentRound.state"
          :history="room.history"
          :players="room.players"
          :total="gameOverPoints"
          v-on:gameover="handleGameOver"
        />
      </div>
      <!-- Center (main) pane. -->
      <div class="column is-two-thirds is-half-widescreen">
        <!-- In game -->
        <div v-cloak class="container mx-4">
          <div class="message">
            <!-- Room header -->
            <div
              class="message-header has-text-weight-normal is-flex-wrap-wrap"
            >
              <h1 class="fancy big">{{ room.name }}</h1>
              <span class="fancy capitalize"
                >Round {{ room.history.length + 1 }}</span
              >
              <!-- Navigation -->
              <span class="buttons are-small">
                <button
                  class="button is-dark is-inverted is-outlined"
                  @click="alertIsShowing = true"
                >
                  Invite
                </button>
                <button
                  v-if="room.players.includes(player.name)"
                  class="button is-dark is-inverted is-outlined"
                  @click="kickPlayer(player.name)"
                >
                  Watch
                </button>
                <button
                  v-else
                  class="button is-dark is-inverted is-outlined"
                  @click="joinRoom"
                >
                  Rejoin
                </button>
              </span>
            </div>

            <div class="message-body" style="border-width: 0">
              <!-- Players -->
              <div class="field is-grouped is-grouped-multiline">
                <span class="mb-2 mr-2">Players:</span>
                <!-- TODO: refactor submitted/guessing into functions. This is currently a hack -->
                <Nametag
                  v-for="(player, i) in room.players"
                  :name="player"
                  :user="room.playerData && room.playerData[player]"
                  :index="i"
                  :submitted="
                    (Object.keys(room.currentRound.allWords).includes(player) &&
                      player != room.currentRound.clueGiver) ||
                    (player == room.currentRound.clueGiver &&
                      !Object.keys(room.currentRound.allWords).includes(player))
                  "
                  :guessing="
                    Object.keys(room.currentRound.votes).includes(player) ||
                    (player == room.currentRound.clueGiver &&
                      Object.keys(room.currentRound.allWords).includes(player))
                  "
                  :mod="isMod"
                  @kick="kickPlayer(player)"
                />
              </div>
            </div>
          </div>
          <!-- <timer :length="timerLength" :on-finish="nextStage" v-if="timerLength > 0" :key="room.currentRound.state"></timer> -->

          <!-- Input area (CLUER_PICKING) -->
          <div v-if="room.currentRound.state == 'CLUER_PICKING'">
            <div v-if="room.players.length < 3">
              <h2 class="fancy" role="alert">Waiting for 3 players...</h2>
              <p class="mt-5 mb-2">Invite your friends to play!</p>
              <ShareLink />
            </div>
            <!-- TODO consider adding limit of 10 players so games aren't too big? -->
            <!-- If there are enough players to play -->
            <div v-else>
              <!-- Current player's turn to pick a word and give clues -->
              <div v-if="room.currentRound.clueGiver == player.name">
                <div class="box">
                  <h2 class="fancy has-text-centered" role="alert">
                    Pick a phrase among the following, and write a clue that
                    describes it in the clue box!
                    <br /><br />
                    <button
                      class="button is-rounded"
                      @click="cluerSelectsWord(word)"
                      v-for="(word, i) in player.wordList"
                      :class="{ 'is-info': room.currentRound.word == word }"
                    >
                      {{ word }}
                    </button>
                  </h2>
                  <label class="label" for="hintInput">Your clue</label>
                  <div class="field has-addons">
                    <div class="control is-expanded">
                      <input
                        class="input"
                        id="hintInput"
                        type="text"
                        v-model="room.currentRound.clue"
                        @keyup.enter="submitClue"
                        :class="{ 'is-primary': true }"
                      />
                    </div>
                    <div class="control">
                      <!-- TODO: add tool tip to show why button is disabled https://wikiki.github.io/elements/tooltip/ -->
                      <button
                        class="button"
                        @click="submitClue"
                        :disabled="isClueSubmitDisabled()"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                  <!-- <div class="notification is-danger" role="alert" v-if="hasSpecialCharacters(room.currentRound.clue)">
                    Are you sure this is a real word?
                  </div> -->
                </div>
              </div>
              <!-- Not current player's turn -->
              <div v-else>
                <h2 class="fancy" role="alert">
                  Waiting for
                  <strong>{{ room.currentRound.clueGiver }}</strong> to pick a
                  phrase and a clue...
                </h2>
                <br />
              </div>
              <button
                class="collapsible"
                @click="showGameRules = !showGameRules"
              >
                How the game works
              </button>
              <div
                class="content"
                v-bind:style="{
                  'max-height': !showGameRules ? '0px' : 'inherit',
                  padding: !showGameRules ? '0px' : '18px',
                }"
              >
                <strong>1)</strong> Wait for
                <strong>{{ room.currentRound.clueGiver }}</strong> to pick a
                random pair of words (i.e. a phrase), and write some text (i.e.
                the clue) that relates to the phrase <br />
                <strong>2)</strong> Based on the clue, everyone else constructs
                a decoy phrase they think best matches the clue <br />
                <strong>3)</strong> Once all decoys are submitted, players try
                to guess <strong>{{ room.currentRound.clueGiver }}</strong
                >'s real phrase among the decoys
              </div>
            </div>
          </div>

          <!-- Input area (toossing in decoys) -->
          <div v-if="room.currentRound.state == 'TOSS_IN_DECOYS'">
            <!-- All except the clueGiver guesses which word is the real one, based on the clue giver's clues. -->
            <div class="box">
              <div v-if="room.currentRound.clueGiver != player.name">
                <h2 class="fancy has-text-centered" role="alert">
                  Pick one option from each word category to construct a decoy
                  phrase best matching
                  <strong>{{ room.currentRound.clueGiver }}</strong
                  >'s clue. <br /><br />
                </h2>
                <div class="columns">
                  <!-- Left pane is for leader board. Only shown in-game and when width > 1216px -->
                  <div class="column has-text-centered">
                    <strong> Adjectives </strong>
                    <br /><br />
                    <button
                      class="button is-rounded"
                      @click="player.decoyAdj = word"
                      v-for="(word, i) in player.decoyAdjList"
                      :class="{ 'is-success': player.decoyAdj === word }"
                    >
                      {{ word }}
                    </button>
                  </div>

                  <div class="column has-text-centered">
                    <strong> Nouns </strong>
                    <br /><br />
                    <button
                      class="button is-rounded"
                      @click="player.decoyNoun = word"
                      v-for="(word, i) in player.decoyNounList"
                      :class="{ 'is-success': player.decoyNoun === word }"
                    >
                      {{ word }}
                    </button>
                  </div>
                </div>
                <div class="has-text-centered">
                  Your decoy phrase:
                  <span v-if="player.decoyAdj || player.decoyNoun">
                    <strong
                      >"{{ player.decoyAdj }}-{{ player.decoyNoun }}"</strong
                    >
                  </span>
                  <br />
                  <br />
                  <button
                    class="button"
                    @click="submitDecoy"
                    :class="{
                      'is-success': room.currentRound.allWords[player.name],
                    }"
                    :disabled="isDecoySubmitDisabled()"
                  >
                    {{
                      room.currentRound.allWords[player.name]
                        ? 'Submitted!'
                        : 'Submit'
                    }}
                  </button>
                </div>
                <h2 class="fancy has-text-centered" role="alert">
                  Your clue from {{ room.currentRound.clueGiver }} is:
                  <strong>{{ room.currentRound.clue }}</strong>
                </h2>
              </div>
              <div v-else>
                <h2 class="fancy" role="alert">
                  Waiting for other players to toss in decoys based on your
                  clue...
                </h2>
                <br />
                <div class="has-text-centered">
                  <strong>{{ room.currentRound.clue }}</strong>
                </div>
                <h2 class="fancy has-text-centered" role="alert">
                  <span
                    class="tag is-rounded is-primary is-light"
                    v-for="(word, decoyTosser) in room.currentRound.allWords"
                  >
                    <template v-if="decoyTosser != player.name">
                      {{ decoyTosser }} tossed in "{{ word }}"!
                    </template>
                    <template v-else>You chose the word "{{ word }}"</template>
                  </span>
                </h2>
              </div>
            </div>
          </div>

          <!-- Input area (guessing) -->
          <div v-if="room.currentRound.state == 'GUESSING'">
            <!-- All except the clueGiver guesses which word is the real one, based on the clue giver's clues. -->
            <div class="box">
              <div v-if="room.currentRound.clueGiver == player.name">
                <h2 class="fancy has-text-centered" role="alert">
                  <button
                    class="button is-rounded"
                    v-for="word in Object.values(
                      room.currentRound.allWords
                    ).sort()"
                    :disabled="true"
                    :class="{
                      'is-success': Object.values(
                        room.currentRound.votes
                      ).includes(word),
                    }"
                  >
                    {{ word }}
                  </button>
                </h2>
                <div class="fancy has-text-centered newline">
                  Waiting for other players to guess...
                </div>
                <div class="has-text-centered">
                  You aren't allowed to guess your own word, sorry!
                </div>
              </div>
              <div v-else>
                <h2 class="fancy has-text-centered" role="alert">
                  Can you find the right word from
                  {{ room.currentRound.clueGiver }} among the decoys.. ?
                  <br /><br />
                  <button
                    class="button is-rounded"
                    @click="submitVote(word)"
                    v-for="word in Object.values(
                      room.currentRound.allWords
                    ).sort()"
                    :disabled="room.currentRound.allWords[player.name] == word"
                    :class="{
                      'is-success':
                        room.currentRound.votes[player.name] == word,
                    }"
                  >
                    {{ word }}
                  </button>
                </h2>
                <h2 class="fancy has-text-centered">
                  Your clue from {{ room.currentRound.clueGiver }}:
                </h2>
                <div class="fancy has-text-centered newline">
                  {{ room.currentRound.clue }}
                </div>
              </div>
            </div>
          </div>

          <!-- Input area (done) -->
          <div v-if="room.currentRound.state == 'DONE'">
            <div class="box">
              <h2 class="fancy has-text-centered" role="alert">
                The phrase from
                <strong>{{ room.currentRound.clueGiver }}</strong> was "{{
                  room.currentRound.word
                }}"!
              </h2>
              <br />
            </div>
            <div class="box">
              <div v-for="(vote, player) in room.currentRound.votes">
                <strong> {{ player }} </strong> guessed "{{ vote }}"!
              </div>
            </div>
            <div v-if="gameOver" class="box">
              And that's it! <strong> {{ gameWinner }} </strong> won with "{{
                winnerPoints
              }}
              points"!
              <!-- <button class="button" @click="newRound(false)">Play Again</button> -->
            </div>
            <button v-else class="button" @click="newRound(false)">Next</button>
          </div>
          <br /><br />
          <!-- History TO ADD LATER -->
        </div>
      </div>
      <!-- Right pane for chat (to be implemented) -->
      <div class="column is-hidden-touch is-hidden-desktop-only"></div>
    </div>
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import Leaderboard from './Leaderboard.vue'

import {
  setRoom,
  updateRoom,
  getRoom,
  listenRoom,
  unlistenRoom,
} from '../firebase/network.js'
import { inject } from 'vue'
import { getIn } from '../utils.js'
import { randomWord } from '../oneword/oneword-utils'

export default {
  components: {
    BigColumn,
    Nametag,
    ShareLink,
    Leaderboard,
  },
  setup() {
    return { user: inject('currentUser') }
  },
  data() {
    return {
      //stores authentication metadata (whether user is signed in or guest)
      user: {},
      // customizable
      numItemsPerPlayer: 7,
      // bare bones room, to be overwritten from db if needed
      room: {
        // get name from search params, or create a new one.
        name:
          new URL(window.location.href).searchParams.get('room') ||
          randomWord('adjectives') + '-' + randomWord('nouns'),
        currentRound: {},
        history: [],
        players: [],
      },
      player: {
        name: new URL(window.location.href).searchParams.get('player') || '',
        choicesPerDecoyCategory: 7,
        // currentRoom is not used at the moment
        currentRoom: new URL(window.location.href).searchParams.get('room'),
        // wordlist for as future clue giver
        wordList: [],
        // decoy adj & list
        decoyAdj: '',
        decoyAdjList: [],
        // decoy noun & list
        decoyNoun: '',
        decoyNounList: [],
      },
      alertIsShowing: false,
      // game over if a player has over 30 pts (same as dixit)
      gameOver: false,
      gameOverPoints: 30,
      newMod: '',
      wordsSaved: false,
      showGameRules: false,
    }
  },
  created() {
    // Hardcoded to 'orange-calculator' for now
    listenRoom('orange-calculator', (room) => (this.room = room))
  },
  watch: {
    // Timer currently not yet implemented for pairwise
    'room.currentRound.state'(state) {
      console.log('state change: ' + state)
      this.$emit('reset-timer')
      if (state === 'TOSS_IN_DECOYS') {
        this.player.decoyAdjList = this.generateDecoyWordList('adjectives')
        this.player.decoyNounList = this.generateDecoyWordList('nouns')
      }
      // reset decoys
      if (state === 'GUESSING') {
        this.player.decoyAdj = ''
        this.player.decoyNoun = ''
      }
    },
  },
  methods: {
    // Somewhat copied from One Word's index.html. TODO: Dedupe?
    async enterRoom() {
      if (!this.player.name) {
        this.$refs.navbar.logIn()
        return
      }
      // Sanitize room name
      this.room.name = this.room.name
        .trim()
        .toLowerCase()
        .replace(/\s/g, '-') // whitespace
        .replace(/[^\p{L}-]/gu, '') // not (dash or letter in any language)

      const room = await getRoom(this.room)

      if (room) {
        /*
         * TODO(shawnx): UNCOMMENT THIS BEFORE COMMIT
         * If the player's name collides with another user's,
         * prepend adjectives until it is unique
         */
        // while (
        //   Object.keys(room.players).includes(this.player.name) &&
        //   (this.user.guest || this.user.email != room.playerData[this.player.name].email)
        // ) {
        //   this.player.name = capitalize(randomWord('adjectives')) + ' ' + this.player.name;
        // }
        this.room = room
        return await this.joinRoom()
      } else {
        // Create a new room
        listenRoom(this)
        this.generatePlayerWordList()
        return await this.resetRoom()
      }
    },
    async resetRoom() {
      this.room = {
        name: this.room.name,
        // moderator of the room (One Word used to rely on index position in players list)
        mod: '',
        // players changed from list to object so it can also store each player's points
        players: [this.player.name],
        // Each round has its own object.
        currentRound: {
          // states can be 'CLUER_PICKING' 'TOSS_IN_DECOYS' 'GUESSING' and 'DONE'
          state: 'CLUER_PICKING',
          // First player becomes the first one to pick a word and a clue
          clueGiver: this.player.name,
          // Stores the real word from the clue giver; resets every round.
          word: '',
          // Stores both the real word and all decoys from other players; resets every round.
          allWords: {},
          // Stores the clue from the clue giver
          clue: '',
          // Stores counts of votes for both the real word and the decoy; resets every round.
          votes: {},
          // category will be either default or a theme
          category: 'nouns',
        },
        gameOver: false,
        gameWinner: '',
        winnerPoints: 0,
        history: [],
        public: true,
        lastUpdateTime: Date.now(),
        timers: { PICKING: '', GUESSING: '', DONE: '', running: false },
        categories: {
          nouns: true,
          verbs: false,
          adjectives: false,
          compounds: false,
          custom: false,
        },
        customWords: '',
        playerData: {
          [this.player.name]: {
            email: this.user.email || '',
            supporter: this.user.supporter || '',
          },
        },
      }
      await setRoom(this.room)
    },
    isClueSubmitDisabled() {
      if (!this.room.players.includes(this.player.name)) {
        return true
      }
      if (Object.keys(this.room.currentRound.allWords).length === 0) {
        return true
      }
      if (this.room.currentRound.clue === '') {
        return true
      }
      return false
    },
    isDecoySubmitDisabled() {
      if (!this.player.decoyAdj) {
        return true
      }
      if (!this.player.decoyNoun) {
        return true
      }
      return false
    },
    async cluerSelectsWord(w) {
      await updateRoom(this.room, { 'currentRound.word': w })
      await this.saveWordToAllWordsInRoom(w)
    },
    async saveWordToAllWordsInRoom(w) {
      const update = {}
      update[`currentRound.allWords.${this.player.name}`] = w
      await updateRoom(this.room, update)
      if (
        Object.keys(this.room.currentRound.allWords).length ==
        this.room.players.length
      ) {
        await updateRoom(this.room, { 'currentRound.state': 'GUESSING' })
      }
    },
    async submitClue() {
      const indexToRemove = this.player.wordList.indexOf(
        this.room.currentRound.word
      )
      if (indexToRemove > -1) {
        this.player.wordList.splice(indexToRemove, 1)
        this.player.wordList.push(
          randomWord('adjectives') + '-' + randomWord('nouns')
        )
      }
      this.room.currentRound.state = 'TOSS_IN_DECOYS'
      // room.currentRound.clue should already be updated due to bi-di binding
      await setRoom(this.room)
    },
    async submitDecoy() {
      await this.saveWordToAllWordsInRoom(
        this.player.decoyAdj + '-' + this.player.decoyNoun
      )
    },
    // vote is the word the guesser picked
    async submitVote(vote) {
      const update = {}
      update[`currentRound.votes.${this.player.name}`] = vote
      await updateRoom(this.room, update)
      // Total votes are players.length - 1 since clueGiver can't vote.
      if (
        Object.keys(this.room.currentRound.votes).length >=
        this.room.players.length - 1
      ) {
        this.room.currentRound.state = 'DONE'
        this.room.history.push(this.room.currentRound)
        await setRoom(this.room)
      }
    },
    async nextStage() {
      if (this.room.currentRound.state == 'CLUER_PICKING') {
        return await updateRoom(this.room, { 'currentRound.state': 'GUESSING' })
      } else if (this.room.currentRound.state == 'GUESSING') {
        return await updateRoom(this.room, { 'currentRound.state': 'DONE' })
      } else {
        return await this.newRound()
      }
    },
    // Only call if room already exists.
    async joinRoom() {
      listenRoom(this)

      // migration
      if (!this.room.playerData) {
        this.room.playerData = {}
      }

      const { email = '', supporter = '' } = this.user
      this.room.playerData[this.player.name] = { email, supporter }

      if (this.room.players.includes(this.player.name)) {
        await this.saveRoom('playerData')
      } else {
        this.room.players.push(this.player.name)
        await this.saveRoom('playerData', 'players')
      }
      // generate playerWordList so wordList keeps some state after page refresh.
      this.generatePlayerWordList()
    },
    generatePlayerWordList() {
      const allWordsThisRound = this.room.currentRound.allWords
      // If the user refreshed their page, we preserve the word they had
      if (allWordsThisRound && allWordsThisRound[this.player.name]) {
        this.player.wordList.push(allWordsThisRound[this.player.name])
      }
      while (this.player.wordList.length < this.numItemsPerPlayer) {
        this.player.wordList.push(
          randomWord('adjectives') + '-' + randomWord('nouns')
        )
      }
    },
    generateDecoyWordList(type) {
      const wordList = []
      while (wordList.length < this.player.choicesPerDecoyCategory) {
        wordList.push(randomWord(type))
      }
      return wordList
    },
    goHome() {
      unlistenRoom()
      this.room = { name: '' }
    },
    handleGameOver(playerScore) {
      this.gameOver = true
      this.gameWinner = playerScore[0]
      this.winnerPoints = playerScore[1]
    },
    async kickPlayer(name) {
      if (this.room.players.includes(name)) {
        const index = this.room.players.indexOf(name)
        this.room.players.splice(index, 1)
        await this.saveRoom('players')
      }
    },
    async makeMod(name) {
      const index = this.room.players.indexOf(name)
      if (index >= 0) {
        // swap players[0] and players[index]
        ;[this.room.players[0], this.room.players[index]] = [
          this.room.players[index],
          this.room.players[0],
        ]
        await this.saveRoom('players')
      }
    },
    async newRound(sameGuesser = false) {
      this.room.currentRound = {
        state: 'CLUER_PICKING',
        // Pick next guesser
        clueGiver: nextClueGiver(
          this.room.currentRound.clueGiver,
          this.room.players
        ),
        // Stores the real word from the clue giver; resets every round.
        word: '',
        // Stores both the real word and all decoys from other players; resets every round.
        allWords: {},
        // Stores the clue from the clue giver
        clue: '',
        // Stores counts of votes for both the real word and the decoy; resets every round.
        votes: {},
        category: 'nouns', //remove this
      }
      this.room.lastUpdateTime = Date.now()
      // Overwrite existing room;
      await setRoom(this.room)
    },
    async updateTimer() {
      this.room.timerLength = this.player.timerLength
      this.saveRoom('timerLength')
    },
    // Sync any number of properties of this.room to firebase
    async saveRoom(...props) {
      await updateRoom(
        this.room,
        Object.fromEntries(props.map((prop) => [prop, getIn(this.room, prop)]))
      )
    },
    async toggleTimers() {
      this.room.timers.running = !this.room.timers.running
      await this.saveRoom('timers')
    },
  },
  computed: {
    timerLength() {
      if (
        this.room.currentRound &&
        this.room.timers &&
        this.room.timers.running
      ) {
        return this.room.timers[this.room.currentRound.state]
      }
      return 0
    },
    isMod() {
      if (this.user.supporter == 'ADMIN') {
        return true
      }
      if (this.room && this.room.players) {
        return this.player.name == this.room.players[0]
      }
    },
  },
}

function nextClueGiver(lastGuesser, players) {
  // players is a map from name->points; we just need the names
  const nextIndex =
    (players.indexOf(lastGuesser) + 1 + players.length) % players.length
  return players[nextIndex]
}
</script>

<style scoped>
.background {
  background-color: #fcd6d8;
}
</style>
