<template>
  <BigColumn class="background">
    <div v-cloak id="modals">
      <!-- Share Link Modal -->
      <AnimatedModal
        :visible="showShareModal"
        @background-click="showShareModal = false"
      >
        <div class="notification">
          <label class="is-block mb-2">Invite your friends to play!</label>
          <ShareLink :link="currentUrl()" />
          <button
            class="delete"
            aria-label="close"
            @click="showShareModal = false"
          ></button>
        </div>
      </AnimatedModal>

      <!-- Standard Modals -->
      <AnimatedModal
        :visible="showStandardModal"
        :content="standardModal"
        @background-click="showStandardModal = false"
        @cancel="showStandardModal = false"
      />
    </div>

    <!-- Room header -->
    <div class="message">
      <div class="message-header has-text-weight-normal is-flex-wrap-wrap">
        <h1 class="fancy big">
          Round {{ room.history.length + 1 }} of {{ totalRounds }}
        </h1>
        <a class="fancy" @click="showShareModal = true">{{ room.name }}</a>
      </div>
      <div>
        <div class="is-flex is-flex-wrap-wrap is-align-items-center">
          <!-- Supporter Settings -->
          <span
            title="Supporter settings"
            class="py-1 pl-1 pr-4"
            style="
              background: #ffef99;
              clip-path: polygon(0 0, 0 100%, 93% 100%, 100% 0);
            "
          >
            <div class="mx-1" v-if="isMod">
              <span class="select is-small">
                <select v-model="room.public" @change="upsell('public')">
                  <option :value="true">Public</option>
                  <option :value="false">Private</option>
                </select>
              </span>
              <span class="select is-small">
                <select
                  v-model="room.roundsInGame"
                  @change="upsell('roundsInGame')"
                >
                  <option :value="13">13 rounds</option>
                  <option :value="'Unlimited'">&infin; rounds</option>
                </select>
              </span>
            </div>
            <template v-else>
              <span class="mx-2"
                >{{ room.public ? 'Public' : 'Private' }} Room</span
              >
              <span class="mx-2"
                >{{
                  room.roundsInGame == 'Unlimited'
                    ? '&infin;'
                    : room.roundsInGame
                }}
                rounds</span
              >
            </template>
          </span>

          <!-- Timers -->
          <span class="ml-1 mr-2 my-1 is-flex is-align-items-center">
            <template v-if="isMod">
              <label for="clue-timer" class="is-size-7 mx-1 is-flex-grow-1"
                >Clue:</label
              >
              <input
                class="input is-small"
                style="flex: 1 2 48px"
                id="clue-timer"
                type="number"
                min="1"
                max="99"
                placeholder="&infin;"
                v-model.number="room.timers.CLUEING"
                :disabled="room.timers.running"
              />
              <label for="guess-timer" class="is-size-7 mx-1 is-flex-grow-1"
                >Guess:</label
              >
              <input
                class="input is-small"
                style="flex: 1 2 48px"
                id="guess-timer"
                type="number"
                min="1"
                max="99"
                placeholder="&infin;"
                v-model.number="room.timers.GUESSING"
                :disabled="room.timers.running"
              />
              <button
                class="button is-small mx-1 is-flex-grow-1"
                @click="toggleTimers"
              >
                {{ room.timers.running ? 'Stop' : 'Start' }} Timers
              </button>
            </template>
            <template v-else>
              <template v-if="room.timers.running">
                <span v-if="room.timers.CLUEING" class="mx-2"
                  >Clue: {{ room.timers.CLUEING }}s</span
                >
                <span v-if="room.timers.GUESSING" class="mx-2"
                  >Guess: {{ room.timers.GUESSING }}s</span
                >
              </template>
              <span v-else class="mx-1">No timers</span>
            </template>
          </span>

          <!-- Categories -->
          <span
            v-if="isMod"
            class="field is-grouped is-grouped-multiline mx-3 my-1"
          >
            <div class="control" v-for="category in CATEGORY_ORDER">
              <label class="capitalize checkbox">
                <input
                  type="checkbox"
                  v-model="room.categories[category]"
                  @change="saveRoom('categories')"
                />
                {{ category }}
              </label>
            </div>
          </span>
          <span class="mx-3" v-else>
            <!-- TODO: categories should be an array (although, race conditions...?) -->
            <template
              v-for="category in CATEGORY_ORDER.filter(
                (c) => room.categories[c]
              )"
            >
              <span
                class="comma"
                :class="{
                  'has-text-weight-bold':
                    room.currentRound.category == category,
                }"
              >
                {{ category }}</span
              >
            </template>
          </span>
        </div>
        <!-- Custom word editor (mod only) -->
        <div
          v-if="isMod && room.categories['custom']"
          class="is-flex is-justify-content-center"
        >
          <div class="field mb-2" style="width: 500px; max-width: 90%">
            <div class="control">
              <textarea
                class="textarea is-small mb-2"
                :class="{ 'is-primary': wordsSaved }"
                placeholder='Input your own word list e.g. "sneezy, phylum, europe, sloth, guacamole, data, colossus"...'
                v-model="room.customWords"
                @input="wordsSaved = false"
              ></textarea>
              <div id="custom-word-tags" class="tags mb-1">
                <span
                  class="tag is-info"
                  v-for="word in customWordList.slice(0, 30)"
                  >{{ word }}</span
                >
              </div>
            </div>
            <div class="control">
              <button v-if="wordsSaved" class="button is-small" disabled>
                Saved
              </button>
              <!-- TODO: set wordsSaved = true on @click. -->
              <button
                v-else
                class="button is-small"
                @click="saveRoom('customWords')"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="message-body" style="border-width: 0">
        <!-- Players -->
        <label class="label mt-0">Players</label>
        <div class="field is-grouped is-grouped-multiline">
          <Nametag
            v-for="tagged in players"
            :key="tagged"
            :name="tagged"
            :user="room.playerData && room.playerData[tagged]"
            :submitted="
              !!room.currentRound.clues[tagged] ||
              room.currentRound.guesser == tagged
            "
            :guessing="room.currentRound.guesser == tagged"
            :mod="isMod"
            :self="tagged === player.name"
            :modtag="room.people && room.people[tagged]?.state === 'MOD'"
            @kick="kickPlayer(tagged)"
          ></Nametag>
        </div>
        <div v-if="noMod">
          <a @click="makeMod(player.name)"> (Become the mod...) </a>
        </div>
        <!-- Other Mod Tools -->
        <div v-if="isMod">
          <div class="label">Room Controls</div>
          <div class="field has-addons is-inline-flex mb-0">
            <span class="control">
              <button class="button is-small" @click="nextStage">
                Next Stage
              </button>
            </span>
            <span class="control">
              <button class="button is-small" @click="newRound(true)">
                Skip Word
              </button>
            </span>
            <span v-if="user.supporter == 'ADMIN'" class="control">
              <button class="button is-small" @click="resetRoom">
                Reset Room
              </button>
            </span>
          </div>
          <div class="field has-addons is-inline-flex">
            <span class="control">
              <button class="button is-small" @click="makeMod(newMod)">
                Transfer Mod
              </button>
            </span>
            <span class="control">
              <span class="select is-small">
                <select v-model="newMod">
                  <option v-for="player in players">
                    {{ player }}
                  </option>
                </select>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <Timer
      ref="timer"
      :length="timerLength"
      :on-finish="nextStage"
      v-if="timerLength > 0"
      :key="room.currentRound.state"
    ></Timer>

    <!-- Input area (clueing) -->
    <div v-if="room.currentRound.state == 'CLUEING'">
      <div v-if="players.length < 3">
        <h2 class="fancy" role="alert">Waiting for 3 players...</h2>
        <p class="mt-5 mb-2">Invite your friends to play!</p>
        <ShareLink :link="currentUrl()" />
      </div>
      <div v-else-if="room.currentRound.guesser == player.name">
        <h2 class="fancy" role="alert">
          It's your turn to guess! Waiting for clues...
        </h2>
      </div>
      <div v-else>
        <div class="box">
          <h2 class="fancy has-text-centered" role="alert">
            The {{ wordForWord(room.currentRound.category) }} for
            {{ room.currentRound.guesser }} is<br />
            <strong class="is-size-3">{{ room.currentRound.word }}</strong>
          </h2>
          <br />
          <label class="label" for="hintInput">Your clue</label>
          <div class="field has-addons">
            <div class="control is-expanded">
              <input
                class="input"
                id="hintInput"
                type="text"
                v-model="player.clue"
                @keyup.enter="submitClue"
                :class="{
                  'is-primary': room.currentRound.clues[player.name],
                }"
                :disabled="!players.includes(player.name)"
              />
            </div>
            <div class="control">
              <button
                class="button"
                @click="submitClue"
                :disabled="
                  !players.includes(player.name) ||
                  dupes(player.clue, room.currentRound.word)
                "
                :class="{
                  'is-primary': room.currentRound.clues[player.name],
                }"
              >
                {{
                  room.currentRound.clues[player.name] ? 'Submitted' : 'Submit'
                }}
              </button>
            </div>
          </div>
          <div
            class="notification is-danger"
            role="alert"
            v-if="dupes(player.clue, room.currentRound.word)"
          >
            This clue is too similar to the word
          </div>
          <div
            class="notification is-danger"
            role="alert"
            v-else-if="hasSpecialCharacters(player.clue)"
          >
            Are you sure this is a real word?
          </div>
        </div>
      </div>
    </div>

    <!-- Input area (guessing) -->
    <div v-if="room.currentRound.state == 'GUESSING'">
      <div v-if="room.currentRound.guesser == player.name">
        <div class="box">
          <h2 class="fancy" role="alert">
            Your clues for the
            {{ wordForWord(room.currentRound.category) }} are:
          </h2>
          <div class="fancy newline">
            {{ dedupe(room.currentRound.clues, false) }}
          </div>
          <label class="label" for="guess-input">Your Guess</label>
          <div class="field has-addons">
            <div class="control is-expanded">
              <input
                class="input"
                id="guess-input"
                type="text"
                v-model="player.guess"
                @keyup.enter="submitGuess"
              />
            </div>
            <div class="control">
              <button class="button" @click="submitGuess">Submit</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <h2 class="fancy" role="alert">
          Waiting for {{ room.currentRound.guesser }} to guess...
        </h2>
        <div class="fancy">
          The clues for
          <strong>{{ room.currentRound.word }}</strong> were:
        </div>
        <div class="fancy newline">
          {{ dedupe(room.currentRound.clues) }}
        </div>
      </div>
    </div>

    <!-- Input area (done) -->
    <div v-if="room.currentRound.state == 'DONE'">
      <div v-if="correct(room.currentRound)">
        <h2 class="fancy has-text-success" role="alert">
          Correct! The word was "{{ room.currentRound.word }}". Good job!
        </h2>
      </div>
      <div v-else>
        <h2 class="fancy has-text-danger" role="alert">
          Aww, {{ room.currentRound.guesser }} guessed "{{
            room.currentRound.guess
          }}", but it was "{{ room.currentRound.word }}"...
        </h2>
        <a
          v-if="!correct(room.currentRound)"
          class="is-size-7"
          @click="toggleRoundCorrect"
        >
          (Mark as correct)
        </a>
      </div>
      <div class="fancy newline">
        {{ dedupe(room.currentRound.clues) }}
      </div>
      <br />
      <GameEnd
        v-if="isEnd(room)"
        :score="score(room)"
        :rounds-in-game="room.roundsInGame"
        :name="user.displayName"
        :supporter="!!user.supporter"
        @continue-game="newRound(false)"
      ></GameEnd>
      <button v-else class="button" @click="newRound(false)">Next Round</button>
    </div>
    <br />

    <!-- Notify user if they're spectating -->
    <div
      v-cloak
      class="notification is-info is-light"
      v-if="!user.canPlay || room.people[player.name]?.state === 'WATCHING'"
    >
      <span class="subtitle">You are currently spectating this game!</span>
      <div class="buttons mt-3">
        <button class="button is-primary" @click="enterRoom">
          <strong>Join game</strong>
        </button>
        <router-link class="button is-ghost" to="/">Back to home</router-link>
      </div>
    </div>

    <br />
    <!-- History -->
    <h2 v-if="room.history.length > 0" class="fancy">History</h2>
    <template v-for="(round, i) in room.history.slice().reverse()">
      <div class="level mb-0">
        <div class="level-left">
          <span class="level-item" style="justify-content: flex-start">
            <span
              class="icon"
              :class="correct(round) ? 'has-text-success' : 'has-text-danger'"
              :aria-label="correct(round) ? 'correct' : 'incorrect'"
            >
              {{ correct(round) ? '✔' : '✖' }}
            </span>
            <span class="fancy normal"
              >{{ room.history.length - i }}. {{ round.word }} ({{
                round.category
              }})</span
            >
          </span>
          <p class="level-item" style="justify-content: flex-start">
            {{ round.guesser }} guessed "<b
              :class="correct(round) ? 'has-text-success' : 'has-text-danger'"
              >{{ round.guess }}</b
            >"
          </p>
        </div>
      </div>
      <a
        v-if="!correct(round)"
        class="is-size-7"
        @click="toggleHistoryCorrect(i)"
        >(Mark as correct)</a
      >

      <p class="newline mt-5">{{ dedupe(round.clues) }}</p>
      <br />
    </template>

    <!-- <link-footer amazon="https://amzn.to/3bbSpZn"></link-footer> -->
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import Nametag from '../components/Nametag.vue'
import AnimatedModal from '../components/AnimatedModal.vue'
import ShareLink from '../components/ShareLink.vue'
import Timer from '../components/Timer.vue'
import GameEnd from './GameEnd.vue'

