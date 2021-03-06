<template>
  <BigColumn :showPanes="true">
    <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template>

    <div v-cloak id="modals">
      <!-- Share Link Modal -->
      <AnimatedModal
        :visible="showShareModal"
        @background-click="showShareModal = false"
      >
        <div class="notification">
          <label class="is-block mb-2">Invite your friends to play!</label>
          <ShareLink />
          <button
            class="delete"
            aria-label="close"
            @click="showShareModal = false"
          ></button>
        </div>
      </AnimatedModal>
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
            v-tippy="{ content: 'Supporter settings', placement: 'left' }"
            class="py-1 pl-1 pr-4"
            style="
              background: #ffef99;
              clip-path: polygon(0 0, 0 100%, 93% 100%, 100% 0);
            "
          >
            <div class="mx-1" v-if="isMod">
              <span class="select is-small">
                <select v-model="room.public" @change="upsell('public')">
                  <option :value="true">Public room</option>
                  <option :value="false">Private room</option>
                </select>
              </span>
            </div>
            <template v-else>
              <span class="mx-2"
                >{{ room.public ? 'Public' : 'Private' }} room</span
              >
            </template>
          </span>

          <!-- Timers -->
          <span class="ml-1 mr-2 my-1 is-flex is-align-items-center">
            <template v-if="isMod">
              <label for="clue-timer" class="is-size-7 is-flex-grow-1"
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
              <span class="is-size-7 mr-4 ml-1">secs</span>

              <label for="guess-timer" class="is-size-7 is-flex-grow-1"
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
              <span class="is-size-7 mr-4 ml-1">secs</span>

              <button class="button is-small" @click="toggleTimers">
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

          <!-- Player Categories -->
          <span class="mx-3" v-if="!isMod">
            <template v-for="category in enabledCategories">
              <span
                class="comma"
                :class="{
                  'has-text-weight-bold':
                    room.currentRound.category == category,
                }"
              >
                {{ WORD_LISTS[category].name }}</span
              >
            </template>
          </span>
        </div>
      </div>

      <div class="message-body" style="border-width: 0">
        <!-- Mod Categories -->
        <div v-if="showModTools">
          <div class="label mt-0">Basic Wordlists</div>
          <span class="field is-grouped is-grouped-multiline my-1">
            <div class="control" v-for="category in BASIC_LISTS">
              <label class="capitalize checkbox">
                <input
                  type="checkbox"
                  v-model="room.categories[category]"
                  @change="saveRoom('categories')"
                />
                {{ WORD_LISTS[category].name }}
              </label>
            </div>
          </span>
          <!-- Custom word editor -->
          <div
            v-if="room.categories['custom']"
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

          <div class="label">
            Themed Wordlists
            <a
              @click="referSupporter('themed_wordlist')"
              style="text-decoration: none"
              ><span class="tag is-warning ml-2">For champions!</span></a
            >
          </div>
          <div class="field is-grouped is-grouped-multiline my-1">
            <div class="control" v-for="category in VIDEO_GAME_LISTS">
              <label class="capitalize checkbox">
                <input
                  :disabled="!user.isChampion"
                  type="checkbox"
                  v-model="room.categories[category]"
                  @change="saveRoom('categories')"
                />
                {{ WORD_LISTS[category].name }}
              </label>
            </div>
          </div>
        </div>

        <!-- Other Mod Tools -->
        <div v-if="showModTools">
          <div class="label">Room Controls</div>
          <div class="field has-addons is-inline-flex mb-6">
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
            <span v-if="user.isAdmin" class="control">
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
                  <option v-for="player in room.players">
                    {{ player }}
                  </option>
                </select>
              </span>
            </span>
          </div>
        </div>

        <!-- Players -->
        <div class="field is-grouped is-grouped-multiline">
          <Nametag
            v-for="tagged in room.players"
            :key="tagged"
            :name="tagged"
            :user="room.people && room.people[tagged]"
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
        <div v-else-if="isMod">
          <a @click="player.modTools = !player.modTools">
            ({{ player.modTools ? 'Hide' : 'Show' }} mod tools)
          </a>
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
      <div v-if="room.players.length < 3">
        <h2 class="fancy" role="alert">Waiting for 3 players...</h2>
        <p class="mt-5 mb-2">Invite your friends to play!</p>
        <ShareLink />
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
                :disabled="!room.players.includes(player.name)"
              />
            </div>
            <div class="control">
              <button
                class="button"
                @click="submitClue"
                :disabled="
                  !room.players.includes(player.name) ||
                  dupes(player.clue || '', room.currentRound.word)
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
            v-if="dupes(player.clue || '', room.currentRound.word)"
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
        :supporter="user.isSupporter"
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
                WORD_LISTS[round.category].name
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
import Chatbox from '../components/Chatbox.vue'
import GameEnd from './GameEnd.vue'

