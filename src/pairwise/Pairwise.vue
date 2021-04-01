<template>
  <BigColumn :width="1200" class="background">
    <!-- TODO: add a Chatbox #right-pane -->

    <!-- TODO: replace with Share Link Modal -->
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
      <!-- <div class="column is-hidden-touch">
        <ScoreRules :state="room.currentRound.state" />
      </div> -->
      <div class="column is-hidden-touch">
        <History
          :scoreHistories="tallyScores().scoreHistories"
          :state="room.currentRound.state"
        ></History>
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
                  @click="joinGame"
                >
                  Rejoin
                </button>
              </span>
            </div>

            <div class="message-body" style="border-width: 0">
              <!-- Players -->
              <div class="field is-grouped is-grouped-multiline">
                <span class="mb-2 mr-2">Players:</span>
                <Nametag
                  v-for="(playerScore, ind) in tallyScores().playerScores"
                  :key="playerScore[0]"
                  :name="playerScore[0]"
                  :user="room.playerData && room.playerData[playerScore[0]]"
                  :index="ind"
                  :submitted="isColorSubmitted(playerScore[0])"
                  :mod="isMod"
                  :score="playerScore[1]"
                  @kick="kickPlayer(playerScore[0])"
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
              <!-- If player does not have an entry in room's wordsAndClues, prompt to enter -->
              <!-- This works because we don't re-enter state=CLUER_PICKING until wordsAndClues becomes empty (theoretically) -->
              <div v-if="!room.wordsAndClues[player.name]">
                <div class="box">
                  <h2 class="fancy has-text-centered" role="alert">
                    Pick a phrase among the following, and write a clue that
                    describes it in the clue box!
                    <br /><br />
                    <button
                      class="button is-rounded"
                      @click="cluerSelectsWord(word)"
                      v-for="word in player.wordList"
                      :key="word"
                      :class="{ 'is-info': player.currentWord == word }"
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
                        v-model="player.currentClue"
                        @keyup.enter="submitClue"
                        :class="{ 'is-primary': true }"
                      />
                    </div>
                    <div class="control">
                      <!-- TODO: add tool tip to show why button is disabled https://wikiki.github.io/elements/tooltip/ -->
                      <button
                        class="button"
                        onkeydown="return event.key != 'Enter';"
                        @click="submitClue"
                        :disabled="isClueSubmitDisabled()"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- After submitting clues, but not everyone has done so yet -->
              <div v-else>
                <h2 class="fancy" role="alert">
                  Still waiting for
                  {{
                    room.players.length - Object.keys(room.wordsAndClues).length
                  }}
                  more player to pick a phrase and a clue...
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
                :style="{
                  'max-height': !showGameRules ? '0px' : 'inherit',
                  padding: !showGameRules ? '0px' : '18px',
                }"
              >
                <strong>1)</strong> Each player picks a pair of words from a
                randomly generated set, and writes a clue (of any length) that
                relates to that pair <br />
                <strong>2)</strong> In each round, players try to construct
                decoys they think best matches each others' clues <br />
                <strong>3)</strong> Once all decoys are submitted, players try
                to guess the real word pair among the decoys
                <br />
                <br />
                Decoys that trick more people earn the most points! Clues that
                are either too obvious or too offbeat will hold you back!
              </div>
            </div>
          </div>

          <!-- Input area (tossing in decoys) -->
          <div v-if="room.currentRound.state == 'TOSS_IN_DECOYS'">
            <!-- All except the clueGiver guesses which word is the real one, based on the clue giver's clues. -->
            <div class="box">
              <div v-if="room.currentRound.clueGiver != player.name">
                <h2 class="fancy has-text-centered" role="alert">
                  Your clue from {{ room.currentRound.clueGiver }} is:
                  <strong>{{
                    room.wordsAndClues[room.currentRound.clueGiver].clue
                  }}</strong>
                </h2>
                <br />
                <h2 class="has-text-centered" role="alert">
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
                      v-for="word in player.decoyAdjList"
                      :key="word"
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
                      v-for="word in player.decoyNounList"
                      :key="word"
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
              </div>
              <div v-else>
                <h2 class="fancy" role="alert">
                  Waiting for other players to toss in decoys based on your
                  clue...
                </h2>
                <br />
                <div class="has-text-centered">
                  <strong>{{
                    room.wordsAndClues[room.currentRound.clueGiver].clue
                  }}</strong>
                </div>
                <h2 class="fancy has-text-centered" role="alert">
                  <span
                    class="tag is-rounded is-primary is-light"
                    v-for="(word, decoyTosser) in room.currentRound.allWords"
                    :key="word"
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
                    :key="word"
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
                    :key="word"
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
                  {{ room.wordsAndClues[room.currentRound.clueGiver].clue }}
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
                  room.wordsAndClues[room.currentRound.clueGiver].word
                }}"!
              </h2>
              <br />
            </div>
            <div class="box">
              <div
                v-for="(vote, player) in room.currentRound.votes"
                :key="player"
              >
                <strong> {{ player }} </strong> guessed "{{ vote }}"!
              </div>
            </div>
            <div v-if="room.gameOver" class="box">
              And that's it! <strong> {{ room.gameWinner }} </strong> won with
              "{{ room.winnerPoints }}
              points"!
              <button class="button play-again" @click="newRound()">
                Play Again
              </button>
            </div>
            <button v-else class="button" @click="newRound()">Next</button>
          </div>
          <br /><br />
          <!-- History TO ADD LATER -->
        </div>
        <!-- Duplicate history column when screen is narrow -->
        <div class="is-hidden-desktop">
          <History
            :scoreHistories="tallyScores().scoreHistories"
            :state="room.currentRound.state"
          ></History>
        </div>
      </div>
      <!-- Right pane for chat (to be implemented) -->
      <div class="column is-hidden-touch"></div>
    </div>
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import ScoreRules from './ScoreRules.vue'
import History from './History.vue'