import {
  getRoom,
  listenForLogin,
  listenRoom,
  setRoom,
  updateRoom,
  updateUserGame,
} from '../firebase/network'
import {
  referSupporter,
  correct,
  isEnd,
  score,
  dupes,
  dedupe,
  nextGuesser,
  randomWord,
  nextWord,
  nextCategory,
  capitalize,
  listPlayers,
} from './oneword-utils.js'
import { inject } from 'vue'

export default {
  components: {
    BigColumn,
    Nametag,
    AnimatedModal,
    ShareLink,
    Timer,
    GameEnd,
  },
  setup() {
    return { user: inject('currentUser') }
  },
  data() {
    return {
      // room contains everything that is synced to Firestore
      room: {
        // TODO: These default fillers should not be needed?
        history: [],
        players: [],
        timers: {},
        categories: {},
        currentRound: {},
        people: {},
      },
      player: {
        name: 'Anon',
        clue: '',
        guess: '',
      },
      CATEGORY_ORDER: ['nouns', 'verbs', 'adjectives', 'compounds', 'custom'],
      showShareModal: false,
      showStandardModal: false,
      standardModal: undefined,
      newMod: '',
      wordsSaved: false,
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
        this.user.displayName || `${randomWord('adjectives')}-anon`
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
    'room.currentRound.state'(state) {
      this.$refs.timer?.reset()
      // Clean up past inputs when the round moves forward.
      if (state == 'GUESSING') {
        this.player.clue = ''
      } else if (state == 'DONE') {
        this.player.guess = ''
      }
    },
  },
  computed: {
    players() {
      return listPlayers(this.room)
    },
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
      return (
        this.user?.supporter === 'ADMIN' ||
        (this.room.people &&
          this.room.people[this.player.name]?.state === 'MOD')
      )
    },
    noMod() {
      return !Object.values(this.room.people || {}).some(
        (person) => person.state === 'MOD'
      )
    },
    totalRounds() {
      // Eg "Round 1 of 13"; "Round 13 of 13"; "Round 14 of 26"
      return 13 * (Math.floor(this.room.history.length / 13) + 1)
    },
    customWordList() {
      // If there are any commas, parse as csv; else, parse with whitespace
      let words = this.room.customWords.split(',')
      if (words.length <= 1) {
        words = this.room.customWords.split(/\s/)
      }
      // Lowercase and trim out whitespace; take out empty words
      return words.map((w) => w.toLowerCase().trim()).filter((w) => w)
    },
  },
  methods: {
    currentUrl() {
      // Ignore query params, since they may be used for guest login
      return window.location.href.split('?')[0]
    },
    dupes,
    dedupe,
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
    // TODO: only works after "people" is implemented
    uniquify(name) {
      this.player.name = name
    },
    async joinGame() {
      // Remove this and all other room.people == undefined checks after 2021-04-09
      if (!this.room.people) {
        this.room.people = {}
      }
      // Assumes player.name as already been uniquify'd
      this.room.people[this.player.name] = {
        id: this.user.id || '',
        supporter: this.user.supporter || '',
        state: 'PLAYING',
      }
      await this.saveRoom('people')
    },
    async resetRoom() {
      this.room = {
        name: this.room.name,
        currentRound: {
          state: 'CLUEING',
          guesser: this.player.name,
          guess: '',
          word: randomWord(),
          clues: {},
          category: 'nouns',
        },
        history: [],
        public: true,
        roundsInGame: 13,
        lastUpdateTime: Date.now(),
        timers: { CLUEING: '', GUESSING: '', DONE: '', running: false },
        categories: {
          nouns: true,
          verbs: false,
          adjectives: false,
          compounds: false,
          custom: false,
        },
        customWords: '',
        players: [], // For v1 compat support of dev rooms; remove after 2021-04-09
        people: {
          [this.player.name]: {
            id: this.user.id || '',
            supporter: this.user.supporter || '',
            state: 'MOD', // or 'PLAYING' or 'WATCHING'
          },
        },
      }
      await setRoom(this.room)
    },
    async kickPlayer(name) {
      await updateRoom(this.room, { [`people.${name}.state`]: 'WATCHING' })
    },
    async makeMod(name) {
      await updateRoom(this.room, {
        [`people.${this.player.name}.state`]: 'PLAYING',
        [`people.${name}.state`]: 'MOD',
      })
    },
    wordForWord(category) {
      return (
        {
          nouns: 'word',
          verbs: 'verb',
          adjectives: 'adjective',
          compounds: 'compound',
          custom: 'word',
        }[category] || 'word'
      )
    },
    hasSpecialCharacters(word) {
      return /[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(word)
    },
    async submitClue() {
      this.player.clue = this.player.clue.toLowerCase().trim()
      if (dupes(this.player.clue, this.room.currentRound.word)) {
        return
      }

      const update = {}
      update[`currentRound.clues.${this.player.name}`] = this.player.clue
      await updateRoom(this.room, update)

      // If all clues are in, move to guessing
      const doneCluing = this.players.every(
        (p) =>
          this.room.currentRound.clues[p] || p == this.room.currentRound.guesser
      )
      if (doneCluing) {
        await updateRoom(this.room, { 'currentRound.state': 'GUESSING' })
      }

      // Store this for user profiles, but don't await for the result
      updateUserGame(this.user.id, this.room.name)
    },
    async nextStage() {
      if (this.room.currentRound.state == 'CLUEING') {
        return await updateRoom(this.room, { 'currentRound.state': 'GUESSING' })
      } else if (this.room.currentRound.state == 'GUESSING') {
        return await updateRoom(this.room, { 'currentRound.state': 'DONE' })
      } else {
        return await this.newRound()
      }
    },
    async submitGuess() {
      const update = {
        'currentRound.guess': this.player.guess.toLowerCase().trim(),
        'currentRound.state': 'DONE',
      }
      await updateRoom(this.room, update)

      // Store this for user profiles, but don't await for the result
      updateUserGame(this.user.id, this.room.name)
    },
    async toggleRoundCorrect() {
      if (!['CHAMPION', 'SPONSOR', 'ADMIN'].includes(this.user.supporter)) {
        return this.showChampionModal()
      }
      await updateRoom(this.room, {
        'currentRound.markedCorrect': !this.room.currentRound.markedCorrect,
      })
    },
    async toggleHistoryCorrect(reverseIndex) {
      if (!['CHAMPION', 'SPONSOR', 'ADMIN'].includes(this.user.supporter)) {
        return this.showChampionModal()
      }
      // History is shown in reverse order, so we re-reverse the index
      const index = this.room.history.length - 1 - reverseIndex
      this.room.history[index].markedCorrect = !this.room.history[index]
        .markedCorrect
      // History is an array, so we overwrite the whole thing.
      // Note: Possible race condition with "Next Round"; could fix by object-ifying history
      await this.saveRoom('history')
    },
    async newRound(sameGuesser = false) {
      this.room.history.push(this.room.currentRound)
      const category = nextCategory(this.room.categories)
      this.room.currentRound = {
        state: 'CLUEING',
        guesser: sameGuesser
          ? this.room.currentRound.guesser
          : nextGuesser(this.room.currentRound.guesser, this.players),
        guess: '',
        word: nextWord(this.room.history, category, this.customWordList),
        clues: {},
        category,
      }
      this.room.lastUpdateTime = Date.now()

      // Overwrite existing room;
      await setRoom(this.room)
    },
    async toggleTimers() {
      this.room.timers.running = !this.room.timers.running
      await this.saveRoom('timers')
    },
    // Sync any number of properties of this.room to firebase
    async saveRoom(...props) {
      await updateRoom(
        this.room,
        Object.fromEntries(props.map((prop) => [prop, this.room[prop]]))
      )
    },
    async upsell(...props) {
      if (this.user.supporter) {
        await this.saveRoom(...props)
      } else {
        this.showSupporterModal()
        // Reset UI to non-supporter defaults
        this.room.public = true
        this.room.roundsInGame = 13
      }
    },
    showPrivateModal() {
      this.showStandardModal = true
      this.standardModal = {
        title: 'This room is private 🔒',
        text:
          'To join, ask your teammates for the room name or link.\n\nTo make your own private room, become a supporter!',
        buttons: {
          okay: 'Become a supporter!',
          cancel: 'Not now',
        },
        callbacks: {
          okay: () => {
            referSupporter('private_room_modal')
          },
        },
      }
    },
    showSupporterModal() {
      this.showStandardModal = true
      this.standardModal = {
        title: 'Want private rooms?',
        text:
          'Earn perks like private rooms, custom avatars, and more by becoming a supporter 😍',
        buttons: {
          okay: 'Okay!',
          cancel: 'Not now',
        },
        callbacks: {
          okay: () => {
            referSupporter('modtools')
          },
        },
      }
    },
    showChampionModal() {
      this.showStandardModal = true
      this.standardModal = {
        title: 'Mark this guess as correct?',
        text: 'Unlock this perk by becoming a One Word champion 😍',
        buttons: {
          okay: 'Okay!',
          cancel: 'Not now',
        },
        callbacks: {
          okay: () => {
            referSupporter('champion_modal')
          },
        },
      }
    },
    referSupporter,
    correct,
    isEnd,
    score,
  },
}
</script>

<style scoped>
.newline {
  white-space: pre-wrap;
}

.capitalize {
  text-transform: capitalize;
}

.comma:not(:last-child):after {
  content: ', ';
}

#custom-word-tags {
  overflow-x: auto;
  max-height: 100px;
}

.label {
  margin-top: 1rem;
}
</style>
