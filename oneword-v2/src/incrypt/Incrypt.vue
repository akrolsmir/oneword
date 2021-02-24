<template>
  <BigColumn :showPanes="true">
    <template #right-pane>
      <Chatbox
        v-model="room.chatlog"
        :name="player.name"
        :room-id="room.name"
      />
    </template>

    <!-- Rules Notification -->
    <div class="modal" :class="{ 'is-active': showRules }">
      <div class="modal-background" @click="showRules = false"></div>
      <div class="modal-content">
        <div class="notification">
          <h2>Incrypt Rules</h2>
          Incrypt is a word game for two teams, based on
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://amzn.to/384qWYi"
            >Decrypto</a
          >.<br />
          Each spy incrypts three words by writing down three clues...<br />
          Too complex? Your own team won't get the message 🤦‍♀️<br />
          Too simple? The other team will intercept it! 👻<br />
          <br />
          <b>Picking clues</b><br />
          Your incryptions should relate to the <i>meaning</i> of each word.<br />
          NOT its <i>number</i>, or how the word <i>rhymes</i> or
          <i>sounds</i>.<br />
          Don't reuse words or past incryptions!<br />
          <br />
          <b>Game end</b><br />
          The game is over when either team has dropped or intercepted twice per
          player.<br />
          Your team gets {{ POINTS_PER_INTERCEPT }} points for an intercept, and
          loses {{ POINTS_PER_INTERCEPT }} for a dropped message.<br />
          Plus {{ POINTS_PER_GUESS }} bonus points for each word you can guess
          from their team!<br />
          <br /><br />
          <label class="is-block mb-2">Invite your friends to spectate!</label>
          <ShareLink />
          <button
            class="delete"
            aria-label="close"
            @click="showRules = false"
          ></button>
        </div>
      </div>
    </div>

    <!-- Alert spectators that the game can't be joined. -->
    <div
      v-if="!(isPlaying || room.state === 'NOT_STARTED')"
      class="notification is-danger is-light"
    >
      Hey {{ player.name }}! This game is currently in progress, but you can
      spectate as a member of <span>{{ room.blueTeam.name }}</span> team 🙂
    </div>

    <!-- Pre-game: Waiting for players -->
    <div v-if="room.state === 'NOT_STARTED'">
      <h2>Room: {{ room.name }}</h2>
      Incrypt is a word game for two teams, based on
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://amzn.to/384qWYi"
        >Decrypto</a
      >.<br />
      Each spy incrypts three words by writing down three clues...<br />
      Too complex? Your own team won't get the message 🤦‍♀️<br />
      Too simple? The other team will intercept it! 👻<br />
      <br />
    </div>
    <div v-if="room.state === 'NOT_STARTED'" class="box">
      <div class="columns">
        <div class="column" v-for="team in ['redTeam', 'blueTeam']">
          <h3>{{ room[team].name }} team: {{ players(team).join(', ') }}</h3>
          <br />
          <button
            class="button is-medium is-fullwidth"
            :class="team == 'redTeam' ? 'is-danger' : 'is-info'"
            @click="joinTeam(team)"
          >
            {{ !players(team).includes(player.name) ? 'Join' : 'Joined ✔️' }}
          </button>
        </div>
      </div>
      <div v-if="players('redTeam').length < 2">
        {{ room.redTeam.name }} team needs
        {{ 2 - players('redTeam').length }} more, before we can start...
      </div>
      <div v-else-if="players('blueTeam').length < 2">
        {{ room.blueTeam.name }} team needs
        {{ 2 - players('blueTeam').length }} more, before we can start...
      </div>
      <div v-else>
        Awesome! There are {{ players('redTeam').length }} players on
        {{ room.redTeam.name }} team and
        {{ players('blueTeam').length }} players on
        {{ room.blueTeam.name }} team. <br />
        Ready to start? <br />
        <br />
        <button class="button" @click="newRound">Start game!</button>
        <br /><br />
      </div>
      <div class="mb-2">Invite your friends to play!</div>
      <ShareLink />
    </div>

    <div v-if="room.state !== 'NOT_STARTED'" class="mb-2">
      <div class="has-text-right is-size-7 mb-1">
        <a @click="showRules = true">Rules</a>
      </div>

      <!-- Show the current state of the game -->
      <div class="has-text-centered" v-if="room.state !== 'FINALE'">
        Round {{ room.history.length + 1 }}:
        <span v-if="room.state === 'ENCODING'"><b>🔏 Incrypt</b></span>
        <span v-else>Incrypt</span> -
        <template v-if="room.history.length === 0">
          <span v-if="room.state === 'BOTH_DECODE'"><b>🔴🔵 Decrypt</b></span>
          <span v-else>Decrypt</span> -
        </template>
        <template v-else>
          <span v-if="room.state === 'RED_DECODE'"><b>🔴 Decrypt Red</b></span>
          <span v-else>Decrypt Red</span> -
          <span v-if="room.state === 'BLUE_DECODE'"
            ><b>🔵 Decrypt Blue</b></span
          >
          <span v-else>Decrypt Blue</span> -
        </template>
        <span v-if="room.state === 'DONE'"><b>✔️ Debrief</b></span>
        <span v-else>Debrief</span>

        <!-- Show the timer. -->
        <Timer
          class="mt-2"
          :length="room.timerLength"
          :on-finish="nextState"
          v-if="room.timerLength > 0 && room.state !== 'DONE'"
          :key="room.state"
        />
      </div>
    </div>

    <!-- Part 1: Spies are encoding their messages -->
    <div v-cloak v-if="room.state === 'ENCODING'">
      <div v-if="player.name === myTeam.round.spy" class="box">
        <h2>
          You are the {{ myTeam.name }} incrypter!<br />
          Write clues for "{{ myTeam.round.key.join(' - ') }}":
        </h2>
        <br />
        <div class="columns">
          <div class="column" v-for="(digit, i) in myTeam.round.key">
            <input
              class="input"
              :class="{ 'is-active': !player.encode[i] }"
              v-model="player.encode[i]"
              @keyup.enter="submitForMyTeam"
              @change="prefillEncode"
              :placeholder="`Clue for &quot;${myTeam.words[digit - 1]}&quot;`"
            />
            <br /><br />
            <b>{{ digit }} - {{ myTeam.words[digit - 1] }}</b>
            <ul>
              <li v-for="(entry, e) in room.history">
                <div v-if="entry[myTeamId].round.key.includes(digit)">
                  {{
                    entry[myTeamId].round.encode[
                      entry[myTeamId].round.key.indexOf(digit)
                    ]
                  }}
                </div>
              </li>
            </ul>
          </div>
        </div>
        <i
          >Don't forget the <a @click="showRules = true">rules</a>: pick
          meaningful clues!</i
        ><br />
        <!-- Doesn't work cuz disabled on last input: `:disabled="myTeam.round.encode.some(Boolean)` -->
        <button
          class="button is-fullwidth is-medium"
          :class="{
            'is-success is-light': myTeam.submitted,
            'is-focused': myTeam.round.encode.every(Boolean),
          }"
          @click="submitForMyTeam"
        >
          {{ myTeam.submitted ? 'Submitted ✔️' : 'Submit' }}
        </button>
      </div>
      <div v-else>
        <br />
        <h3>Waiting for {{ myTeam.round.spy }} to incrypt the key...</h3>
        Meanwhile, think of good incryptions, or try to guess the other team's
        words!
      </div>
    </div>
    <div
      v-if="['RED_DECODE', 'BLUE_DECODE', 'BOTH_DECODE'].includes(room.state)"
    >
      <!-- Parts 2 and 4: Other team tries to intercept -->
      <div v-if="myTeamId !== smugglersId" class="box">
        <!-- Section: Show the smugglers' code -->
        <h2>
          {{ otherTeam.round.spy }} clued "{{
            otherTeam.round.encode.join(' - ')
          }}" to {{ otherTeam.name }} team
        </h2>
        Guess which keyword each clue was for:
        <br /><br />
        <!-- Section: Vote for the intercept -->
        <div class="columns">
          <template v-for="(encoded, e) in otherTeam.round.encode">
            <div class="column-divider" v-if="e > 0"></div>
            <div class="column">
              <h3 class="has-text-centered">"{{ encoded }}"</h3>
              <div v-for="(word, w) in otherTeam.words">
                <button
                  class="button is-fullwidth"
                  :class="
                    voters('interceptVotes', e, w + 1).includes(player.name)
                      ? 'is-success'
                      : ''
                  "
                  @click="vote('interceptVotes', player.name, e, w + 1)"
                >
                  Keyword {{ w + 1 }}
                </button>
                <div class="mb-2">
                  <span
                    v-if="voters('interceptVotes', e, w + 1).length > 0"
                    class="is-size-7"
                    >Chosen by
                  </span>
                  <span
                    class="tag"
                    v-for="voter of voters('interceptVotes', e, w + 1)"
                    >{{ voter }}</span
                  >
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Section: See all past clues -->
        <div class="columns">
          <div class="column" v-for="(word, i) in otherTeam.words">
            <b>Keyword {{ i + 1 }}</b>
            <ul>
              <li v-for="(entry, e) in room.history">
                <div v-if="entry[other(myTeamId)].round.key.includes(i + 1)">
                  {{
                    entry[other(myTeamId)].round.encode[
                      entry[other(myTeamId)].round.key.indexOf(i + 1)
                    ]
                  }}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- TODO: Change button text to be "Submitted"? -->
        <button
          class="button is-fullwidth is-medium"
          :class="{
            'is-success is-light': myTeam.submitted,
            'is-focused': finishedVoting(
              otherTeam.round.interceptVotes,
              players(myTeamId)
            ),
          }"
          @click="submitForMyTeam"
          :disabled="
            !finishedVoting(otherTeam.round.interceptVotes, players(myTeamId))
          "
        >
          {{
            myTeam.submitted ? 'Submitted ✔️' : `Submit for ${myTeam.name} team`
          }}
        </button>
      </div>
      <!-- Parts 2 and 4: Meanwhile, the smugglers tries to decrypt the key -->
      <div v-else :class="{ box: player.name !== myTeam.round.spy }">
        <div v-if="player.name === myTeam.round.spy">
          <br />
          <h3>
            Waiting for your teammates to decrypt "{{
              myTeam.round.encode.join(' - ')
            }}"...
          </h3>
        </div>
        <div v-else>
          <h2>
            {{ myTeam.round.spy }} incrypted "{{
              myTeam.round.encode.join(' - ')
            }}"<br />
          </h2>
          For each clue, pick the matching keyword:
        </div>
        <br />
        <!-- (TODO: deduplicate or component-ize with above) -->
        <!-- Section: Vote for the code -->
        <div class="columns">
          <template v-for="(encoded, e) in myTeam.round.encode">
            <div class="column-divider" v-if="e > 0"></div>
            <div class="column">
              <h3 class="has-text-centered">"{{ encoded }}"</h3>
              <div v-for="(word, w) in myTeam.words">
                <button
                  class="button is-fullwidth"
                  :disabled="!decrypters(myTeamId).includes(player.name)"
                  :class="
                    voters('decodeVotes', e, w + 1).includes(player.name)
                      ? 'is-success'
                      : ''
                  "
                  @click="vote('decodeVotes', player.name, e, w + 1)"
                >
                  {{ word }}
                </button>
                <div class="mb-2">
                  <span
                    v-if="voters('decodeVotes', e, w + 1).length > 0"
                    class="is-size-7"
                    >Chosen by
                  </span>
                  <span
                    class="tag"
                    v-for="voter of voters('decodeVotes', e, w + 1)"
                    >{{ voter }}</span
                  >
                </div>
              </div>
            </div>
          </template>
        </div>

        <button
          v-if="decrypters(myTeamId).includes(player.name)"
          class="button is-fullwidth is-medium"
          :class="{
            'is-success is-light': myTeam.submitted,
            'is-focused': finishedVoting(
              myTeam.round.decodeVotes,
              decrypters(myTeamId)
            ),
          }"
          @click="submitForMyTeam"
          :disabled="
            !finishedVoting(myTeam.round.decodeVotes, decrypters(myTeamId))
          "
        >
          {{
            myTeam.submitted ? 'Submitted ✔️' : `Submit for ${myTeam.name} team`
          }}
        </button>
      </div>
    </div>
    <!-- Results for both teams! -->
    <div v-if="room.state === 'DONE'" class="box">
      <template v-for="team in ['redTeam', 'blueTeam']">
        <h2>
          "{{ room[team].round.encode.join(' - ') }}" was "{{
            room[team].round.key.join(' - ')
          }}"
        </h2>
        <div v-for="(vote, voter) in room[team].round.interceptVotes">
          <div v-if="keysEqual(vote, room[team].round.key)">
            👻 {{ voter }} intercepted the message!
          </div>
        </div>
        <div v-for="(vote, voter) in room[team].round.decodeVotes">
          <div v-if="!keysEqual(vote, room[team].round.key)">
            🤦‍♀️ {{ voter }} thought it was "{{ vote.join(' - ') }}"...
          </div>
        </div>
        <div v-if="decodedCorrectly(team)">
          ✔️ {{ room[team].name }} team decrypted {{ room[team].round.spy }}'s
          clues!
        </div>
        <br /><br />
      </template>
      <b v-if="gameOver">Ready for the final showdown?</b><br />
      <button class="button" @click="newRound">
        {{ gameOver ? 'Final round' : 'Next round' }}
      </button>
    </div>

    <!-- Game end -->
    <div v-if="room.state === 'FINALE'" class="box">
      <div>
        <!-- Prompt each team to submit their guesses -->
        <div v-if="!(room.redTeam.submitted && room.blueTeam.submitted)">
          <h2>Final round</h2>
          <b>Guess {{ otherTeam.name }} team's words!</b><br />

          <KeywordCards
            :room="room"
            :team="other(myTeamId)"
            :my-team-id="myTeamId"
          />

          <!-- Allow guessing of the other team's words -->
          <div class="words columns">
            <div class="words column" v-for="(word, i) in otherTeam.words">
              <input
                class="input mt-3"
                v-model="player.wordGuesses[i]"
                @change="prefillGuesses"
                type="text"
                :placeholder="`Word ${i + 1} guess`"
              />
            </div>
          </div>

          <br />
          Has everyone on your team entered finished guessing?<br />
          <!-- TODO: Disallow guess submission when someone isn't done yet -->
          <button
            class="button is-fullwidth"
            :class="{ 'is-success is-light': myTeam.submitted }"
            @click="submitForMyTeam"
          >
            Submit your team's guesses
          </button>
        </div>
        <!-- Show the results -->
        <div v-else>
          <template v-for="team in ['redTeam', 'blueTeam']">
            <b>{{ room[team].name }} team has {{ points(team) }} points.</b
            ><br />
            + {{ numCorrectGuesses(team) * POINTS_PER_GUESS }} =
            {{ POINTS_PER_GUESS }} × {{ numCorrectGuesses(team) }} 🔮 correct
            guesses<br />
            +
            {{ intercepted(other(team), room.history) * POINTS_PER_INTERCEPT }}
            = {{ POINTS_PER_INTERCEPT }} ×
            {{ intercepted(other(team), room.history) }} 👻 interceptions<br />
            − {{ dropped(team, room.history) * POINTS_PER_INTERCEPT }} =
            {{ POINTS_PER_INTERCEPT }} × {{ dropped(team, room.history) }} 🤦‍♀️
            dropped messages<br />
            <br />

            <KeywordCards :room="room" :team="team" />
            <!-- Show the words, clues, and guesses. TODO: Dedupe with below -->
            <br /><br />
          </template>
          <div v-if="points('redTeam') === points('blueTeam')">
            <h2>It's a tie!</h2>
            Wow, what are the chances? Both teams win!
          </div>
          <div v-else>
            <h2>
              {{
                points('redTeam') > points('blueTeam')
                  ? room.redTeam.name
                  : room.blueTeam.name
              }}
              team wins!
            </h2>
            Congratulations! GG and well played~
          </div>
          <!-- TODO: upsell? -->
          Want to go again?
          <br /><br />
          <button class="button" @click="createNewRoom">
            New room: {{ generateNextRoomName(room.nextRoomName || room.name) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Team rosters -->
    <div v-if="room.state !== 'NOT_STARTED'" class="mb-2 mt-6">
      <div class="tabs is-toggle is-fullwidth">
        <li
          v-for="team in ['redTeam', 'blueTeam']"
          :class="previewTeamId === team ? 'is-active' : ''"
          :id="team"
        >
          <a @click="previewTeamId = team">
            <div>
              <h3>
                {{ room[team].name }} team: {{ players(team).join(', ') }}
              </h3>
              <!-- Show the current scores on each team -->
              👻 {{ intercepted(other(team), room.history) }} interceptions ({{
                2 * players(team).length
              }}
              to win)
              <br />
              🤦‍♀️ {{ dropped(team, room.history) }} dropped messages ({{
                2 * players(team).length - 2
              }}
              to lose)
              <br />
            </div>
          </a>
        </li>
      </div>
    </div>

    <!-- Show the words and all clues/guesses so far -->
    <div v-if="room.state !== 'NOT_STARTED'" class="mb-6">
      <KeywordCards
        :room="room"
        :team="previewTeamId"
        :my-team-id="myTeamId"
      ></KeywordCards>

      <!-- Allow guessing of the other team's words -->
      <div v-if="previewTeamId !== myTeamId" class="words columns">
        <div
          class="words column"
          v-for="(word, i) in room[previewTeamId].words"
        >
          <input
            class="input mt-3"
            v-model="player.wordGuesses[i]"
            @change="prefillGuesses"
            type="text"
            :placeholder="`Word ${i + 1} guess`"
          />
        </div>
      </div>
    </div>

    <!-- History -->
    <div v-if="room.history.length > 0">
      <h2>History</h2>
      <template v-for="(past, p) of room.history.slice().reverse()">
        <div class="columns">
          <div class="column" v-for="team in ['redTeam', 'blueTeam']">
            <h3>
              Round {{ room.history.length - p }}: {{ room[team].name }} team
            </h3>
            <table class="table is-fullwidth">
              <tbody>
                <thead>
                  <th>🔏 {{ past[team].round.spy }}</th>
                  <td v-for="(encoded, e) in past[team].round.encode">
                    {{ encoded }}
                  </td>
                </thead>

                <tr v-for="(vote, voter) in past[team].round.interceptVotes">
                  <th>{{ team === 'redTeam' ? '🔵' : '🔴' }} {{ voter }}</th>
                  <td v-for="v in vote">{{ v }}</td>
                </tr>
                <tr v-for="(vote, voter) in past[team].round.decodeVotes">
                  <th>{{ team === 'redTeam' ? '🔴' : '🔵' }} {{ voter }}</th>
                  <td v-for="v in vote">{{ v }}</td>
                </tr>
                <tr>
                  <th>✔️</th>
                  <td v-for="k in past[team].round.key">{{ k }}</td>
                </tr>
              </tbody>
            </table>
            <div v-for="(vote, voter) in past[team].round.interceptVotes">
              <div v-if="keysEqual(vote, past[team].round.key)">
                👻 {{ voter }} intercepted the message!
              </div>
            </div>
            <div v-for="(vote, voter) in past[team].round.decodeVotes">
              <div v-if="!keysEqual(vote, past[team].round.key)">
                🤦‍♀️ {{ voter }} thought it was "{{ vote.join(' - ') }}"...
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Mod tools -->
    <div class="notification mt-4 mb-6" v-if="isMod">
      <h2>Mod tools</h2>
      <br />
      <div class="columns">
        <div class="column">
          <button class="button is-small is-danger" @click="nextState">
            Next stage
          </button>
          <button
            v-if="devMode"
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
          0 secs (timers off) for a new group<br />
          120 secs for an experienced group<br />
        </div>
      </div>
    </div>
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import KeywordCards from './KeywordCards.vue'
import ShareLink from '../components/ShareLink.vue'
import Timer from '../components/Timer.vue'
import Chatbox from '../components/Chatbox.vue'

import {
  unpush,
  other,
  keysEqual,
  randomWords,
  randomKey,
  nextSpy,
  finishedVoting,
  intercepted,
  dropped,
  checkGuesses,
  generateNextRoomName,
} from './incrypt-utils.js'
import {
  setRoom,
  updateRoom,
  getRoom,
  listenRoom,
  listenForLogin,
  updateUserGame,
} from '../firebase/network.js'
import { randomWord } from '../oneword/oneword-utils'
import { getIn, sanitize } from '../utils'
import { inject } from 'vue'

// TODO: This is kind of weird; intercepts should be worth less than drops?
const POINTS_PER_INTERCEPT = 10
const POINTS_PER_GUESS = 2
const NO_VOTE = '?'
const KEY_LENGTH = 3
const WORDS_SHOWN = 4 // TODO: Call these "keywords"?
// Initialize to empty strings, since Firebase won't handle 'undefined'
function emptyKey() {
  // TODO: Rename to emptyEncode?
  return Array(KEY_LENGTH).fill('')
}
function emptyGuesses() {
  return Array(WORDS_SHOWN).fill('')
}
function emptyDecodeVotes(players) {
  function emptyVotes() {
    return Array(KEY_LENGTH).fill(NO_VOTE)
  }
  return Object.fromEntries(players.map((player) => [player, emptyVotes()]))
}
/**
Room: {
  name: 'apple',
  state: 'ENCODING', // or 'NOT_STARTED'/'RED_DECODE'/'BLUE_DECODE'/'BOTH_DECODE/'DONE'/'FINALE'
  redTeam: {
    // Red team goes first on intercepts (TODO alternate?)
    // TODO name: 'Ugliest Carriages', emoji: '🤦‍♀️', color: '#FF4422'
    words: ['student', 'bible', 'catholic', 'eraser'],
    wordGuesses: {
      carol: ['dumb', 'dict', 'deacon', 'deer'],
      ...
    },
    round: {
      spy: 'alice',
      key: [4, 1, 2], // sometimes referred to as "message"
      encode: ['gone', 'lazy', 'book'],
      interceptVotes: {
        carol: [2, 3, 1],
        dave: [2, 4, 1],
      },
      decodeVotes: {
        bob: [3, 1, 2],
      },
    },
    // Whether the team has confirmed their encode/intercept/decode/guess
    submitted: false,
  },
  blueTeam: ...
  history: [{
    redTeam: { round: {...} }
    blueTeam: { round: {...} }
  }, ...],
  people: {
    alice: {
      id: 'ff0f9dsKDF9' // or '' for anonymous
      team: 'redTeam' // or '' for spectators?
    }, ...
  }
}
*/
export default {
  components: {
    BigColumn,
    KeywordCards,
    ShareLink,
    Timer,
    Chatbox,
  },
  setup() {
    return { user: inject('currentUser') }
  },
  data() {
    return {
      player: {
        name: '',
        // Local values & UI controls, before they get uploaded
        encode: emptyKey(),
        wordGuesses: emptyGuesses(),
        timerLength: 0,
      },
      room: {
        name: randomWord('adjectives') + '-' + randomWord('nouns'),
        people: {},
        redTeam: {},
        blueTeam: {},
        history: [],
      },
      user: {},
      showRules: false,
      previewTeam: '',
      KEY_LENGTH,
      WORDS_SHOWN,
      POINTS_PER_INTERCEPT,
      POINTS_PER_GUESS,
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
    'room.state'(state) {
      this.$emit('reset-timer')
      // Clean up past inputs on each new round.
      if (state === 'DONE') {
        this.player.encode = emptyKey()
      }
    },
    async room(newRoom, oldRoom) {
      // oldRoom.state means that we didn't just enter this room (eg from home page)
      // newRoom.nextRoomName existing and changing means all clients should move to the new room.
      if (
        oldRoom.state &&
        newRoom.nextRoomName &&
        newRoom.nextRoomName !== oldRoom.nextRoomName
      ) {
        this.room.name = newRoom.nextRoomName
        await this.enterRoom()
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
    async joinGame() {
      // Unused in Incrypt, since players manually join a team
    },
    async resetRoom() {
      this.room = {
        name: this.room.name,
        state: 'NOT_STARTED',
        redTeam: {
          name: 'Red',
          words: randomWords(4),
          wordGuesses: {},
          // Current round
          round: {},
          submitted: false,
        },
        blueTeam: {
          name: 'Blue',
          words: randomWords(4),
          wordGuesses: {},
          round: {},
          submitted: false,
        },
        history: [],
        timerLength: 0,
        public: true,
        lastUpdateTime: Date.now(),
        people: {},
      }
      await setRoom(this.room)
    },
    async nextState() {
      if (this.room.state === 'FINALE') {
        return
      }
      this.room.redTeam.submitted = false
      this.room.blueTeam.submitted = false
      // Figure out what the next state should be, then go there.
      const next = {
        ENCODING: this.room.history.length > 0 ? 'RED_DECODE' : 'BOTH_DECODE',
        RED_DECODE: 'BLUE_DECODE',
        // TODO RED_DONE?
        BLUE_DECODE: 'DONE',
        BOTH_DECODE: 'DONE',
        DONE: 'ENCODING',
      }
      this.room.state = next[this.room.state]
      const toUpdate = ['state', 'redTeam.submitted', 'blueTeam.submitted']

      if (this.room.state === 'DONE') {
        // Add current round to history on DONE, to update victory conditions
        this.room.history.push({
          redTeam: {
            round: this.room.redTeam.round,
          },
          blueTeam: {
            round: this.room.blueTeam.round,
          },
        })
        toUpdate.push('history')
      }
      await this.saveRoom(...toUpdate)
    },
    async joinTeam(team) {
      this.room.people[this.player.name] = {
        id: this.user.id || '',
        team,
      }
      await this.saveRoom(`people.${this.player.name}`)
    },
    async prefillEncode() {
      this.myTeam.round.encode = this.player.encode
      await this.saveRoom(`${this.myTeamId}.round.encode`)
      // Store this for user profiles, but don't await for the result
      updateUserGame(this.user.id, this.room.name)
    },
    async submitForMyTeam() {
      this.myTeam.submitted = true
      // Always write to Firestore (since FINALE needs to see submitted)
      // TODO: alternatively, have FINALE => GAME_OVER? Then only do this in `else`
      await this.saveRoom(`${this.myTeamId}.submitted`)

      // If both spies are done, move to intercepting (or straight to decoding in round 1)
      if (this.myTeam.submitted && this.otherTeam.submitted) {
        await this.nextState()
      }
    },
    async prefillGuesses() {
      this.otherTeam.wordGuesses[this.player.name] = this.player.wordGuesses
      await this.saveRoom(
        `${other(this.myTeamId)}.wordGuesses.${this.player.name}`
      )

      updateUserGame(this.user.id, this.room.name)
    },
    async newRound() {
      this.room.lastUpdateTime = Date.now()

      if (this.gameOver) {
        this.room.state = 'FINALE'
      } else {
        this.room.state = 'ENCODING'
        this.room.redTeam.round = {
          spy: nextSpy(this.room.redTeam.round.spy, this.players('redTeam')),
          key: randomKey(this.KEY_LENGTH, this.WORDS_SHOWN),
          encode: emptyKey(),
          interceptVotes: {},
        }
        this.room.blueTeam.round = {
          spy: nextSpy(this.room.blueTeam.round.spy, this.players('blueTeam')),
          key: randomKey(this.KEY_LENGTH, this.WORDS_SHOWN),
          encode: emptyKey(),
          interceptVotes: {},
        }
        // decrypters() needs round.spy to be filled in, so we do this last
        this.room.redTeam.round.decodeVotes = emptyDecodeVotes(
          this.decrypters('redTeam')
        )
        this.room.blueTeam.round.decodeVotes = emptyDecodeVotes(
          this.decrypters('blueTeam')
        )
      }

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
    async vote(
      voteType /* decodeVotes or interceptVotes */,
      name,
      keyIndex,
      wordIndex
    ) {
      const team =
        voteType === 'decodeVotes' ? this.myTeamId : other(this.myTeamId)
      if (!this.room[team].round[voteType][name]) {
        // Need to fill in a dummy value so Firestore is happy
        // TODO: Once we also initialize emptyInterceptVotes, this will no longer be needed
        this.room[team].round[voteType][name] = Array(this.KEY_LENGTH).fill(
          NO_VOTE
        )
      }
      const currentVote = this.room[team].round[voteType][name][keyIndex]
      // If this is the second click on the same vote, deselect that vote.
      const newVote = currentVote === wordIndex ? NO_VOTE : wordIndex
      this.room[team].round[voteType][name][keyIndex] = newVote
      await this.saveRoom(`${team}.round.${voteType}.${name}`)

      updateUserGame(this.user.id, this.room.name)
    },
    voters(voteType, keyIndex, wordIndex) {
      const team =
        voteType === 'decodeVotes' ? this.myTeamId : other(this.myTeamId)
      return Object.entries(this.room[team].round[voteType] || {})
        .map(([player, vote]) => {
          return vote[keyIndex] === wordIndex ? player : null
        })
        .filter((player) => player)
    },
    decodedCorrectly(team) {
      return Object.values(this.room[team].round.decodeVotes).every((vote) =>
        keysEqual(vote, this.room[team].round.key)
      )
    },
    other,
    keysEqual,
    finishedVoting,
    intercepted,
    dropped,
    points(team) {
      const delta =
        intercepted(other(team), this.room.history) -
        dropped(team, this.room.history)
      return (
        POINTS_PER_INTERCEPT * delta +
        POINTS_PER_GUESS * this.numCorrectGuesses(team)
      )
    },
    numCorrectGuesses(team) {
      const SUM = (a, b) => a + b
      return Object.entries(this.room[other(team)].wordGuesses)
        .map(([player, guesses]) =>
          checkGuesses(guesses, this.room[other(team)].words)
        )
        .reduce(SUM, 0)
    },
    players(team) {
      return Object.entries(this.room.people)
        .map(([name, player]) => (player.team === team ? name : ''))
        .filter(Boolean)
    },
    decrypters(team) {
      // Exclude the spy, as the are not decoding
      const decrypters = this.players(team)
      unpush(decrypters, this.room[team].round.spy)
      return decrypters
    },
    // Used to list who is there on the front page
    allPlayers(room) {
      return Object.entries(room.people)
        .map(([name, player]) =>
          ['redTeam', 'blueTeam'].includes(player.team) ? name : ''
        )
        .filter(Boolean)
        .join(', ')
    },
    async createNewRoom() {
      // Telling everyone to enter the new room is race-y, but enterRoom() is idempotent so wtv.
      const nextRoomName = generateNextRoomName(
        this.room.nextRoomName || this.room.name
      )
      await updateRoom(this.room, { nextRoomName })
    },
    generateNextRoomName,
  },
  computed: {
    devMode() {
      return (
        location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      )
    },
    isMod() {
      // For now, the first red team player is always the mod. Also me.
      return (
        this.players('redTeam').indexOf(this.player.name) === 0 ||
        this.player.name === 'Austin'
      )
    },
    isRed() {
      return this.players('redTeam').includes(this.player.name)
    },
    isPlaying() {
      return this.isRed || this.players('blueTeam').includes(this.player.name)
    },
    myTeamId() {
      return this.isRed ? 'redTeam' : 'blueTeam'
    },
    // Which team's cards the player is looking at
    previewTeamId: {
      get() {
        return this.previewTeam || this.myTeamId
      },
      set(id) {
        this.previewTeam = id
      },
    },
    myTeam() {
      return this.room[this.myTeamId]
    },
    otherTeam() {
      return this.room[other(this.myTeamId)]
    },
    allInterceptsIn() {
      // Extracted; while inlined there was a Vue update bug (???)
      return this.finishedVoting(
        this.otherTeam.round.interceptVotes,
        this.players(this.myTeamId)
      )
    },
    smugglersId() {
      // AKA interceptees
      const map = {
        RED_DECODE: 'redTeam',
        BLUE_DECODE: 'blueTeam',
        BOTH_DECODE: this.myTeamId,
      }
      return map[this.room.state]
    },
    gameOver() {
      return (
        // Game is over when every player on a team has (on average) intercepted
        // twice, or dropped two messages
        // TODO: could extract 2 to a constant
        intercepted('redTeam', this.room.history) >=
          2 * this.players('blueTeam').length ||
        dropped('redTeam', this.room.history) >=
          2 * this.players('redTeam').length - 2 ||
        intercepted('blueTeam', this.room.history) >=
          2 * this.players('redTeam').length ||
        dropped('blueTeam', this.room.history) >=
          2 * this.players('blueTeam').length - 2
      )
    },
  },
}
</script>

<style scoped>
.background {
  background-color: #d8d4d5;
}

h1,
h2,
h3 {
  font-family: 'Merienda One', cursive;
}

h1 {
  font-size: 40px;
}

h2 {
  margin-top: 16px;
  font-size: 24px;
}

/* Override with a red color, when Red Team roster is selected */
.tabs.is-toggle li#redTeam.is-active a {
  background-color: crimson;
  border-color: crimson;
}

/* Narrow the gap between words */
.words.columns {
  margin: -0.25rem;
}

.words.columns > .column {
  padding: 0.25rem;
}

.words.notification {
  padding: 1rem 1.25rem 1rem 1.25rem;
}

.column-divider {
  display: block;
  width: 1px;
  background: #dbdbdb;
  margin: 0.5rem 0 1rem 0;
}

.table {
  background-color: #fff6;
}
</style>
