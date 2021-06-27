<template>
  <BigColumn :showPanes="true">
    <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template>

    <template #left-pane>
      <History
        :scoreHistories="tallyScores().scoreHistories"
        :state="room.currentRound.state"
      ></History>
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
          Pairwise | Round {{ room.history.length + 1 }}
        </h1>
        <!-- TODO: how to make showShareModal more obvious? -->
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
            <div class="mx-1" v-if="player.isMod">
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
          <span
            class="message-body is-flex is-align-items-center"
            style="border-width: 0"
          >
            <template v-if="player.isMod">
              <label for="cluer-picking-timer" class="is-size-7 is-flex-grow-1"
                >Clueing:</label
              >
              <input
                class="input is-small"
                style="flex: 1 2 48px"
                id="cluer-picking-timer"
                type="number"
                min="1"
                max="99"
                placeholder="&infin;"
                v-model.number="room.timers.CLUER_PICKING"
                :disabled="room.timers.running"
              />
              <span class="is-size-7 mr-4 ml-1">secs</span>

              <label for="toss-in-decoys-timer" class="is-size-7 is-flex-grow-1"
                >Decoys:</label
              >
              <input
                class="input is-small"
                style="flex: 1 2 48px"
                id="toss-in-decoys-timer"
                type="number"
                min="1"
                max="99"
                placeholder="&infin;"
                v-model.number="room.timers.TOSS_IN_DECOYS"
                :disabled="room.timers.running"
              />
              <span class="is-size-7 mr-4 ml-1">secs</span>

              <label for="guessing-timer" class="is-size-7 is-flex-grow-1"
                >Guess:</label
              >
              <input
                class="input is-small"
                style="flex: 1 2 48px"
                id="guessing-timer"
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
                <span class="mx-4"><strong> Timers </strong></span>
                <span v-if="room.timers.CLUER_PICKING" class="mx-2"
                  >Clueing: {{ room.timers.CLUER_PICKING }}s</span
                >
                <span v-if="room.timers.TOSS_IN_DECOYS" class="mx-2"
                  >Decoys: {{ room.timers.TOSS_IN_DECOYS }}s</span
                >
                <span v-if="room.timers.GUESSING" class="mx-2"
                  >Guess: {{ room.timers.GUESSING }}s</span
                >
              </template>
              <span v-else class="mx-1">No timers</span>
            </template>
          </span>
          <!-- Enable categories for Pairwise -->
          <!-- <span class="mx-3" v-if="!player.isMod">
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
        </span> -->
        </div>
      </div>
      <div class="message-body" style="border-width: 0">
        <!-- Mod Tools -->
        <div v-if="showModTools" style="margin: auto">
          <div class="label">Room Controls</div>
          <div class="field has-addons is-inline-flex mb-6">
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
          <div class="field has-addons is-inline-flex">
            <span class="control">
              <button class="button is-small" @click="makeMod(newMod)">
                Transfer Mod
              </button>
            </span>
            <span class="control">
              <span class="select is-small">
                <select v-model="newMod">
                  <option
                    v-for="player in room.players"
                    v-bind:key="player.name"
                  >
                    {{ player }}
                  </option>
                </select>
              </span>
            </span>
          </div>
        </div>

        <!-- Players -->
        <div class="field is-grouped is-grouped-multiline">
          <!-- TODO: add guessing under submitted-->
          <Nametag
            v-for="playerScore in tallyScores().playerScores"
            :key="playerScore[0]"
            :name="playerScore[0]"
            :user="room.people && room.people[playerScore[0]]"
            :submitted="isColorSubmitted(playerScore[0])"
            :guessing="isColorGuessing(playerScore[0])"
            :mod="player.isMod"
            :self="playerScore[0] === player.name"
            :modtag="
              room.people && room.people[playerScore[0]]?.state === 'MOD'
            "
            :score="playerScore[1]"
            @kick="kickPlayer(playerScore[0])"
          ></Nametag>
        </div>
        <div v-if="noMod && room.people[player.name]?.state !== 'WATCHING'">
          <a @click="makeMod(player.name)"> (Become the mod...) </a>
        </div>
        <div v-else-if="player.isMod">
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

    <!-- Notify user if they're spectating -->
    <div
      v-cloak
      class="notification is-info is-light"
      v-if="!user.canPlay || room.people[player.name]?.state === 'WATCHING'"
    >
      <span class="subtitle">You are currently spectating this game!</span>
      <div class="buttons mt-3">
        <button class="button is-primary" @click="spectatorJoinsGame">
          <strong>Join game</strong>
        </button>
        <router-link class="button is-ghost" to="/">Back to home</router-link>
      </div>
    </div>

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
        <!-- If player does not have an entry in room's wordsAndClues, prompt to submit word and clue-->
        <!-- This works because we don't re-enter state=CLUER_PICKING until wordsAndClues becomes empty -->
        <div v-if="!room.wordsAndClues[player.name]">
          <div class="box clearfix">
            <h2 class="fancy has-text-centered" role="alert">
              Pick a phrase among the following, and construct a clue that
              describes it in the clue box!
              <br /><br />
              <button
                class="button is-rounded"
                @click="cluerSelectsWord(word)"
                v-for="word in player.pairList"
                :key="word"
                :class="{ 'is-info': player.currentWord == word }"
              >
                {{ word }}
              </button>
            </h2>
            <br />
            <div class="tabs is-right">
              <ul>
                <li
                  :class="{ 'is-active': !player.enablePictureClue }"
                  v-on:click="toggleClueType('text')"
                >
                  <a>Text Clue</a>
                </li>
                <li
                  :class="{ 'is-active': player.enablePictureClue }"
                  v-on:click="toggleClueType('picture')"
                >
                  <a>Picture Clue</a>
                </li>
              </ul>
            </div>
            <div v-show="player.enablePictureClue" class="container">
              <section>
                <div class="row">
                  <!-- <div class="two-thirds column"> -->
                  <div ref="sketchpad"></div>
                  <!-- </div> -->
                  <!-- <div class="toolbox one-third column">
                    <label for="line-color-input">Set Line Color</label>
                    <input
                      class="u-full-width"
                      type="text"
                      value="#000000"
                      id="line-color-input"
                    />
                    <label for="line-size-input">Set Line Size</label>
                    <input
                      class="u-full-width"
                      type="number"
                      value="5"
                      id="line-size-input"
                    />
                    <div class="row">
                      <div class="one-half column">
                        <button class="u-full-width" id="undo">Undo</button>
                      </div>
                      <div class="one-half column">
                        <button class="u-full-width" id="redo">Redo</button>
                      </div>
                      <button class="u-full-width no-margin" id="clear">
                        Clear
                      </button>
                      <div class="docs-section text-center">
                        <p>Read and write sketchpad data</p>
                        <div class="row">
                          <div class="one-half column">
                            <a
                              class="button u-full-width"
                              id="uploadJson"
                              download="image.png"
                              >Upload JSON</a
                            >
                            <input
                              type="file"
                              id="uploadJsonInput"
                              style="position: fixed; top: -100em"
                              accept="application/json"
                            />
                          </div>
                          <div class="one-half column">
                            <a
                              class="button u-full-width"
                              id="downloadJson"
                              download="data.json"
                              >Download JSON</a
                            >
                          </div>
                          <a
                            class="button u-full-width"
                            id="downloadPng"
                            download="image.png"
                            >Download PNG</a
                          >
                        </div>
                      </div> -->
                  <!-- </div>
                  </div> -->
                </div>
              </section>
            </div>
            <div v-show="!player.enablePictureClue">
              <div class="control is-expanded">
                <input
                  class="input"
                  id="hintInput"
                  type="text"
                  v-model="player.currentClue"
                  @keyup.enter="submitClue"
                  :class="{ 'is-primary': true }"
                  :disabled="!room.players.includes(player.name)"
                />
              </div>
            </div>
            <span v-if="player.showPickClueWarning" class="has-text-danger">
              (Pick a word pair AND construct a clue!)
            </span>
            <!-- todo: better alternative to visibility hidden -->
            <span v-else style="visibility: hidden">
              (Pick a word pair AND construct a clue!)
            </span>
            <div>
              <div class="control">
                <!-- TODO: add tool tip to show why button is disabled https://wikiki.github.io/elements/tooltip/ -->
                <button
                  class="button is-pulled-right"
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
            {{ room.players.length - Object.keys(room.wordsAndClues).length }}
            more player(s) to pick a phrase and a clue...
          </h2>
          <br />
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
            <div v-if="!room.wordsAndClues[room.currentRound.clueGiver]">
              <strong> did not write a clue :/ </strong>
            </div>
            <div v-else>
              <div
                v-if="
                  isDataURL(
                    room.wordsAndClues[room.currentRound.clueGiver].clue
                  )
                "
              >
                <img
                  v-bind:src="
                    room.wordsAndClues[room.currentRound.clueGiver].clue
                  "
                  alt="Clue"
                />
              </div>
              <div v-else>
                <strong>
                  {{ room.wordsAndClues[room.currentRound.clueGiver].clue }}
                </strong>
              </div>
            </div>
          </h2>
          <br />
          <h2 class="has-text-centered" role="alert">
            Pick one option from each word category to construct a decoy phrase
            best matching
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
              <br />
              <br />
              <div class="has-text-centered">
                <button
                  class="button is-small is-info is-outlined"
                  @click="refreshDecoyAdjectivesList"
                  :disabled="player.decoyAdjectivesRefreshCount === 0"
                >
                  <span>
                    <strong class="fa-stack-1x">
                      Refresh Adjectives x
                      {{ player.decoyAdjectivesRefreshCount }}
                    </strong>
                  </span>
                </button>
              </div>
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
              <br />
              <br />
              <div class="has-text-centered">
                <button
                  class="button is-small is-info is-outlined"
                  @click="refreshDecoyNounsList"
                  :disabled="player.decoyNounsRefreshCount === 0"
                >
                  <span>
                    <strong class="fa-stack-1x">
                      Refresh Nouns x {{ player.decoyNounsRefreshCount }}
                    </strong>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div class="has-text-centered">
            <strong> Your decoy phrase: </strong>
            <span v-if="player.decoyAdj || player.decoyNoun">
              "{{ player.decoyAdj }}-{{ player.decoyNoun }}"
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
            Waiting for other players to toss in decoys based on your clue...
          </h2>
          <br />
          <div
            v-if="
              isDataURL(room.wordsAndClues[room.currentRound.clueGiver].clue)
            "
          >
            <img
              v-bind:src="room.wordsAndClues[room.currentRound.clueGiver].clue"
              alt="Clue"
            />
          </div>
          <div v-else>
            <strong>
              {{ room.wordsAndClues[room.currentRound.clueGiver].clue }}
            </strong>
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
      <!-- Also can't guess if you ain't in the game -->
      <div class="box">
        <div
          v-if="
            room.currentRound.clueGiver == player.name ||
            !room.players.includes(player.name)
          "
        >
          <h2 class="fancy has-text-centered" role="alert">
            <button
              class="button is-rounded"
              v-for="word in Object.values(room.currentRound.allWords).sort()"
              :disabled="true"
              :key="word"
              :class="{
                'is-success': Object.values(room.currentRound.votes).includes(
                  word
                ),
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
            {{ room.currentRound.clueGiver }} among the decoys.. ? <br /><br />
            <button
              class="button is-rounded"
              @click="submitVote(word)"
              v-for="word in Object.values(room.currentRound.allWords).sort()"
              :key="word"
              :disabled="room.currentRound.allWords[player.name] == word"
              :class="{
                'is-success': room.currentRound.votes[player.name] == word,
              }"
            >
              {{ word }}
            </button>
          </h2>
          <h2 class="fancy has-text-centered">
            Your clue from {{ room.currentRound.clueGiver }}:
          </h2>
          <div class="fancy has-text-centered newline">
            <div
              v-if="
                isDataURL(room.wordsAndClues[room.currentRound.clueGiver].clue)
              "
            >
              <img
                v-bind:src="
                  room.wordsAndClues[room.currentRound.clueGiver].clue
                "
                alt="Clue"
              />
            </div>
            <div v-else>
              <strong>
                {{ room.wordsAndClues[room.currentRound.clueGiver].clue }}
              </strong>
            </div>
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
            room.wordsAndClues[room.currentRound.clueGiver]
              ? room.wordsAndClues[room.currentRound.clueGiver].word
              : 'did not pick a word :/'
          }}"!
        </h2>
        <br />
      </div>
      <div class="box">
        <div v-for="(vote, player) in room.currentRound.votes" :key="player">
          <strong> {{ player }} </strong> guessed "{{ vote }}"!
        </div>
      </div>
      <div v-if="room.gameOver">
        <div class="box">
          And that's it! <strong> {{ room.gameWinner }} </strong> won with "{{
            room.winnerPoints
          }}
          points"!
        </div>
        <button class="button play-again" @click="newRound()">
          Play Again
        </button>
      </div>
      <button v-else class="button" @click="newRound()">Next</button>
    </div>
    <button class="collapsible" @click="showGameRules = !showGameRules">
      How the game works
    </button>
    <div
      class="content"
      :style="{
        'max-height': !showGameRules ? '0px' : 'inherit',
        padding: !showGameRules ? '0px' : '18px',
      }"
    >
      <strong>1)</strong> Each player picks a pair of words from a randomly
      generated list, and writes a clue of any length that relates to that pair
      <br />
      <strong>2)</strong> In each round, players try to construct decoys they
      think best matches each others' clues <br />
      <strong>3)</strong> Once all decoys are submitted, players try to guess
      the real word pair among the decoys
      <br />
      <br />
      Decoys that trick more people earn the most points! Clues that are too
      obvious (everyone guessed right) or too offbeat (nobody guessed right)
      will hold you back!
      <strong> First player to reach 30 points wins! </strong>
    </div>

    <div class="is-hidden-widescreen">
      <History
        :scoreHistories="tallyScores().scoreHistories"
        :state="room.currentRound.state"
      ></History>
    </div>
    <br /><br />
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import Nametag from '../components/Nametag.vue'
import AnimatedModal from '../components/AnimatedModal.vue'
import ShareLink from '../components/ShareLink.vue'
import ScoreRules from './ScoreRules.vue'
import History from './History.vue'
import Timer from '../components/Timer.vue'
import Chatbox from '../components/Chatbox.vue'