import {
  setRoom,
  updateRoom,
  updateUserGame,
  referSupporter,
} from '../firebase/network'
import {
  correct,
  isEnd,
  score,
  dupes,
  dedupe,
  nextGuesser,
  nextWord,
} from './oneword-utils.js'
import { pickRandom } from '../utils.js'
import {
  randomWord,
  BASIC_LISTS,
  VIDEO_GAME_LISTS,
  WORD_LISTS,
  defaultCategories,
} from '../words/lists'
import { inject } from 'vue'
import { useRoom } from '../composables/useRoom'

function makeNewRoom(name) {
  return {
    name,
    people: {},
    currentRound: {
      state: 'CLUEING',
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
    categories: defaultCategories(),
    customWords: '',
  }
}

function onJoin(room, player) {
  if (!room.currentRound.guesser) {
    room.currentRound.guesser = player.name
    room.people[player.name].state = 'MOD'
  }
  player.clue = ''
  player.guess = ''
}

export default {
  components: {
    BigColumn,
    Nametag,
    AnimatedModal,
    ShareLink,
    Timer,
    GameEnd,
    Chatbox,
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom, onJoin)
    return Object.assign(roomHelpers, { user })
  },
  data() {
    return {
      BASIC_LISTS,
      VIDEO_GAME_LISTS,
      WORD_LISTS,
      showShareModal: false,
      newMod: '',
      wordsSaved: false,
    }
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
        this.user?.isAdmin ||
        (this.room.people &&
          this.room.people[this.player.name]?.state === 'MOD')
      )
    },
    showModTools() {
      return this.isMod && this.player.modTools
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
    enabledCategories() {
      return Object.keys(this.room.categories).filter(
        (c) => this.room.categories[c]
      )
    },
  },
  methods: {
    referSupporter,
    dupes,
    dedupe,
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
      return WORD_LISTS[category].inline
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
      const doneCluing = this.room.players.every(
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
      if (!this.user.isChampion) {
        return this.showChampionModal()
      }
      await updateRoom(this.room, {
        'currentRound.markedCorrect': !this.room.currentRound.markedCorrect,
      })
    },
    async toggleHistoryCorrect(reverseIndex) {
      if (!this.user.isChampion) {
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
      const category = pickRandom(this.enabledCategories)
      this.room.currentRound = {
        state: 'CLUEING',
        guesser: sameGuesser
          ? this.room.currentRound.guesser
          : nextGuesser(this.room.currentRound.guesser, this.room.players),
        guess: '',
        word: nextWord(this.room.history, category, this.customWordList),
        clues: {},
        category,
      }
      this.room.lastUpdateTime = Date.now()

      // Overwrite existing room;
      await this.saveRoom('history', 'currentRound', 'lastUpdateTime')
    },
    async toggleTimers() {
      this.room.timers.running = !this.room.timers.running
      await this.saveRoom('timers')
    },
    async upsell(...props) {
      if (this.user.isSupporter) {
        await this.saveRoom(...props)
      } else {
        this.showSupporterModal()
        // Reset UI to non-supporter defaults
        this.room.public = true
        this.room.roundsInGame = 13
      }
    },
    showSupporterModal() {
      this.$showModal({
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
      })
    },
    showChampionModal() {
      this.$showModal({
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
      })
    },
    showUniquifiedModal() {
      const oldName = this.player.name.split(' ').pop()
      this.$showModal({
        title: `You are now "${this.player.name}"!`,
        text: `Another "${oldName}" was already in this room...`,
      })
    },
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
