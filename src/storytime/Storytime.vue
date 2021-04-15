<template>
  <BigColumn :width="760" class="background">
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

    <div class="message room-box">
      <!-- Room header -->
      <div class="message-header has-text-weight-normal is-flex-wrap-wrap">
        <h1 class="fancy mt-1">Room: {{ room.name }}</h1>

        <!-- Navigation -->
        <span class="buttons are-small">
          <button
            class="button is-dark is-inverted is-outlined"
            @click="showShareModal = true"
          >
            Invite
          </button>
          <button
            v-if="room.players?.includes(player.name)"
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
          <router-link
            class="button is-danger is-inverted is-outlined"
            to="/storytime/"
            @click="kickPlayer(player.name)"
          >
            Exit
          </router-link>
        </span>
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
            </div>
            <template v-else>
              <span class="mx-2">
                {{ room.public ? 'Public' : 'Private' }} Room
              </span>
            </template>
          </span>

          <!-- Timers -->
          <span class="ml-1 mr-2 my-1 is-flex is-align-items-center">
            <template v-if="isMod">
              <label for="writing-timer" class="is-size-7 mx-1 is-flex-grow-1">
                Writing:
              </label>
              <input
                class="input is-small"
                style="flex: 1 2 48px"
                id="writing-timer"
                type="number"
                min="1"
                max="99"
                placeholder="&infin;"
                v-model.number="room.timers.RESPONSE"
                :disabled="room.timers.running"
              />
              <label for="choosing-timer" class="is-size-7 mx-1 is-flex-grow-1">
                Choosing:
              </label>
              <input
                class="input is-small"
                style="flex: 1 2 48px"
                id="choosing-timer"
                type="number"
                min="1"
                max="99"
                placeholder="&infin;"
                v-model.number="room.timers.CHOOSING"
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
              <template v-if="room.timers?.running">
                <span v-if="room.timers.RESPONSE" class="mx-2">
                  Writing: {{ room.timers.RESPONSE }}s
                </span>
                <span v-if="room.timers.CHOOSING" class="mx-2">
                  Choosing: {{ room.timers.CHOOSING }}s
                </span>
              </template>
              <span v-else class="mx-1">No timers</span>
            </template>

            <!-- Other Mod Tools -->
            <template v-if="isMod">
              <div class="field has-addons is-inline-flex mb-0 mx-1">
                <span class="control">
                  <button class="button is-small" @click="nextStage">
                    Next Stage
                  </button>
                </span>

                <span v-if="user.isAdmin" class="control">
                  <button class="button is-small" @click="resetRoom">
                    Reset Room
                  </button>
                </span>
              </div>
              <div class="field has-addons is-inline-flex mx-1">
                <span class="control">
                  <button class="button is-small" @click="makeMod(newMod)">
                    Transfer Mod
                  </button>
                </span>
                <span class="control">
                  <span class="select is-small">
                    <select v-model="newMod">
                      <option
                        v-for="player in room.players.slice(1)"
                        :key="player"
                      >
                        {{ player }}
                      </option>
                    </select>
                  </span>
                </span>
              </div>
            </template>
          </span>
        </div>
      </div>

      <div class="message-body" style="border-width: 0">
        <!-- Players -->
        <div class="field is-grouped is-grouped-multiline">
          <span class="mb-2 mr-2">Players:</span>
          <Nametag
            v-for="player in playersInScoreOrder"
            :key="player"
            :name="player"
            :user="room.playerData && room.playerData[player]"
            :submitted="hasSubmitted(player)"
            :guessing="
              room.currentRound.stage == 'CHOOSING' &&
              room.currentRound.chooser == player
            "
            :mod="isMod"
            :modtag="player === room.players[0]"
            :score="scores[player]"
            @kick="kickPlayer(player)"
          ></Nametag>
        </div>
      </div>
    </div>

    <ScrollBottom ref="history" class="block mx-4">
      <div style="height: 220px"></div>
      <History
        v-for="(round, i) in room.history"
        :key="i"
        :round="round"
        :scores="score(round)"
      />
      <div style="height: 280px"></div>
    </ScrollBottom>

    <div v-if="room.players.length < 3">
      <h2 class="fancy" role="alert">Waiting for 3 players...</h2>
      <p class="mt-5 mb-2">Invite your friends to play!</p>
      <ShareLink />
      <div class="card my-4">
        <div class="card-header">
          <h2 class="card-header-title">Optional: Choose a starting prompt</h2>
        </div>
        <div class="card-content">
          <Carousel :items-to-show="1" wrap-around>
            <Slide v-for="(prompt, i) in prompts" :key="prompt">
              <div class="has-text-left p-4 m-4">{{ prompt }}</div>
              <button
                class="button is-info px-6"
                @click="chooseStartingPrompt(i)"
              >
                Choose
              </button>
            </Slide>

            <template #addons>
              <Navigation />
              <Pagination />
            </template>
          </Carousel>
        </div>
      </div>
      <br />
    </div>
    <template v-else>
      <div class="card status-panel">
        <div class="card-content">
          <h2 class="fancy mt-0 is-size-5" aria-live="polite">
            {{ prettyStatus }}
          </h2>
          <!-- Prompt -->
          <template v-if="room.currentRound.state == 'PROMPT'">
            <template v-if="isChooser">
              <div class="field has-addons mt-2">
                <div class="control is-expanded">
                  <input
                    class="input is-large"
                    @keyup.enter="submitPrompt"
                    v-model="room.currentRound.prompt"
                    :placeholder="
                      randomWord('verbs') + ' ' + randomWord('nouns')
                    "
                  />
                </div>
                <div class="control">
                  <button class="button is-large" @click="submitPrompt">
                    Submit
                  </button>
                </div>
              </div>
            </template>
          </template>
          <!-- Response -->
          <template v-else-if="room.currentRound.state == 'RESPONSE'">
            <div class="is-size-5 mb-2">
              {{ room.currentRound.chooser }}&gt;
              {{ room.currentRound.prompt }}
            </div>
            <div class="field">
              <div class="control is-expanded">
                <textarea
                  class="textarea has-fixed-size"
                  id="responseInput"
                  rows="3"
                  v-model="player.response"
                  :class="{
                    'is-success': room.currentRound.responses[player.name],
                  }"
                  :disabled="!room.players.includes(player.name)"
                ></textarea>
              </div>
            </div>
            <div class="level">
              <div class="level-left" style="flex-shrink: 1">
                <span class="mr-2">Your bonus words:</span>
                <div class="tags">
                  <span
                    v-for="(word, i) in prettySuggestions"
                    :key="i"
                    class="tag"
                    :class="{
                      'is-link': player.response.toLowerCase().includes(word),
                    }"
                  >
                    {{ word }}
                  </span>
                </div>
              </div>
              <div class="level-right">
                <span
                  class="level-item help"
                  :class="{ 'has-text-danger': charCount > 280 }"
                >
                  {{ charCount }} / 280
                </span>
                <div class="level-item">
                  <button
                    class="button"
                    @click="submitResponse"
                    :class="{
                      'is-success': room.currentRound.responses[player.name],
                    }"
                    :disabled="
                      !room.players.includes(player.name) || charCount > 280
                    "
                  >
                    {{
                      room.currentRound.responses[player.name]
                        ? 'Submitted'
                        : 'Submit'
                    }}
                  </button>
                </div>
              </div>
            </div>
          </template>
          <!-- Choosing -->
          <template v-else-if="room.currentRound.state == 'CHOOSING'">
            <div class="is-size-5 mb-2">
              {{ room.currentRound.chooser }}&gt;
              {{ room.currentRound.prompt }}
            </div>
            <div
              class="control mb-1"
              v-for="[p, response] in Object.entries(
                room.currentRound.responses
              ).sort(([, responseA], [, responseB]) =>
                responseA.story > responseB.story ? 1 : -1
              )"
              :key="p"
            >
              <label class="spacy" v-if="p != player.name">
                <input
                  class="radio"
                  type="radio"
                  name="vote"
                  :value="p"
                  v-model="vote"
                />
                {{ response.story }}
              </label>
              <label class="spacy has-text-grey" v-else>
                <input class="radio" type="radio" disabled />
                {{ response.story }}
              </label>
            </div>
          </template>

          <Timer
            ref="timer"
            :length="timerLength"
            :on-finish="nextStage"
            v-if="timerLength > 0"
          ></Timer>
        </div>
      </div>
    </template>
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import Nametag from '../components/Nametag.vue'
import AnimatedModal from '../components/AnimatedModal.vue'
import ShareLink from '../components/ShareLink.vue'
import Timer from '../components/Timer.vue'
import History from './components/History.vue'
import ScrollBottom from './components/ScrollBottom.vue'