import {
  setRoom,
  updateRoom,
  updateUserGame,
  referSupporter,
} from '../firebase/network.js'
import { inject } from 'vue'
import { randomWord } from '../words/lists'
import { useRoom } from '../composables/useRoom'
import Sketchpad from 'responsive-sketchpad'

function makeNewRoom(name) {
  return {
    name: name,
    // players array will be computed from this room.people
    people: {},
    // Each round has its own object.
    currentRound: {
      // States can be 'CLUER_PICKING' 'TOSS_IN_DECOYS' 'GUESSING' and 'DONE'
      state: 'CLUER_PICKING',
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
    gameOverThreshold: 30,
    gameWinner: '',
    winnerPoints: '',
    // history of previous rounds
    history: [],
    public: true,
    lastUpdateTime: Date.now(),
    timers: {
      CLUER_PICKING: '',
      TOSS_IN_DECOYS: '',
      GUESSING: '',
      DONE: '',
      running: false,
    },
    // Todo: add categories
    customWords: '',
  }
}

function initializePlayerOnJoin(_room, player) {
  // enable picture-based clues
  player.enablePictureClue = false
  // dummy sketchpad
  player.sketchpad = ''
  // cache's player's choice for word on the player object, to reduce room update freq
  player.currentWord = ''
  // cache's player's choice for clue on the player object, to reduce room update freq
  player.currentClue =
    '' /** player's clue can be either String or Sketchpad PNG */
  // whether to show pick pair AND write clue warning, used to guard clue submit
  player.showPickClueWarning = false
  // how many entries in the pairList to pick out real pair
  player.choicesOfWordPairs = 7
  // pairlist array to choose from for picking out real pairs
  player.pairList = []
  // how many options (of adj, verb etc) to construct decoy
  player.choicesPerDecoyCategory = 7
  // decoy adj & list
  player.decoyAdj = ''
  player.decoyAdjList = []
  player.decoyAdjectivesRefreshCount = 3
  // decoy noun & list
  player.decoyNoun = ''
  player.decoyNounList = []
  player.decoyNounsRefreshCount = 3
  // TODO: extract out to common generatePlayerWordPairs()
  while (player.pairList.length < player.choicesOfWordPairs) {
    player.pairList.push(randomWord('adjectives') + '-' + randomWord('nouns'))
  }
}

export default {
  components: {
    BigColumn,
    Nametag,
    AnimatedModal,
    ShareLink,
    Timer,
    ScoreRules,
    History,
    Chatbox,
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom, initializePlayerOnJoin)
    return Object.assign(roomHelpers, { user })
  },
  mounted() {
    this.registerSketchPad()
  },
  data() {
    return {
      showShareModal: false,
      showGameRules: false,
      newMod: '',
    }
  },
  watch: {
    'room.currentRound.state'(state) {
      this.$refs.timer?.reset()
      if (state === 'CLUER_PICKING') {
        this.player.currentWord = ''
        this.player.currentClue = ''
        // conditional ref element 'sketchpad' previously not rendered in vue-if/else
        this.registerSketchPad()
      }
      if (state === 'TOSS_IN_DECOYS') {
        // reset decoys wordlist
        this.player.decoyAdjList = this.generateDecoyWordList('adjectives')
        this.player.decoyNounList = this.generateDecoyWordList('nouns')
      }
      // reset decoys
      if (state === 'GUESSING') {
        this.player.decoyAdj = ''
        this.player.decoyNoun = ''
      }
    },
    'room.players.length'(newLength, oldLength) {
      // if player length didn't trigger re-render, then don't register `sketchpad`
      if (oldLength >= 3 || newLength < 3) {
        return
      }
      // conditional ref element 'sketchpad' previously not rendered in vue-if/else
      this.registerSketchPad()
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
  },
  methods: {
    async upsell(...props) {
      if (this.user.isSupporter) {
        await this.saveRoom(...props)
      } else {
        this.showSupporterModal()
        // Reset UI to non-supporter defaults
        this.room.public = true
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
    async spectatorJoinsGame() {
      await this.enterRoom()
      initializePlayerOnJoin(this.room, this.player)
      this.player.decoyAdjList = this.generateDecoyWordList('adjectives')
      this.player.decoyNounList = this.generateDecoyWordList('nouns')
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
      return shouldColorBeSubmitted
    },
    // for nametags, `guessing` has dark blue color. Technically this color applies to the
    // 'ClueGiver' in Pairwise, not the 'Guesser's, but we are reusing prop name from OneWord
    isColorGuessing(playerName) {
      // If still picking the pair and giving clues, no one is actually guessing
      if (this.room.currentRound.state === 'CLUER_PICKING') {
        return false
      }
      // otherwise in TOSS_IN_DECOYS and GUESSING phase, guesser is the clueGiver
      return this.room.currentRound.clueGiver === playerName
    },
    toggleClueType(type) {
      if (type === 'text') {
        this.player.enablePictureClue = false
      }
      if (type === 'picture') {
        this.player.enablePictureClue = true
      }
      this.player.currentClue = ''
      this.player.showPickClueWarning = ''
    },
    isClueSubmitDisabled() {
      if (!this.room.players.includes(this.player.name)) {
        return true
      }
      return false
    },
    async cluerSelectsWord(w) {
      this.player.currentWord = w
      this.player.showPickClueWarning = false
    },
    // method simply registers the ref 'sketchpad' w/ Sketchpad component
    registerSketchPad() {
      // only register if `sketchpad` is conditionally rendered (dup logic as in template)
      if (
        this.room.currentRound.state !== 'CLUER_PICKING' ||
        this.room.players.length < 3 ||
        this.room.wordsAndClues[this.player.name]
      ) {
        return
      }
      // $nextTick ensures code is executed after the next DOM update cycle.
      // https://stackoverflow.com/questions/53578419
      this.$nextTick(function () {
        if (this.$refs.sketchpad) {
          // register a new sketchpad
          this.player.sketchpad = new Sketchpad(this.$refs.sketchpad, {
            backgroundColor: '#FFFFFF',
            line: { size: 5 },
            width: 500,
            height: 350,
          })
        } else {
          console.log('sketchpad does not exist')
        }
      })
    },
    async submitClue() {
      // Show warning if clue giver hasn't picked a word yet
      if (!this.player.currentWord) {
        this.player.showPickClueWarning = true
        return
      }

      // Clue is picture based, allow empty sketchpad to be stringified
      if (this.player.enablePictureClue) {
        const picture = this.player.sketchpad.canvas.toDataURL('image/png')
        this.player.currentClue = picture
      }
      // clue is text based, so check if it's empty and disallow if so
      else {
        if (!this.player.currentClue) {
          this.player.showPickClueWarning = true
          return
        }
      }

      // reset to false if previously it was true :)
      this.player.showPickClueWarning = false

      const fieldsToSave = []

      // sync chosen word and clue from local player to the room's list of words & clues
      this.room.wordsAndClues[`${this.player.name}`] = {
        word: this.player.currentWord,
        clue: this.player.currentClue,
      }
      fieldsToSave.push(`wordsAndClues.${this.player.name}`)

      // Set clueGiver if it's not already set
      if (!this.room.currentRound.clueGiver) {
        this.room.currentRound.clueGiver = this.player.name
        fieldsToSave.push(`currentRound.clueGiver`)
      }

      // if player is the current clueGiver, immediately save word to all words this round
      if (this.room.currentRound.clueGiver === this.player.name) {
        this.room.currentRound.allWords[
          this.player.name
        ] = this.player.currentWord
        fieldsToSave.push(`currentRound.allWords.${this.player.name}`)
      }

      // if this is the last player to submit a clue, change state
      const allCluesSubmitted = this.room.players.every(
        (p) => this.room.wordsAndClues[p]
      )
      if (allCluesSubmitted) {
        this.room.currentRound.state = 'TOSS_IN_DECOYS'
        fieldsToSave.push(`currentRound.state`)
      }
      await this.saveRoom(...fieldsToSave)

      // reset pairList and regenerated it
      this.player.pairList = []
      this.generatePlayerPairList()

      // Store this for user profiles, but don't await for the result
      updateUserGame(this.user.id, this.room.name)
    },
    isDataURL(clue) {
      const regex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i
      return !!clue.match(regex)
    },
    isDecoySubmitDisabled() {
      if (!this.room.players.includes(this.player.name)) {
        return true
      }
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
    refreshDecoyNounsList() {
      this.player.decoyNounList = this.generateDecoyWordList('nouns')
      this.player.decoyNounsRefreshCount -= 1
    },
    refreshDecoyAdjectivesList() {
      this.player.decoyAdjList = this.generateDecoyWordList('adjectives')
      this.player.decoyAdjectivesRefreshCount -= 1
    },
    async submitDecoy() {
      await this.saveWordToAllWordsThisRound(
        this.player.decoyAdj + '-' + this.player.decoyNoun
      )
      const allDecoysCollected = this.room.players.every(
        (p) => this.room.currentRound.allWords[p]
      )
      if (allDecoysCollected) {
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
      // If all votes are in, move on to DONE to show score!
      const doneVoting = this.room.players.every(
        (p) =>
          this.room.currentRound.votes[p] ||
          p == this.room.currentRound.clueGiver
      )
      if (doneVoting) {
        this.room.currentRound.state = 'DONE'
        this.room.history.push(this.room.currentRound)
        await setRoom(this.room)
      }
    },
    async nextStage() {
      if (this.room.currentRound.state == 'CLUER_PICKING') {
        return await updateRoom(this.room, {
          'currentRound.state': 'TOSS_IN_DECOYS',
        })
      } else if (this.room.currentRound.state == 'TOSS_IN_DECOYS') {
        return await updateRoom(this.room, { 'currentRound.state': 'GUESSING' })
      } else if (this.room.currentRound.state == 'GUESSING') {
        this.room.currentRound.state = 'DONE'
        this.room.history.push(this.room.currentRound)
        return await this.saveRoom('currentRound.state', 'history')
      } else {
        return await this.newRound()
      }
    },
    generatePlayerPairList() {
      while (this.player.pairList.length < this.player.choicesOfWordPairs) {
        this.player.pairList.push(
          randomWord('adjectives') + '-' + randomWord('nouns')
        )
      }
    },
    // Currently decoy wordlist is either all nouns or all adjectives
    generateDecoyWordList(type) {
      const list = []
      while (list.length < this.player.choicesPerDecoyCategory) {
        const w = randomWord(type)
        if (!list.includes(w)) {
          list.push(w)
        }
      }
      return list
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
        // Also reset players refresh count
        this.players.decoyWordsRefreshCount = 3
      }

      this.room.lastUpdateTime = Date.now()

      // Overwrite existing room;
      await setRoom(this.room)
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
        const realPairThisRound = round.allWords[round.clueGiver]
        const historyThisRound = []
        // If all players found the clueGiver's phrase
        if (
          // votes isn't an empty object
          Object.keys(round.votes).length !== 0 &&
          // clueGiver picked an actual pair
          typeof realPairThisRound !== 'undefined' &&
          // Every vote was for the real pair
          Object.values(round.votes).every(
            (guess) => guess === realPairThisRound
          )
        ) {
          historyThisRound.push(
            `Wow, everyone guessed ` +
              round.clueGiver +
              `'s actual pair '` +
              realPairThisRound +
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
        else if (Object.values(round.votes).includes(realPairThisRound)) {
          historyThisRound.push(
            round.clueGiver + `'s actual pair was '` + realPairThisRound + `'!`
          )
          // Award 3 pts to every guesser still in the game who guessed correctly
          Object.keys(leaderBoard).forEach((player) => {
            // Note that clueGiver does not vote
            if (round.votes[player] === realPairThisRound) {
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

.clearfix::after {
  content: ' ';
  display: block;
  height: 0;
  clear: both;
}
</style>