import {
  setRoom,
  updateRoom,
  getRoom,
  listenRoom,
  listenForLogin,
  updateUserGame,
} from '../firebase/network.js'
import { inject } from 'vue'
import { getIn } from '../utils.js'
import { randomWord } from '../words/lists'

export default {
  components: {
    BigColumn,
    Nametag,
    ShareLink,
    ScoreRules,
    History,
  },
  setup() {
    return { user: inject('currentUser') }
  },
  data() {
    return {
      //stores authentication metadata (whether user is signed in or guest)
      user: {},
      // bare bones room, to be overwritten from db if needed
      room: {
        // get room name from search params if exists, or create a new room name.
        name:
          new URL(window.location.href).searchParams.get('room') ||
          randomWord('adjectives') + '-' + randomWord('nouns'),
        // info about current round
        currentRound: {},
        history: [],
        players: [],
        // game over if a player has over 30 pts (same as dixit)
        gameOver: false,
        gameOverThreshold: 15,
      },
      player: {
        name: new URL(window.location.href).searchParams.get('player') || '',
        // how many options (of adj, verb etc) to construct decoy
        choicesPerDecoyCategory: 7,
        // cache's player's choice for word on the player object, to reduce room update freq
        currentWord: '',
        // cache's player's choice for clue on the player object, to reduce room update freq
        currentClue: '',
        // how many entries in the wordList to pick out real pair
        choicesOfWordPairs: 7,
        // wordlist to choose from as future clue giver
        wordList: [],
        // decoy adj & list
        decoyAdj: '',
        decoyAdjList: [],
        // decoy noun & list
        decoyNoun: '',
        decoyNounList: [],
      },
      alertIsShowing: false,
      showGameRules: false,
      newMod: '',
    }
  },
  async created() {
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
        this.user.displayName ||
        this.user.name ||
        `${randomWord('adjectives')}-anon`
      await this.resetRoom()
      listenRoom(this.room.name, (room) => (this.room = room))
      return
    } else {
      // 2. Set this room's contents, and proceed to enter the room
      this.room = fetchedRoom
      listenRoom(this.room.name, (room) => (this.room = room))
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
  watch: {
    // Timer currently not yet implemented for pairwise
    'room.currentRound.state'(state) {
      this.$emit('reset-timer')
      if (state === 'CLUER_PICKING') {
        this.player.currentWord = ''
        this.player.currentClue = ''
      }
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
    async enterRoom() {
      if (!this.user.canPlay) {
        // If not logged in, show the sign-in modal
        const onGuest = () => {
          this.uniquify(this.user.displayName)
          this.joinGame()
        }
        this.user.signIn(onGuest)
      } else {
        this.uniquify(this.user.displayName)
        await this.joinGame()
      }
    },
    uniquify(name) {
      this.player.name = name
      // TODO actually make unique
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
          // Stores both the real word and all decoys from other players; resets every round.
          allWords: {},
          // Stores counts of votes for both the real word and the decoy; resets every round.
          votes: {},
          // category will be either default or a theme
          category: 'nouns',
        },
        // Map of [player:<word,clue>], repopulated after all players' guesses have cycled through
        wordsAndClues: {},
        // game over if a player has over 30 pts (same as dixit)
        gameOver: false,
        gameOverThreshold: 15,
        gameWinner: '',
        winnerPoints: '',
        // history of previous rounds
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
      await this.joinGame()
    },
    // for nametags, `submitted` has light green color
    isColorSubmitted(playerName) {
      const shouldColorBeSubmitted =
        (this.room.currentRound.state === 'CLUER_PICKING' &&
          // player submitted their real pair and associated clue in CLUER_PICKING state
          Object.keys(this.room.wordsAndClues).includes(playerName)) ||
        (this.room.currentRound.state === 'TOSS_IN_DECOYS' &&
          // players have tossed in their decoys in allWords
          Object.keys(this.room.currentRound.allWords).includes(playerName)) ||
        (this.room.currentRound.state === 'GUESSING' &&
          // players have voted on which pair they think is the real one
          (Object.keys(this.room.currentRound.votes).includes(playerName) ||
            this.room.currentRound.clueGiver === playerName))
      console.log(shouldColorBeSubmitted)
      return shouldColorBeSubmitted
    },
    isClueSubmitDisabled() {
      if (!this.room.players.includes(this.player.name)) {
        return true
      }
      if (this.player.currentWord === '') {
        return true
      }
      if (this.player.currentClue === '') {
        return true
      }
      return false
    },
    async cluerSelectsWord(w) {
      this.player.currentWord = w
    },
    async submitClue() {
      // sync chosen word and clue from local player to the room's list of words & clues
      this.room.wordsAndClues[`${this.player.name}`] = {
        word: this.player.currentWord,
        clue: this.player.currentClue,
      }
      // if player is the current clueGiver, immediately save word to all words this round
      if (this.room.currentRound.clueGiver === this.player.name) {
        this.room.currentRound.allWords[
          this.player.name
        ] = this.player.currentWord
      }
      // if this is the last player to submit a clue, change state.
      if (
        Object.keys(this.room.wordsAndClues).length >= this.room.players.length
      ) {
        this.room.currentRound.state = 'TOSS_IN_DECOYS'
      }
      await setRoom(this.room)

      // reset wordlist and regenerated it
      this.player.wordList = []
      this.generatePlayerWordList()

      // Store this for user profiles, but don't await for the result
      updateUserGame(this.user.id, this.room.name)
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
    async saveWordToAllWordsThisRound(w) {
      const update = {}
      update[`currentRound.allWords.${this.player.name}`] = w
      await updateRoom(this.room, update)
    },
    async submitDecoy() {
      await this.saveWordToAllWordsThisRound(
        this.player.decoyAdj + '-' + this.player.decoyNoun
      )
      if (
        Object.keys(this.room.currentRound.allWords).length ==
        this.room.players.length
      ) {
        await updateRoom(this.room, { 'currentRound.state': 'GUESSING' })
      }
      // Store this for user profiles, but don't await for the result
      updateUserGame(this.user.id, this.room.name)
    },
    // Guesser vote what they believe to be the correct word based on their clue.
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
    async joinGame() {
      const { email = '', supporter = '' } = this.user
      this.room.playerData[this.player.name] = { email, supporter }

      if (this.room.players.includes(this.player.name)) {
        await this.saveRoom('playerData')
      } else {
        this.room.players.push(this.player.name)
        await this.saveRoom('playerData', 'players')
      }

      this.generatePlayerWordList()
    },
    generatePlayerWordList() {
      while (this.player.wordList.length < this.player.choicesOfWordPairs) {
        this.player.wordList.push(
          randomWord('adjectives') + '-' + randomWord('nouns')
        )
      }
    },
    // Currently decoy wordlist is either all nouns or all adjectives
    generateDecoyWordList(type) {
      const wordList = []
      while (wordList.length < this.player.choicesPerDecoyCategory) {
        wordList.push(randomWord(type))
      }
      return wordList
    },
    async kickPlayer(name) {
      delete this.room.wordsAndClues[name]
      if (this.room.players.includes(name)) {
        const index = this.room.players.indexOf(name)
        this.room.players.splice(index, 1)
        if (this.room.currentRound.clueGiver === name) {
          this.room.currentRound.clueGiver = this.room.players[0]
        }
      }
      await this.saveRoom('currentRound.clueGiver', 'players', 'wordsAndClues')
    },
    async newRound() {
      // delete current clueGiver's word and clue
      delete this.room.wordsAndClues[this.room.currentRound.clueGiver]
      // get the next cluegiver
      const newClueGiver = nextClueGiver(
        this.room.currentRound.clueGiver,
        this.room.players
      )
      const nextWord =
        this.room.wordsAndClues[newClueGiver] &&
        this.room.wordsAndClues[newClueGiver].word
      // reset the round
      this.room.currentRound = {
        // If next cluer already gave clues, jump straight to decoys section
        state: nextWord ? 'TOSS_IN_DECOYS' : 'CLUER_PICKING',
        // Pick next guesser
        clueGiver: newClueGiver,
        // Stores both the real word and all decoys from other players; resets every round (with new clue if available).
        allWords: nextWord ? { [newClueGiver]: nextWord } : {},
        // Stores counts of votes for both the real word and the decoy; resets every round.
        votes: {},
        // placeholder for different themes, etc
        category: 'nouns',
      }
      // if newRound is after gameover, reset the game
      if (this.room.gameOver) {
        // clear history first, so tallyScores() doesn't overwrite gameOver, gameWinner, winnerPoints
        this.room.history = []
        this.room.gameOver = false
        this.room.gameWinner = ''
        this.room.winnerPoints = 0
        this.room.wordsAndClues = {}
        this.room.currentRound.state = 'CLUER_PICKING'
        this.room.currentRound.allWords = {}
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
    // tallyScores only counts rounds that have been pushed to history
    tallyScores() {
      const leaderBoard = {}
      const scoreHistories = []
      //initiate leaderBoard at 0 for every current player
      this.room.players.forEach((player) => {
        leaderBoard[player] = 0
      })
      // Each player's client computes point totals for everyone independently
      this.room.history.forEach((round) => {
        const realWordThisRound = round.allWords[round.clueGiver]
        const historyThisRound = []
        // If all players found the clueGiver's phrase
        if (
          Object.values(round.votes).every(
            (guess) => guess === realWordThisRound
          )
        ) {
          historyThisRound.push(
            `Wow, everyone guessed ` +
              round.clueGiver +
              `'s actual pair '` +
              realWordThisRound +
              `'!`
          )
          // all players from that round who are still in the room
          Object.keys(leaderBoard).forEach((player) => {
            // EXCEPT clueGiver gets 2pts automatically
            if (player !== round.clueGiver && round.votes[player]) {
              // player entry is guaranteed to exist, b/c forEach is against leaderboard
              leaderBoard[player] += 2
              historyThisRound.push(player + ' scores 2 free points')
            }
          })
          historyThisRound.push('And ' + round.clueGiver + ' gets no points :c')
        }
        // If some players found the clueGiver's word combo but not all
        else if (Object.values(round.votes).includes(realWordThisRound)) {
          historyThisRound.push(
            round.clueGiver +
              `'s actual phrase was '` +
              realWordThisRound +
              `'!`
          )
          // Award 3 pts to every guesser still in the game who guessed correctly
          Object.keys(leaderBoard).forEach((player) => {
            // Note that clueGiver does not vote
            if (round.votes[player] === realWordThisRound) {
              leaderBoard[player] += 3
              historyThisRound.push(player + ' guessed right-- 3 points!')
            }
            // Incorrect guesses awards 1 point to whoever threw the decoy that earned the guess
            else {
              awardPointsToDecoyWriter(
                round,
                player,
                leaderBoard,
                historyThisRound
              )
            }
          })
          // And finally clueGiver gets 3 points if they're still in the game
          if (Number.isInteger(leaderBoard[round.clueGiver])) {
            leaderBoard[round.clueGiver] += 3
            historyThisRound.push(
              'And ' + round.clueGiver + ` also gets 3 points!`
            )
          }
        }
        // nobody guessed the word
        else {
          historyThisRound.push(
            'Nobody guess correctly! So ' + round.clueGiver + ' gets no points'
          )
          // ClueGiver gets 0 points but all other players of that round get 2pts automatically
          Object.keys(leaderBoard).forEach((player) => {
            // player only gets points if they voted that round.
            if (round.votes[player] && player !== round.clueGiver) {
              leaderBoard[player] += 2
              historyThisRound.push(player + ' scores 2 free points')
            }
            awardPointsToDecoyWriter(
              round,
              player,
              leaderBoard,
              historyThisRound
            )
          })
        }
        scoreHistories.push(historyThisRound)
      })
      // sort the leaderBoard highest score first, then return
      const sortedPlayerScores = Object.entries(leaderBoard).sort(
        (playerScore1, playerScore2) => playerScore2[1] - playerScore1[1]
      )
      // emit "gameover" signal if game over
      sortedPlayerScores.some((playerScore) => {
        if (playerScore[1] >= this.room.gameOverThreshold) {
          this.room.gameOver = true
          this.room.gameWinner = playerScore[0]
          this.room.winnerPoints = playerScore[1]
        }
        return playerScore[1] >= this.room.gameOverThreshold
      })
      return {
        playerScores: sortedPlayerScores,
        scoreHistories: scoreHistories.reverse(),
      }
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
    isColorGuessing() {
      return (
        Object.keys(room.currentRound.votes).includes(playerScore[0]) ||
        (player == room.currentRound.clueGiver &&
          Object.keys(room.currentRound.allWords).includes(playerScore[0]))
      )
    },
    isMod() {
      if (this.user.isAdmin) {
        return true
      }
      if (this.room && this.room.players) {
        return this.player.name == this.room.players[0]
      }
    },
  },
}

function awardPointsToDecoyWriter(
  round,
  player,
  leaderBoard,
  historyThisRound
) {
  // Invert makes the mapping {word -> player} from allWords
  const wordToPlayer = invert(round.allWords)
  const playersVote = round.votes[player]
  if (playersVote && wordToPlayer[playersVote]) {
    // also give a point to whoever threw the decoy earned this player's guess
    const goodDecoyTosser = wordToPlayer[playersVote]
    if (Number.isInteger(leaderBoard[goodDecoyTosser])) {
      // check goodDecoyTosser exists, they might have left the game.
      leaderBoard[goodDecoyTosser] += 1
      historyThisRound.push(
        goodDecoyTosser +
          ` tricked ` +
          player +
          ` with '` +
          playersVote +
          `', 1 point for ` +
          goodDecoyTosser
      )
    }
  }
}

function invert(obj) {
  let inverted_obj = {}
  Object.keys(obj).forEach((key) => {
    inverted_obj[obj[key]] = key
  })
  return inverted_obj
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

/* TODO replace w/ bulma-collapsible extension  */
.collapsible {
  margin-top: 1rem;
  background-color: #f59fa4;
  color: white;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
}

/* TODO replace w/ bulma-collapsible extension  */
.content {
  overflow: hidden;
  transition: max-height 0.2s ease-out;
  background-color: #f1f1f1;
}

.play-again {
  position: absolute;
  right: 20px;
  transform: translateY(-25%);
}
</style>