import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'

import {
  getRoom,
  listenForLogin,
  listenRoom,
  setRoom,
  referSupporter,
  updateRoom,
  updateUserGame,
} from '../firebase/network'
import { nextGuesser, capitalize } from '../oneword/oneword-utils.js'
import { randomWord } from '../words/lists'
import { inject } from 'vue'
import prompts from './prompts.js'

/**
   Room: {
     name: apple,
     players: ['alice', 'bob', 'carol'],
     currentRound: {
       state: 'PROMPT' // or 'RESPONSE' or 'CHOOSING'
       chooser: 'alice',
       prompt: 'Eat cake'
       responses: {
         alice: { story: 'You fall into a hole and die', words: ['hole'], votes: ['bob', 'carol'] }
         bob: { story: 'A dragon appears in front of you', words: [], votes: []},
         carol: { story: 'You start to hear a creepy chant', words: ['chant', 'creepy'], votes: ['alice'] }
       }
     }
     history: [{round1}, ...]
   }
*/

export default {
  components: {
    BigColumn,
    Nametag,
    AnimatedModal,
    ShareLink,
    Timer,
    History,
    ScrollBottom,
    Carousel,
    Slide,
    Pagination,
    Navigation,
  },
  setup() {
    return { user: inject('currentUser') }
  },
  data: () => ({
    room: {
      // name: randomWord('adjectives') + '-' + randomWord('nouns'),
      history: [],
      players: [],
      timers: {},
    },
    player: {
      name: '',
      response: '',
    },
    suggestions: {
      nouns: [randomWord('nouns'), randomWord('nouns'), randomWord('nouns')],
      verbs: [randomWord('verbs'), randomWord('verbs')],
      adjectives: [randomWord('adjectives'), randomWord('adjectives')],
    },
    showShareModal: false,
    newMod: '',
    prompts,
    vote: '',
  }),
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
      // Clean up past inputs and replace used words when the round moves forward.
      if (state == 'CHOOSING') {
        this.replaceSuggestions(this.player.response)
        this.player.response = ''
      }
      // reset vote
      if (state == 'PROMPT') {
        this.vote = ''
      }
    },
    'room.history'(history) {
      this.$refs.history?.stickToBottom()
    },
    vote(vote) {
      this.chooseResponse()
    },
  },
  computed: {
    timerLength() {
      if (this.room.currentRound && this.room?.timers.running) {
        return this.room.timers[this.room.currentRound.state]
      }
      return 0
    },
    isMod() {
      return (
        this.user?.isAdmin ||
        (this?.room.players && this.room.players[0] == this.player.name)
      )
    },
    isChooser() {
      return this.player.name == this?.room?.currentRound.chooser
    },
    prettyStatus() {
      if (this.room.currentRound.state == 'PROMPT') {
        return this.isChooser
          ? `What does ${this.user.displayName} do now?`
          : `${this.room.currentRound.chooser} is writing their next action`
      } else if (this.room.currentRound.state == 'RESPONSE') {
        return 'Write the next paragraph of this story'
      } else if (this.room.currentRound.state == 'CHOOSING') {
        return 'Choose what happens next. Fate is in your hands!'
      }
    },
    prettySuggestions() {
      // put suggestions in optimal order for creativity
      return [
        this.suggestions['nouns'][0],
        this.suggestions['verbs'][0],
        this.suggestions['adjectives'][0],
        this.suggestions['nouns'][1],
        this.suggestions['verbs'][1],
        this.suggestions['adjectives'][1],
        this.suggestions['nouns'][2],
      ]
    },
    playersInScoreOrder() {
      return [...this.room.players].sort(
        (a, b) => this.scores[b] - this.scores[a]
      )
    },
    charCount() {
      return this.player.response.length
    },
    voted() {
      return Object.values(this.room.currentRound.responses).flatMap(
        (r) => r.votes
      )
    },
    scores() {
      const scores = Object.fromEntries(
        this.room.players.map((player) => [player, 0])
      )
      // count backwards until the first round of the chapter
      for (let round of [...this.room.history].reverse()) {
        if (round.type === 'chapterEnd') {
          return scores
        }

        const roundScores = this.score(round)
        for (let player in roundScores) {
          scores[player] += roundScores[player]
        }
      }
      return scores
    },
  },
  methods: {
    randomWord,
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
      // If the player's name collides with another user's,
      // prepend adjectives until it is unique
      while (
        this.room.players.includes(this.player.name) &&
        (this.user.guest ||
          this.user.email != this.room.playerData[this.player.name].email)
      ) {
        this.player.name =
          capitalize(randomWord('adjectives')) + ' ' + this.player.name
      }
    },
    async joinGame() {
      // listenRoom(this)

      const { email = '', supporter = '' } = this.user
      this.room.playerData[this.player.name] = { email, supporter }

      if (this.room.players.includes(this.player.name)) {
        await this.saveRoom('playerData')
      } else {
        this.room.players.push(this.player.name)
        await this.saveRoom('playerData', 'players')
      }
    },
    async resetRoom() {
      this.room = {
        name: this.room.name,
        players: [this.player.name],
        currentRound: {
          state: 'PROMPT',
          chooser: this.player.name,
          responses: {},
        },
        history: [],
        public: true,
        lastUpdateTime: Date.now(),
        timers: { PROMPT: '', RESPONSE: '', CHOOSING: '', running: false },
        playerData: {
          [this.player.name]: {
            email: this.user.email || '',
            supporter: this.user.isSupporter || '',
          },
        },
      }
      await setRoom(this.room)
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
    async submitPrompt() {
      await updateRoom(this.room, {
        'currentRound.prompt': this.room.currentRound.prompt,
        'currentRound.state': 'RESPONSE',
      })
    },
    async submitResponse() {
      const update = {}
      //this.room.currentRound.responses[this.player.name].story = this.player.response;
      update[
        `currentRound.responses.${this.player.name}.story`
      ] = this.player.response
      const bonus = [
        ...this.suggestions['nouns'],
        ...this.suggestions['verbs'],
        ...this.suggestions['adjectives'],
      ].filter((word) => this.player.response.toLowerCase().includes(word))
      update[`currentRound.responses.${this.player.name}.words`] = bonus
      update[`currentRound.responses.${this.player.name}.votes`] = []

      // If all responses are in, move to choosing
      const done = this.room.players.every(
        (p) => this.room.currentRound.responses[p] || p == this.player.name
      )
      if (done) {
        update['currentRound.state'] = 'CHOOSING'
      }
      await updateRoom(this.room, update)

      // Store this for user profiles, but don't await for the result
      updateUserGame(this.user.id, this.room.name)
    },
    async chooseResponse() {
      // unvote if voted already
      Object.values(this.room.currentRound.responses).forEach((r) => {
        let i = r.votes.indexOf(this.player.name)
        if (i >= 0) {
          r.votes.splice(i, 1)
        }
      })
      // vote
      this.room.currentRound.responses[this.vote]?.votes?.push(this.player.name)
      await this.saveRoom('currentRound')
      // if all votes are in, go to next round
      if (this.room.players.every((p) => this.voted.includes(p))) {
        await this.nextStage()
      }
    },
    maxVotes(round) {
      return Math.max(
        ...Object.values(round.responses).map((resp) => resp.votes.length)
      )
    },
    score(round) {
      const maxVotes = this.maxVotes(round)
      return Object.fromEntries(
        Object.entries(round.responses).map((entry) => {
          const [name, resp] = entry
          return [
            name,
            resp.votes.length * (5 + resp.words.length) + resp.words.length,
          ]
        })
      )
    },
    hasSubmitted(player) {
      return (
        (this.room.currentRound.state == 'RESPONSE' &&
          !!this.room.currentRound.responses[player]) ||
        (this.room.currentRound.state == 'CHOOSING' &&
          this.voted.includes(player))
      )
    },
    async nextStage() {
      if (this.room.currentRound.state == 'PROMPT') {
        return await updateRoom(this.room, { 'currentRound.state': 'RESPONSE' })
      } else if (this.room.currentRound.state == 'RESPONSE') {
        // submit current text as response if player has not yet submitted
        if (!this.room.currentRound.responses[this.player.name]) {
          await this.submitResponse()
        }
        return await updateRoom(this.room, { 'currentRound.state': 'CHOOSING' })
      } else if (this.room.currentRound.state == 'CHOOSING') {
        return await this.newRound()
      }
    },
    async newRound() {
      this.room.history.push(this.room.currentRound)
      if (Object.values(this.scores).some((s) => s > 150)) {
        this.room.history.push({
          type: 'chapterEnd',
          chooser: 'End Chapter',
          responses: {
            ' ': {
              story:
                'The round has ended because someone got over 150 points.' +
                `\nScores for this round: ${JSON.stringify(this.scores)}` +
                '\nFeel free to continue if there is more to this tale!',
              words: [],
              votes: [],
            },
          },
        })
      }
      this.room.currentRound = {
        state: 'PROMPT',
        chooser: nextGuesser(this.room.currentRound.chooser, this.room.players),
        responses: {},
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
    // generate new suggestions to replace used words
    replaceSuggestions(response) {
      for (let category of ['verbs', 'nouns', 'adjectives']) {
        this.suggestions[category].forEach((word, i) => {
          if (response.toLowerCase().includes(word)) {
            this.suggestions[category][i] = randomWord(category)
          }
        })
      }
    },
    async chooseStartingPrompt(index) {
      this.room.history = [
        {
          type: 'premise',
          chooser: 'Premise',
          responses: {
            ' ': {
              story: this.prompts[index],
              words: [],
              votes: [],
            },
          },
        },
      ]
      await this.saveRoom('history')
    },
  },
}

// listenForLogin(vueApp);
</script>

<style scoped>
.background {
  background-color: #d6c6a2;
  background-image: linear-gradient(
    to right,
    rgb(245, 216, 178),
    rgb(181, 181, 255)
  );
}

.status-panel {
  margin: 0 auto;
  width: 760px;
  max-width: 95vw;
  border-radius: 16px;
  position: fixed;
  bottom: 0;
  z-index: 2;
}

.room-box {
  margin: 0 auto;
  max-width: 1000px;
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  z-index: 2;
}

.spacy {
  white-space: pre-wrap;
}

.label {
  margin-top: 20px;
}

.capitalize {
  text-transform: capitalize;
}

.tag {
  font-size: 0.875rem !important;
}
</style>
