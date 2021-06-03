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
          <label class="is-block mb-2">{{
            $t('onewordGame.invitation')
          }}</label>
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
          {{
            $t('onewordGame.Round', {
              roundnumber: room.history.length + 1,
              totalround: totalRounds,
            })
          }}
        </h1>
        <a class="fancy" href="#" @click.prevent="showShareModal = true">{{
          room.name
        }}</a>
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
            <div class="mx-1" v-if="player.isMod">
              <span class="select is-small">
                <select v-model="room.public" @change="upsell('public')">
                  <option :value="true">
                    {{ $t('onewordGame.publicroom') }}
                  </option>
                  <option :value="false">
                    {{ $t('onewordGame.privateroom') }}
                  </option>
                </select>
              </span>
            </div>
            <template v-else>
              <span class="mx-2">{{
                room.public
                  ? $t('onewordGame.publicroom')
                  : $t('onewordGame.privateroom')
              }}</span>
            </template>
          </span>

          <!-- Timers -->
          <span class="ml-1 mr-2 my-1 is-flex is-align-items-center">
            <template v-if="player.isMod">
              <label for="clue-timer" class="is-size-7 is-flex-grow-1">{{
                $t('onewordGame.clue')
              }}</label>
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
              <span class="is-size-7 mr-4 ml-1">{{
                $t('onewordGame.sec')
              }}</span>

              <label for="guess-timer" class="is-size-7 is-flex-grow-1">{{
                $t('onewordGame.guess')
              }}</label>
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
              <span class="is-size-7 mr-4 ml-1">{{
                $t('onewordGame.sec')
              }}</span>

              <button class="button is-small" @click="toggleTimers">
                {{
                  room.timers.running
                    ? $t('onewordGame.stopTimers')
                    : $t('onewordGame.startTimers')
                }}
              </button>
            </template>
            <template v-else>
              <template v-if="room.timers.running">
                <span v-if="room.timers.CLUEING" class="mx-2">{{
                  $t('onewordGame.clueingTime', { time: room.timers.CLUEING })
                }}</span>
                <span v-if="room.timers.GUESSING" class="mx-2"
                  >{{
                    $t('onewordGame.guessingTime', {
                      time: room.timers.GUESSING,
                    })
                  }}
                </span>
              </template>
              <span v-else class="mx-1">{{ $t('onewordGame.noTimers') }}</span>
            </template>
          </span>

          <!-- Player Categories -->
          <span class="mx-3" v-if="!player.isMod">
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
          <div class="label mt-0">{{ $t('onewordGame.basicWordList') }}</div>
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
                  {{ $t('onewordGame.saved') }}
                </button>
                <!-- TODO: set wordsSaved = true on @click. -->
                <button
                  v-else
                  class="button is-small"
                  @click="saveRoom('customWords')"
                >
                  {{ $t('onewordGame.save') }}
                </button>
              </div>
            </div>
          </div>

          <div class="label">
            {{ $t('onewordGame.themedwordlists') }}
            <a
              @click="referSupporter('themed_wordlist')"
              style="text-decoration: none"
              ><span class="tag is-warning ml-2">{{
                $t('onewordGame.forChampion')
              }}</span></a
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
          <div class="label">{{ $t('onewordGame.roomControl') }}</div>
          <div class="field has-addons is-inline-flex mb-6">
            <span class="control">
              <button class="button is-small" @click="nextStage">
                {{ $t('onewordGame.nextStage') }}
              </button>
            </span>
            <span class="control">
              <button class="button is-small" @click="newRound(true)">
                {{ $t('onewordGame.skipWord') }}
              </button>
            </span>
            <span v-if="user.isAdmin" class="control">
              <button class="button is-small" @click="resetRoom">
                {{ $t('onewordGame.resetRoom') }}
              </button>
            </span>
          </div>
          <div class="field has-addons is-inline-flex">
            <span class="control">
              <button class="button is-small" @click="makeMod(newMod)">
                {{ $t('onewordGame.transferMod') }}
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
            :mod="player.isMod"
            :self="tagged === player.name"
            :modtag="room.people && room.people[tagged]?.state === 'MOD'"
            @kick="kickPlayer(tagged)"
          ></Nametag>
        </div>
        <div v-if="noMod">
          <button
            class="button is-ghost p-0"
            @click.prevent="makeMod(player.name)"
          >
            {{ $t('onewordGame.becometheMod') }}
          </button>
        </div>
        <div v-else-if="player.isMod">
          <a href="#" @click.prevent="player.modTools = !player.modTools">
            ({{
              player.modTools
                ? $t('onewordGame.hideModtools')
                : $t('onewordGame.showModtools')
            }}
            )
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
        <h2 class="fancy" role="alert">{{ $t('onewordGame.waitingText') }}</h2>
        <p class="mt-5 mb-2">{{ $t('onewordGame.invitation') }}</p>
        <ShareLink />
      </div>
      <div v-else-if="room.currentRound.guesser == player.name">
        <h2 class="fancy" role="alert">
          {{ $t('onewordGame.yourTurnText') }}
        </h2>
      </div>
      <div v-else>
        <div class="box">
          <h2 class="fancy has-text-centered" role="alert">
            {{
              $t('onewordGame.currentWordText', {
                wordCategory: wordForWord(room.currentRound.category),
                guesser: room.currentRound.guesser,
              })
            }}
            <br />
            <strong class="is-size-3">{{ room.currentRound.word }}</strong>
          </h2>
          <br />
          <label class="label" for="hintInput">{{
            $t('onewordGame.yourClue')
          }}</label>
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
                  dupes(player.clue || '', room.currentRound.word) ||
                  hasSpecialCharacters(player.clue)
                "
                :class="{
                  'is-primary': room.currentRound.clues[player.name],
                }"
              >
                {{
                  room.currentRound.clues[player.name]
                    ? $t('onewordGame.submitted')
                    : $t('onewordGame.submit')
                }}
              </button>
            </div>
          </div>
          <div
            class="notification is-danger"
            role="alert"
            v-if="dupes(player.clue || '', room.currentRound.word)"
          >
            {{ $t('onewordGame.similarclueText') }}
          </div>
          <div
            class="notification is-danger"
            role="alert"
            v-else-if="hasSpecialCharacters(player.clue)"
          >
            {{ $t('onewordGame.realwordText') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input area (guessing) -->
    <div v-if="room.currentRound.state == 'GUESSING'">
      <div v-if="room.currentRound.guesser == player.name">
        <div class="box">
          <h2 class="fancy" role="alert">
            {{
              $t('onewordGame.guesserClues', {
                wordCategory: wordForWord(room.currentRound.category),
              })
            }}
          </h2>
          <div class="fancy newline">
            {{ dedupe(room.currentRound.clues, false) }}
          </div>
          <label class="label" for="guess-input">{{
            $t('onewordGame.yourGuess')
          }}</label>
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
              <button class="button" @click="submitGuess">
                {{ $t('onewordGame.submit') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <h2 class="fancy" role="alert">
          {{
            $t('onewordGame.waitingGuesserText', {
              guesser: room.currentRound.guesser,
            })
          }}
        </h2>
        <div class="fancy">
          {{
            $t('onewordGame.cluesforText', {
              word: room.currentRound.word,
            })
          }}
          <!--The clues for
          <strong>{{ room.currentRound.word }}</strong> were:-->
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
          {{
            $t('onewordGame.correctWordText', { word: room.currentRound.word })
          }}
        </h2>
      </div>
      <div v-else>
        <h2 class="fancy has-text-danger" role="alert">
          {{
            $t('onewordGame.wrongGuessText', {
              guesser: room.currentRound.guesser,
              guessword: room.currentRound.guess,
              word: room.currentRound.word,
            })
          }}
        </h2>
        <button
          v-if="!correct(room.currentRound)"
          class="button is-ghost p-0"
          style="height: inherit"
          @click.prevent="toggleRoundCorrect"
        >
          {{ $t('onewordGame.markCorrect') }}
        </button>
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
      <button v-else class="button" @click="newRound(false)">
        {{ $t('onewordGame.nextRound') }}
      </button>
    </div>
    <br />

    <!-- Notify user if they're spectating -->
    <div
      v-cloak
      class="notification is-info is-light"
      v-if="!user.canPlay || room.people[player.name]?.state === 'WATCHING'"
    >
      <span class="subtitle">{{ $t('onewordGame.spectatingText') }}</span>
      <div class="buttons mt-3">
        <button class="button is-primary" @click="enterRoom">
          <strong>{{ $t('onewordGame.joinGame') }}</strong>
        </button>
        <router-link class="button is-ghost" to="/">{{
          $t('onewordGame.backHome')
        }}</router-link>
      </div>
    </div>

    <br />
    <!-- History -->
    <h2 v-if="room.history.length > 0" class="fancy">
      {{ $t('onewordGame.history') }}
    </h2>
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
            {{ $t('onewordGame.guessHistory', { guesser: round.guesser })
            }}<b
              :class="correct(round) ? 'has-text-success' : 'has-text-danger'"
              >{{ round.guess }}</b
            >"
          </p>
        </div>
      </div>
      <button
        v-if="!correct(round)"
        class="button is-ghost is-small p-0"
        style="height: inherit"
        @click="toggleHistoryCorrect(i)"
      >
        {{ $t('onewordGame.markCorrect') }}
      </button>
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
  // Add a default list of custom words for a conference.
  const categories = defaultCategories()
  let customWords = ''

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
    categories,
    customWords,
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
  mounted() {
    // Override color for conference pages. Kinda hacky...
    if (window.location.pathname.startsWith('/asplos-2021')) {
      const bgElement = document.querySelector('.background')
      bgElement.style.backgroundImage =
        'linear-gradient(hsl(313, 77%, 93%), hsl(313, 77%, 93%) 66%, hsl(6, 83%, 88%))'
      bgElement.style.backgroundAttachment = 'fixed'
    }
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
    showModTools() {
      return this.player.isMod && this.player.modTools
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
    wordForWord(category) {
      return WORD_LISTS[category].inline
    },
    hasSpecialCharacters(word) {
      return /[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(word)
    },
    async submitClue() {
      this.player.clue = this.player.clue.toLowerCase().trim()
      if (
        dupes(this.player.clue, this.room.currentRound.word) ||
        this.hasSpecialCharacters(this.player.clue)
      ) {
        // Just ignore invalid clues (ie too similar, or special chars)
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
      this.room.history[index].markedCorrect =
        !this.room.history[index].markedCorrect
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
        text: 'Earn perks like private rooms, custom avatars, and more by becoming a supporter 😍',
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
